import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { signSession, verifySession, SESSION_COOKIE } from '@/lib/auth'

// ---------- helpers ----------
function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

function ser(doc) {
  if (doc == null) return doc
  if (doc instanceof ObjectId) return doc.toString()
  if (doc instanceof Date) return doc.toISOString()
  if (Array.isArray(doc)) return doc.map(ser)
  if (typeof doc === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(doc)) {
      if (k === '_id') out.id = v instanceof ObjectId ? v.toString() : v
      else if (k === 'passwordHash') continue
      else out[k] = ser(v)
    }
    return out
  }
  return doc
}

function toId(v) {
  try { return new ObjectId(String(v)) } catch { return null }
}

function json(data, status = 200) {
  return cors(NextResponse.json(data, { status }))
}

async function getSessionUser(request, db) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const payload = verifySession(token)
  if (!payload?.userId) return null
  const _id = toId(payload.userId)
  if (!_id) return null
  return db.collection('users').findOne({ _id })
}

// Shared guard: returns { user } or { error, status }
async function requireUser(request, db, { role } = {}) {
  const user = await getSessionUser(request, db)
  if (!user) return { error: 'Not authenticated', status: 401 }
  if (role && user.role !== role) return { error: 'Forbidden', status: 403 }
  return { user }
}

async function getProfileMap(db, userIds) {
  const profiles = await db.collection('userProfiles')
    .find({ userId: { $in: userIds } }).toArray()
  const map = {}
  for (const p of profiles) map[p.userId.toString()] = p
  return map
}

function publicName(user) {
  const last = user.lastName || ''
  return { firstName: user.firstName, lastName: last ? last[0] + '.' : '' }
}

// ---------- main router ----------
export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method
  const seg = path

  try {
    const db = await getDb()

    // ---- health ----
    if ((route === '/' || route === '/root') && method === 'GET') return json({ message: 'Resident Hub API' })

    // ================= AUTH =================
    if (route === '/auth/sso' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const role = body.role === 'STAFF' ? 'STAFF' : 'RESIDENT'
      const demoEmail = role === 'STAFF' ? 'demo.staff@residenthub.ca' : 'demo.resident@residenthub.ca'
      let user = await db.collection('users').findOne({ email: demoEmail })
      if (!user) user = await db.collection('users').findOne({ role })
      if (!user) return json({ error: 'No seeded user found. Run the seed script.' }, 404)
      const token = signSession({ userId: user._id.toString(), role: user.role, propertyId: user.propertyId.toString() })
      const res = json({ user: ser(user) })
      res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
      return res
    }

    if (route === '/auth/session' && method === 'GET') {
      const user = await getSessionUser(request, db)
      if (!user) return json({ user: null })
      const property = await db.collection('properties').findOne({ _id: user.propertyId })
      return json({ user: ser(user), property: ser(property) })
    }

    if (route === '/auth/logout' && method === 'POST') {
      const res = json({ ok: true })
      res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
      return res
    }

    // ================= ME =================
    if (route === '/me' && method === 'GET') {
      const g = await requireUser(request, db)
      if (g.error) return json({ error: g.error }, g.status)
      const profile = await db.collection('userProfiles').findOne({ userId: g.user._id })
      const property = await db.collection('properties').findOne({ _id: g.user.propertyId })
      return json({ user: ser(g.user), profile: ser(profile), property: ser(property) })
    }

    if (route === '/me' && method === 'PATCH') {
      const g = await requireUser(request, db)
      if (g.error) return json({ error: g.error }, g.status)
      const body = await request.json().catch(() => ({}))
      const userSet = {}
      if (typeof body.isOpenToMeeting === 'boolean') userSet.isOpenToMeeting = body.isOpenToMeeting
      if (typeof body.firstName === 'string') userSet.firstName = body.firstName
      if (Object.keys(userSet).length) await db.collection('users').updateOne({ _id: g.user._id }, { $set: userSet })
      const profSet = {}
      for (const f of ['bio', 'photoUrl', 'favoriteSpotInBuilding']) {
        if (typeof body[f] === 'string') profSet[f] = body[f]
      }
      if (Array.isArray(body.hobbies)) profSet.hobbies = body.hobbies
      if (Array.isArray(body.interests)) profSet.interests = body.interests
      if (Object.keys(profSet).length) await db.collection('userProfiles').updateOne({ userId: g.user._id }, { $set: profSet }, { upsert: true })
      const user = await db.collection('users').findOne({ _id: g.user._id })
      const profile = await db.collection('userProfiles').findOne({ userId: g.user._id })
      return json({ user: ser(user), profile: ser(profile) })
    }

    // ================= DISCOVER =================
    if (route === '/discover' && method === 'GET') {
      const g = await requireUser(request, db, { role: 'RESIDENT' })
      if (g.error) return json({ error: g.error }, g.status)
      const sp = request.nextUrl.searchParams
      const hobby = sp.get('hobby')
      const interest = sp.get('interest')
      const recency = sp.get('recency')

      // BUILDING ISOLATION enforced in query: same propertyId only + consent gate.
      const users = await db.collection('users').find({
        propertyId: g.user.propertyId,
        role: 'RESIDENT',
        isOpenToMeeting: true,
        _id: { $ne: g.user._id },
      }).toArray()

      const profileMap = await getProfileMap(db, users.map(u => u._id))
      let cards = users.map(u => {
        const p = profileMap[u._id.toString()] || {}
        const n = publicName(u)
        return {
          id: u._id.toString(),
          firstName: n.firstName,
          lastName: n.lastName,
          unitNumber: u.unitNumber,
          bio: p.bio || '',
          hobbies: p.hobbies || [],
          interests: p.interests || [],
          photoUrl: p.photoUrl || '',
          moveInDate: p.moveInDate ? new Date(p.moveInDate).toISOString() : null,
          favoriteSpotInBuilding: p.favoriteSpotInBuilding || '',
        }
      })

      if (hobby) cards = cards.filter(c => c.hobbies.includes(hobby))
      if (interest) cards = cards.filter(c => c.interests.includes(interest))
      if (recency === 'recent') {
        const cutoff = Date.now() - 120 * 24 * 60 * 60 * 1000
        cards = cards.filter(c => c.moveInDate && new Date(c.moveInDate).getTime() >= cutoff)
      }
      cards.sort((a, b) => (new Date(b.moveInDate || 0)) - (new Date(a.moveInDate || 0)))

      const allHobbies = [...new Set(Object.values(profileMap).flatMap(p => p.hobbies || []))].sort()
      const allInterests = [...new Set(Object.values(profileMap).flatMap(p => p.interests || []))].sort()
      return json({ residents: cards, facets: { hobbies: allHobbies, interests: allInterests } })
    }

    // ================= RESIDENT DASHBOARD (read-only aggregate) =================
    if (route === '/dashboard' && method === 'GET') {
      const g = await requireUser(request, db, { role: 'RESIDENT' })
      if (g.error) return json({ error: g.error }, g.status)
      const pid = g.user.propertyId
      const me = g.user._id

      const others = await db.collection('users').find({ propertyId: pid, role: 'RESIDENT', isOpenToMeeting: true, _id: { $ne: me } }).toArray()
      const profMap = await getProfileMap(db, others.map(u => u._id))
      let newNeighbours = others.map(u => {
        const p = profMap[u._id.toString()] || {}
        const n = publicName(u)
        return { id: u._id.toString(), firstName: n.firstName, lastName: n.lastName, unitNumber: u.unitNumber, photoUrl: p.photoUrl || '', hobbies: p.hobbies || [], bio: p.bio || '', moveInDate: p.moveInDate ? new Date(p.moveInDate).toISOString() : null }
      })
      newNeighbours.sort((a, b) => new Date(b.moveInDate || 0) - new Date(a.moveInDate || 0))
      newNeighbours = newNeighbours.slice(0, 8)

      const evs = await db.collection('eventIdeas').find({ propertyId: pid }).toArray()
      const staffIds = evs.map(e => e.createdByStaffId).filter(Boolean)
      const staff = await db.collection('users').find({ _id: { $in: staffIds } }).toArray()
      const sMap = {}; for (const s of staff) sMap[s._id.toString()] = s
      const upcomingEvents = evs.map(e => ({
        id: e._id.toString(), title: e.title, description: e.description, tag: e.suggestedFromInterestTag,
        scheduledFor: e.scheduledFor ? new Date(e.scheduledFor).toISOString() : null,
        host: sMap[e.createdByStaffId?.toString()] ? `${sMap[e.createdByStaffId.toString()].firstName} ${sMap[e.createdByStaffId.toString()].lastName}` : 'Community team',
      })).sort((a, b) => new Date(a.scheduledFor || 0) - new Date(b.scheduledFor || 0))

      const conns = await db.collection('connections').find({ status: 'PENDING', $or: [{ userAId: me }, { userBId: me }] }).toArray()
      const incoming = conns.filter(c => c.requesterId && c.requesterId.toString() !== me.toString())
      const reqUserIds = incoming.map(c => c.requesterId)
      const reqUsers = await db.collection('users').find({ _id: { $in: reqUserIds } }).toArray()
      const reqProfMap = await getProfileMap(db, reqUserIds)
      const ruMap = {}; for (const u of reqUsers) ruMap[u._id.toString()] = u
      const pendingRequests = incoming.map(c => {
        const u = ruMap[c.requesterId.toString()]; if (!u) return null
        const p = reqProfMap[u._id.toString()] || {}
        const n = publicName(u)
        return { connectionId: c._id.toString(), id: u._id.toString(), firstName: n.firstName, lastName: n.lastName, unitNumber: u.unitNumber, photoUrl: p.photoUrl || '', hobbies: p.hobbies || [] }
      }).filter(Boolean)

      return json({ newNeighbours, upcomingEvents, pendingRequests })
    }

    // ================= RESIDENT PROFILE =================
    if (seg[0] === 'residents' && seg[1] && method === 'GET') {
      const g = await requireUser(request, db)
      if (g.error) return json({ error: g.error }, g.status)
      const targetId = toId(seg[1])
      if (!targetId) return json({ error: 'Invalid id' }, 400)
      const target = await db.collection('users').findOne({ _id: targetId })
      if (!target) return json({ error: 'Not found' }, 404)
      // BUILDING ISOLATION: viewer must be in same property as target.
      if (target.propertyId.toString() !== g.user.propertyId.toString()) return json({ error: 'Forbidden' }, 403)
      const profile = await db.collection('userProfiles').findOne({ userId: target._id })
      const property = await db.collection('properties').findOne({ _id: target.propertyId })
      return json({
        resident: {
          id: target._id.toString(),
          firstName: target.firstName,
          lastName: target.lastName,
          unitNumber: target.unitNumber,
          role: target.role,
          isOpenToMeeting: target.isOpenToMeeting,
        },
        profile: ser(profile),
        property: ser(property),
        viewerRole: g.user.role,
        isSelf: target._id.toString() === g.user._id.toString(),
      })
    }

    // ================= REPORTS (create) =================
    if (route === '/reports' && method === 'POST') {
      const g = await requireUser(request, db)
      if (g.error) return json({ error: g.error }, g.status)
      const body = await request.json().catch(() => ({}))
      const validReasons = ['HARASSMENT', 'SPAM', 'INAPPROPRIATE', 'SAFETY_CONCERN', 'OTHER']
      if (!validReasons.includes(body.reason)) return json({ error: 'Invalid reason' }, 400)
      const reportedUserId = toId(body.reportedUserId)
      if (!reportedUserId) return json({ error: 'reportedUserId required' }, 400)
      const report = {
        reporterId: g.user._id,
        reportedUserId,
        connectionId: body.connectionId ? toId(body.connectionId) : null,
        messageId: body.messageId ? toId(body.messageId) : null,
        reason: body.reason,
        details: body.details || '',
        status: 'OPEN',
        createdAt: new Date(),
        resolvedAt: null,
        resolvedByStaffId: null,
      }
      const r = await db.collection('reports').insertOne(report)
      return json({ ok: true, id: r.insertedId.toString(), message: 'Thanks — our community team will review this within 24 hours.' })
    }

    // ================= STAFF: OVERVIEW =================
    if (route === '/staff/overview' && method === 'GET') {
      const g = await requireUser(request, db, { role: 'STAFF' })
      if (g.error) return json({ error: g.error }, g.status)
      const pid = g.user.propertyId
      const property = await db.collection('properties').findOne({ _id: pid })

      const residents = await db.collection('users').find({ propertyId: pid, role: 'RESIDENT' }).toArray()
      const residentIds = new Set(residents.map(r => r._id.toString()))
      const totalResidents = residents.length
      const openCount = residents.filter(r => r.isOpenToMeeting).length
      const pctOpen = totalResidents ? Math.round((openCount / totalResidents) * 100) : 0

      const connections = await db.collection('connections').find({}).toArray()
      const inProp = (uid) => residentIds.has(uid.toString())
      const propConnections = connections.filter(c => inProp(c.userAId) && inProp(c.userBId))
      const activeConnections = propConnections.filter(c => c.status === 'ACCEPTED').length
      const pendingConnections = propConnections.filter(c => c.status === 'PENDING').length

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const propConnIds = propConnections.map(c => c._id)
      const msgs = await db.collection('messages').find({ connectionId: { $in: propConnIds } }).toArray()
      const messagesThisWeek = msgs.filter(m => new Date(m.timestamp) >= weekAgo).length

      const reports = await db.collection('reports').find({}).toArray()
      const propReports = reports.filter(r => inProp(r.reportedUserId) || inProp(r.reporterId))
      const openReports = propReports.filter(r => r.status === 'OPEN' || r.status === 'REVIEWING').length

      return json({
        property: ser(property),
        metrics: { totalResidents, pctOpenToMeeting: pctOpen, openToMeetingCount: openCount, activeConnections, pendingConnections, messagesThisWeek, openReports },
      })
    }

    // ================= STAFF: RESIDENTS =================
    if (route === '/staff/residents' && method === 'GET') {
      const g = await requireUser(request, db, { role: 'STAFF' })
      if (g.error) return json({ error: g.error }, g.status)
      const residents = await db.collection('users').find({ propertyId: g.user.propertyId, role: 'RESIDENT' }).toArray()
      const profileMap = await getProfileMap(db, residents.map(r => r._id))
      const rows = residents.map(u => {
        const p = profileMap[u._id.toString()] || {}
        return {
          id: u._id.toString(),
          firstName: u.firstName,
          lastName: u.lastName,
          unitNumber: u.unitNumber,
          isOpenToMeeting: u.isOpenToMeeting,
          hobbies: p.hobbies || [],
          interests: p.interests || [],
          moveInDate: p.moveInDate ? new Date(p.moveInDate).toISOString() : null,
        }
      })
      return json({ residents: rows })
    }

    // ================= STAFF: REPORTS =================
    if (route === '/staff/reports' && method === 'GET') {
      const g = await requireUser(request, db, { role: 'STAFF' })
      if (g.error) return json({ error: g.error }, g.status)
      const residents = await db.collection('users').find({ propertyId: g.user.propertyId }).toArray()
      const idSet = new Set(residents.map(r => r._id.toString()))
      const reports = await db.collection('reports').find({}).sort({ createdAt: -1 }).toArray()
      const propReports = reports.filter(r => idSet.has(r.reportedUserId?.toString()) || idSet.has(r.reporterId?.toString()))

      const userIds = [...new Set(propReports.flatMap(r => [r.reporterId?.toString(), r.reportedUserId?.toString(), r.resolvedByStaffId?.toString()]).filter(Boolean))].map(toId)
      const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray()
      const uMap = {}
      for (const u of users) uMap[u._id.toString()] = u

      const rows = []
      for (const r of propReports) {
        const reporter = uMap[r.reporterId?.toString()]
        const reported = uMap[r.reportedUserId?.toString()]
        let snippet = null
        if (r.messageId) {
          const msg = await db.collection('messages').findOne({ _id: r.messageId })
          if (msg) snippet = { content: msg.content, attachedToReport: true }
        }
        rows.push({
          id: r._id.toString(),
          reporter: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Unknown',
          reportedUser: reported ? `${reported.firstName} ${reported.lastName}` : 'Unknown',
          reportedUserId: r.reportedUserId?.toString(),
          reason: r.reason,
          details: r.details,
          status: r.status,
          staffNotes: r.staffNotes || '',
          createdAt: new Date(r.createdAt).toISOString(),
          resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : null,
          connectionId: r.connectionId?.toString() || null,
          messageSnippet: snippet,
        })
      }
      return json({ reports: rows })
    }

    if (route === '/staff/reports' && method === 'PATCH') {
      const g = await requireUser(request, db, { role: 'STAFF' })
      if (g.error) return json({ error: g.error }, g.status)
      const body = await request.json().catch(() => ({}))
      const rid = toId(body.id)
      const validStatus = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED']
      if (!rid || !validStatus.includes(body.status)) return json({ error: 'Invalid payload' }, 400)
      const set = { status: body.status }
      if (typeof body.staffNotes === 'string') set.staffNotes = body.staffNotes
      if (body.status === 'RESOLVED' || body.status === 'DISMISSED') {
        set.resolvedAt = new Date()
        set.resolvedByStaffId = g.user._id
      } else {
        set.resolvedAt = null
        set.resolvedByStaffId = null
      }
      await db.collection('reports').updateOne({ _id: rid }, { $set: set })
      const updated = await db.collection('reports').findOne({ _id: rid })
      return json({ ok: true, report: ser(updated) })
    }

    return json({ error: `Route ${route} not found` }, 404)
  } catch (error) {
    console.error('API Error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute

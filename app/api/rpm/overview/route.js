import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

const CATS = ['friendliness', 'professionalism', 'knowledge', 'communication', 'overallExperience']

async function getUser(request, db) {
  const t = request.cookies.get(SESSION_COOKIE)?.value
  const p = verifySession(t)
  if (!p?.userId) return null
  try { return await db.collection('users').findOne({ _id: new ObjectId(p.userId) }) } catch { return null }
}
const avgOf = (list, c) => list.length ? list.reduce((s, f) => s + (f.scores?.[c] || 0), 0) / list.length : 0
const overallOf = (list) => {
  if (!list.length) return 0
  const per = list.map(f => CATS.reduce((s, c) => s + (f.scores?.[c] || 0), 0) / CATS.length)
  return per.reduce((a, b) => a + b, 0) / per.length
}

export async function GET(request) {
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (me.role !== 'RPM') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // ---- APM leaderboard (existing) ----
    const apms = await db.collection('users').find({ role: 'APM', managedByRpmId: me._id }).toArray()
    const apmIds = apms.map(a => a._id)
    const feedback = await db.collection('viewingFeedback').find({ apmId: { $in: apmIds } }).toArray()
    const byApm = {}; apms.forEach(a => { byApm[a._id.toString()] = [] })
    feedback.forEach(f => { const k = f.apmId.toString(); if (byApm[k]) byApm[k].push(f) })

    const props = await db.collection('properties').find({}).toArray()
    const pMap = {}; props.forEach(p => { pMap[p._id.toString()] = p.buildingName })

    const rows = apms.map(a => {
      const list = byApm[a._id.toString()] || []
      const categories = {}; CATS.forEach(c => { categories[c] = Number(avgOf(list, c).toFixed(2)) })
      const overall = Number(overallOf(list).toFixed(2))
      return {
        id: a._id.toString(), name: `${a.firstName} ${a.lastName}`,
        propertyName: a.propertyId ? pMap[a.propertyId.toString()] : '',
        viewings: list.length, categories, overall, needsAttention: overall > 0 && overall < 3.5,
      }
    })
    rows.sort((a, b) => b.overall - a.overall)

    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const viewingsThisMonth = feedback.filter(f => new Date(f.createdAt) >= monthStart).length
    const teamAvg = rows.length ? Number((rows.reduce((s, r) => s + r.overall, 0) / rows.length).toFixed(2)) : 0

    // ---- Connection story (region-wide) ----
    const residents = await db.collection('users').find({ role: 'RESIDENT' }).toArray()
    const totalResidents = residents.length
    const openCount = residents.filter(r => r.isOpenToMeeting).length
    const propOfUser = {}; residents.forEach(r => { propOfUser[r._id.toString()] = r.propertyId ? r.propertyId.toString() : null })

    const connections = await db.collection('connections').find({}).toArray()
    const accepted = connections.filter(c => c.status === 'ACCEPTED')
    const requestsSent = connections.length
    const connectedCount = accepted.length

    const messages = await db.collection('messages').find({}).toArray()
    const connWithMsgs = new Set(messages.map(m => m.connectionId?.toString()))
    const activeChats = accepted.filter(c => connWithMsgs.has(c._id.toString())).length

    const events = await db.collection('eventIdeas').find({}).toArray()
    const eventsSparked = events.length

    // Connection Health Index (0-100 blended)
    const openRate = totalResidents ? openCount / totalResidents : 0
    const connRateNorm = totalResidents ? Math.min(1, connectedCount / (totalResidents * 0.5)) : 0
    const chatRate = connectedCount ? activeChats / connectedCount : 0
    const eventRate = Math.min(1, eventsSparked / 6)
    const index = Math.round(100 * (0.35 * openRate + 0.30 * connRateNorm + 0.20 * chatRate + 0.15 * eventRate))

    // Funnel
    const funnel = [
      { name: 'Profiles Created', value: totalResidents },
      { name: 'Open to Meeting', value: openCount },
      { name: 'Requests Sent', value: requestsSent },
      { name: 'Connected', value: connectedCount },
      { name: 'Actively Chatting', value: activeChats },
    ]

    // Connections over time (cumulative, last 8 weeks)
    const weeks = 8, msWeek = 7 * 24 * 3600 * 1000, nowMs = Date.now()
    const buckets = new Array(weeks).fill(0)
    connections.forEach(c => {
      const age = nowMs - new Date(c.createdAt).getTime()
      const wIdx = weeks - 1 - Math.floor(age / msWeek)
      if (wIdx >= 0 && wIdx < weeks) buckets[wIdx]++
    })
    let run = 0
    const trend = buckets.map((b, i) => { run += b; return { week: `W${i + 1}`, value: run } })

    // Building leaderboard
    const residentsByProp = {}
    residents.forEach(r => { const k = propOfUser[r._id.toString()]; if (!k) return; (residentsByProp[k] ||= []).push(r) })
    const acceptedByProp = {}
    accepted.forEach(c => {
      const pa = propOfUser[c.userAId?.toString()]; const pb = propOfUser[c.userBId?.toString()]
      if (pa && pa === pb) acceptedByProp[pa] = (acceptedByProp[pa] || 0) + 1
    })
    const buildingLeaderboard = props.map(p => {
      const k = p._id.toString()
      const res = residentsByProp[k] || []
      const open = res.filter(r => r.isOpenToMeeting).length
      const conns = acceptedByProp[k] || 0
      const oR = res.length ? open / res.length : 0
      const cR = res.length ? Math.min(1, conns / (res.length * 0.5)) : 0
      return { name: p.buildingName, residents: res.length, score: Math.round(100 * (0.5 * oR + 0.5 * cR)) }
    }).sort((a, b) => b.score - a.score)

    // Top resident hobbies (event fuel)
    const profiles = await db.collection('userProfiles').find({ userId: { $in: residents.map(r => r._id) } }).toArray()
    const hCount = {}
    profiles.forEach(pr => (pr.hobbies || []).forEach(h => { hCount[h] = (hCount[h] || 0) + 1 }))
    const topInterests = Object.entries(hCount).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6)

    return NextResponse.json({
      rpm: { name: `${me.firstName} ${me.lastName}` },
      stats: { totalApms: apms.length, totalViewings: feedback.length, viewingsThisMonth, teamAvgOverall: teamAvg },
      apms: rows,
      connection: {
        index, totalConnections: connectedCount, activeChats, eventsSparked,
        openPct: Math.round(openRate * 100), totalResidents,
      },
      funnel,
      trend,
      buildingLeaderboard,
      topInterests,
    })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
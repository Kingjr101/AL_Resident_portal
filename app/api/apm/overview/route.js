import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

const CATS = ['friendliness', 'professionalism', 'knowledge', 'communication', 'overallExperience']
const LABELS = { friendliness: 'Friendliness', professionalism: 'Professionalism', knowledge: 'Knowledge', communication: 'Communication', overallExperience: 'Overall Experience' }
const IDEAS = {
  hiking: 'a weekend group hike (think Grassi Lakes)', coffee: 'a lobby coffee & connect morning',
  'live music': 'an acoustic night in the lounge', 'local music scene': 'a local band showcase evening',
  cooking: 'a potluck cook-along night', foodie: 'a neighbourhood food crawl',
  gardening: 'a community garden work party', sustainability: 'a plant swap & sustainability meetup',
  dogs: 'a puppy playdate in the courtyard', pets: 'a pet meet-and-greet',
  yoga: 'a rooftop morning yoga session', wellness: 'a wellness & stretch class',
  running: 'a weekly run club', fitness: 'a group fitness bootcamp', cycling: 'a Sunday group ride',
  'board games': 'a monthly board game night', gaming: 'a games & pizza tournament',
  'book club': 'a cozy book club kickoff', outdoors: 'an outdoor adventure day',
  travel: 'a travel stories swap night', technology: 'a tech coffee lunch-and-learn',
  'arts & crafts': 'a craft & sip afternoon', 'community events': 'a monthly community mixer',
  volunteering: 'a group volunteering day',
}

async function getUser(request, db) {
  const t = request.cookies.get(SESSION_COOKIE)?.value
  const p = verifySession(t)
  if (!p?.userId) return null
  try { return await db.collection('users').findOne({ _id: new ObjectId(p.userId) }) } catch { return null }
}
const avgOf = (list, c) => list.length ? list.reduce((s, f) => s + (f.scores?.[c] || 0), 0) / list.length : 0

export async function GET(request) {
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (me.role !== 'APM') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const property = me.propertyId ? await db.collection('properties').findOne({ _id: me.propertyId }) : null
    const list = await db.collection('viewingFeedback').find({ apmId: me._id }).sort({ createdAt: -1 }).toArray()
    const categories = {}; CATS.forEach(c => { categories[c] = Number(avgOf(list, c).toFixed(2)) })
    const overall = Number((CATS.reduce((s, c) => s + categories[c], 0) / CATS.length).toFixed(2))
    const sorted = [...CATS].sort((a, b) => categories[b] - categories[a])
    const best = sorted[0], worst = sorted[sorted.length - 1]

    // Resident interest aggregation for this property only (building isolation)
    const residents = await db.collection('users').find({ propertyId: me.propertyId, role: 'RESIDENT' }).toArray()
    const rProfiles = await db.collection('userProfiles').find({ userId: { $in: residents.map(r => r._id) } }).toArray()
    const interestCounts = {}; const hobbyCounts = {}
    rProfiles.forEach(p => {
      (p.interests || []).forEach(i => { interestCounts[i] = (interestCounts[i] || 0) + 1 })
      ;(p.hobbies || []).forEach(h => { hobbyCounts[h] = (hobbyCounts[h] || 0) + 1 })
    })
    const totalResidents = residents.length || 1
    const toSorted = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    const topInterests = toSorted(interestCounts).slice(0, 8)
    const topHobbies = toSorted(hobbyCounts).slice(0, 12)
    const suggestedThemes = topInterests.slice(0, 3).map(t => ({
      tag: t.name, pct: Math.round((t.count / totalResidents) * 100),
      suggestion: IDEAS[t.name] || `a ${t.name} meetup`,
    }))

    return NextResponse.json({
      apm: { name: `${me.firstName} ${me.lastName}`, propertyName: property?.buildingName || '' },
      performance: {
        count: list.length, overall, categories,
        best: { key: best, label: LABELS[best], value: categories[best] },
        worst: { key: worst, label: LABELS[worst], value: categories[worst] },
        labels: LABELS,
      },
      recent: list.slice(0, 8).map(f => ({ id: f._id.toString(), prospectName: f.prospectName, scores: f.scores, comment: f.comment || '', createdAt: new Date(f.createdAt).toISOString() })),
      residents: { total: residents.length, topInterests, topHobbies, suggestedThemes },
    })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

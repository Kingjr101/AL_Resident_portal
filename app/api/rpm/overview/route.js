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

    return NextResponse.json({
      rpm: { name: `${me.firstName} ${me.lastName}` },
      stats: { totalApms: apms.length, totalViewings: feedback.length, viewingsThisMonth, teamAvgOverall: teamAvg },
      apms: rows,
    })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

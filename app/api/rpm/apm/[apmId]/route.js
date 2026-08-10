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

export async function GET(request, { params }) {
  const { apmId } = await params
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (me.role !== 'RPM') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let aId
    try { aId = new ObjectId(apmId) } catch { return NextResponse.json({ error: 'Invalid id' }, { status: 400 }) }
    const apm = await db.collection('users').findOne({ _id: aId, role: 'APM' })
    if (!apm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!apm.managedByRpmId || apm.managedByRpmId.toString() !== me._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const property = apm.propertyId ? await db.collection('properties').findOne({ _id: apm.propertyId }) : null
    const list = await db.collection('viewingFeedback').find({ apmId: aId }).sort({ createdAt: -1 }).toArray()
    const categories = {}; CATS.forEach(c => { categories[c] = Number(avgOf(list, c).toFixed(2)) })
    const overall = Number((CATS.reduce((s, c) => s + categories[c], 0) / CATS.length).toFixed(2))

    return NextResponse.json({
      apm: { id: apm._id.toString(), name: `${apm.firstName} ${apm.lastName}`, propertyName: property?.buildingName || '' },
      categories, overall, count: list.length,
      feedback: list.map(f => ({
        id: f._id.toString(), prospectName: f.prospectName, scores: f.scores,
        comment: f.comment || '', createdAt: new Date(f.createdAt).toISOString(),
      })),
    })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}

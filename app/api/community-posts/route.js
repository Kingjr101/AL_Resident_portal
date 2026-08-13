import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

const ALLOWED_CATEGORIES = [
  'NEWSLETTER', 'ANNOUNCEMENT', 'EVENT', 'PET_HELP',
  'HELP_WANTED', 'GIVEAWAY', 'LOST_AND_FOUND', 'ROOM_BOOKING',
]

async function getUser(request, db) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const payload = verifySession(token)
  if (!payload?.userId) return null
  try { return await db.collection('users').findOne({ _id: new ObjectId(payload.userId) }) } catch { return null }
}

// GET /api/community-posts
// Returns active, non-hidden posts for the signed-in user's building only.
export async function GET(request) {
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!me.propertyId) return NextResponse.json({ posts: [], viewerId: me?._id?.toString() || null })

    const now = new Date()
    const posts = await db.collection('communityPosts').find({
      propertyId: me.propertyId,
      isHidden: { $ne: true },
      status: { $in: ['ACTIVE', 'RESOLVED'] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ isPinned: -1, createdAt: -1 }).toArray()

    const authorIds = [...new Set(posts.map(p => p.authorId?.toString()).filter(Boolean))]
    const authorObjectIds = authorIds.map(id => new ObjectId(id))

    const authors = await db.collection('users')
      .find({ _id: { $in: authorObjectIds } })
      .toArray()

    // Photos live on userProfiles (userId -> photoUrl)
    const profiles = await db.collection('userProfiles')
      .find({ userId: { $in: authorObjectIds } })
      .toArray()
    const photoMap = {}
    profiles.forEach(pr => { photoMap[pr.userId?.toString()] = pr.photoUrl || null })

    const authorMap = {}
    authors.forEach(a => {
      const id = a._id.toString()
      authorMap[id] = {
        id,
        firstName: a.firstName,
        lastName: a.lastName,
        lastInitial: (a.lastName || '').charAt(0),
        photoUrl: photoMap[id] || null,
        role: a.role,
        isStaff: a.role === 'APM' || a.role === 'RPM',
      }
    })

    const meId = me._id.toString()
    const result = posts.map(p => {
      const author = authorMap[p.authorId?.toString()] || null
      return {
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        isPinned: !!p.isPinned,
        isStaffPost: !!p.isStaffPost,
        createdAt: new Date(p.createdAt).toISOString(),
        expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString() : null,
        author,
        isMine: author?.id === meId,
      }
    })

    return NextResponse.json({ posts: result, viewerId: meId })
  } catch (e) {
    console.error('community-posts GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/community-posts
// Creates a post authored by the signed-in resident, in their building.
export async function POST(request) {
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!me.propertyId) return NextResponse.json({ error: 'No building assigned' }, { status: 400 })

    const body = await request.json()
    const title = (body.title || '').trim()
    const description = (body.description || '').trim()
    const category = (body.category || '').trim()
    const expiresInDays = Number(body.expiresInDays) || 14

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    if (title.length > 120) return NextResponse.json({ error: 'Title is too long' }, { status: 400 })
    if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    if (description.length > 1000) return NextResponse.json({ error: 'Description is too long' }, { status: 400 })
    if (!ALLOWED_CATEGORIES.includes(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000)
    const isStaff = me.role === 'APM' || me.role === 'RPM'

    const doc = {
      _id: new ObjectId(),
      propertyId: me.propertyId,
      authorId: me._id,
      title,
      description,
      category,
      status: 'ACTIVE',
      isPinned: false,
      isStaffPost: isStaff,
      isHidden: false,
      reportCount: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      resolvedAt: null,
    }

    await db.collection('communityPosts').insertOne(doc)

    return NextResponse.json({ ok: true, id: doc._id.toString() }, { status: 201 })
  } catch (e) {
    console.error('community-posts POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

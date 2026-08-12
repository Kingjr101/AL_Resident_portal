import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

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
    if (!me.propertyId) return NextResponse.json({ posts: [] })

    const now = new Date()
    const posts = await db.collection('communityPosts').find({
      propertyId: me.propertyId,
      isHidden: { $ne: true },
      status: { $in: ['ACTIVE', 'RESOLVED'] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ isPinned: -1, createdAt: -1 }).toArray()

    // Attach author display info (first name + last initial only — privacy)
    const authorIds = [...new Set(posts.map(p => p.authorId?.toString()).filter(Boolean))]
    const authors = await db.collection('users')
      .find({ _id: { $in: authorIds.map(id => new ObjectId(id)) } })
      .toArray()
    const authorMap = {}
    authors.forEach(a => {
      authorMap[a._id.toString()] = {
        id: a._id.toString(),
        firstName: a.firstName,
        lastInitial: (a.lastName || '').charAt(0),
        role: a.role,
      }
    })

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
        isMine: author?.id === me._id.toString(),
      }
    })

    return NextResponse.json({ posts: result, viewerId: me._id.toString() })
  } catch (e) {
    console.error('community-posts GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
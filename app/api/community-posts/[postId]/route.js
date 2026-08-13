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

// PATCH /api/community-posts/[postId]
// Body: { action: 'resolve' | 'reopen' }
// Only the post author may change their own post's status.
export async function PATCH(request, { params }) {
  const { postId } = await params
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let pid
    try { pid = new ObjectId(postId) } catch { return NextResponse.json({ error: 'Invalid id' }, { status: 400 }) }

    const post = await db.collection('communityPosts').findOne({ _id: pid })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (post.authorId?.toString() !== me._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const action = body.action

    let update
    if (action === 'resolve') {
      update = { status: 'RESOLVED', resolvedAt: new Date(), updatedAt: new Date() }
    } else if (action === 'reopen') {
      update = { status: 'ACTIVE', resolvedAt: null, updatedAt: new Date() }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await db.collection('communityPosts').updateOne({ _id: pid }, { $set: update })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('community-posts PATCH error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/community-posts/[postId]
// The author may delete their own post. Staff may remove posts in their building.
export async function DELETE(request, { params }) {
  const { postId } = await params
  try {
    const db = await getDb()
    const me = await getUser(request, db)
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let pid
    try { pid = new ObjectId(postId) } catch { return NextResponse.json({ error: 'Invalid id' }, { status: 400 }) }

    const post = await db.collection('communityPosts').findOne({ _id: pid })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isAuthor = post.authorId?.toString() === me._id.toString()
    const isStaffSameBuilding =
      (me.role === 'APM' || me.role === 'RPM') &&
      post.propertyId?.toString() === me.propertyId?.toString()

    if (!isAuthor && !isStaffSameBuilding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.collection('communityPosts').deleteOne({ _id: pid })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('community-posts DELETE error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

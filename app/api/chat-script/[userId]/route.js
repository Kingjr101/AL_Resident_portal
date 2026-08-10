import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

// GET /api/chat-script/[userId]
// Returns the target resident's chatScript.
// Requires an authenticated session AND that the viewer is in the same property
// (building isolation). 403 on property mismatch, 404 if the user does not exist.
export async function GET(request, { params }) {
  const { userId } = await params
  try {
    const db = await getDb()

    const token = request.cookies.get(SESSION_COOKIE)?.value
    const payload = verifySession(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let meId, targetId
    try { meId = new ObjectId(payload.userId) } catch { return NextResponse.json({ error: 'Invalid session' }, { status: 401 }) }
    try { targetId = new ObjectId(userId) } catch { return NextResponse.json({ error: 'Invalid user id' }, { status: 400 }) }

    const me = await db.collection('users').findOne({ _id: meId })
    if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const target = await db.collection('users').findOne({ _id: targetId })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (target.propertyId.toString() !== me.propertyId.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const chatScript = target.chatScript || {
      greeting: `Hi! I'm ${target.firstName} 👋`,
      quickReplies: [],
      closer: 'Nice to meet you!',
    }

    return NextResponse.json({ chatScript })
  } catch (e) {
    console.error('chat-script error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

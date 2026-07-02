import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET || 'resident-hub-demo-secret-key'
export const SESSION_COOKIE = 'rh_session'

// Minimal signed-token (custom JWT-style) helpers using HMAC-SHA256.
export function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(token) {
  if (!token || typeof token !== 'string') return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  if (expected !== sig) return null
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}

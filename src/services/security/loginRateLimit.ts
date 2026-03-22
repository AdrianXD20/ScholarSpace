const PREFIX = 'login_attempts_'
const MAX = 8
const WINDOW_MS = 15 * 60 * 1000

interface Bucket {
  count: number
  windowStart: number
}

function key(email: string) {
  return PREFIX + email.toLowerCase().trim()
}

export function isLoginBlocked(email: string): boolean {
  const raw = sessionStorage.getItem(key(email))
  if (!raw) return false
  try {
    const b = JSON.parse(raw) as Bucket
    const now = Date.now()
    if (now - b.windowStart > WINDOW_MS) return false
    return b.count >= MAX
  } catch {
    return false
  }
}

export function recordFailedLogin(email: string) {
  const k = key(email)
  const now = Date.now()
  const raw = sessionStorage.getItem(k)
  let bucket: Bucket = raw
    ? (JSON.parse(raw) as Bucket)
    : { count: 0, windowStart: now }
  if (now - bucket.windowStart > WINDOW_MS) {
    bucket = { count: 1, windowStart: now }
  } else {
    bucket.count += 1
  }
  sessionStorage.setItem(k, JSON.stringify(bucket))
}

export function clearLoginAttempts(email: string) {
  sessionStorage.removeItem(key(email))
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const REFRESH_TOKEN_KEY = 'imegedit_rt'

let _accessToken: string | null = null
let _isRefreshing = false
let _pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: Error) => void
}> = []

let _onSessionExpired: (() => void) | null = null

export function onSessionExpired(cb: () => void) {
  _onSessionExpired = cb
}

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token)
  else localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  _accessToken = null
  setRefreshToken(null)
}

async function doRefresh(): Promise<string> {
  const rt = getRefreshToken()
  if (!rt) throw new Error('SESSION_EXPIRED')

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error('SESSION_EXPIRED')
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string }
  setAccessToken(data.accessToken)
  setRefreshToken(data.refreshToken)
  return data.accessToken
}

async function refreshOnce(): Promise<string> {
  if (_isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      _pendingQueue.push({ resolve, reject })
    })
  }

  _isRefreshing = true
  try {
    const token = await doRefresh()
    _pendingQueue.forEach((p) => p.resolve(token))
    return token
  } catch (err) {
    _pendingQueue.forEach((p) => p.reject(err as Error))
    throw err
  } finally {
    _isRefreshing = false
    _pendingQueue = []
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  let res = await doFetch(_accessToken)

  if (res.status === 401) {
    try {
      const newToken = await refreshOnce()
      res = await doFetch(newToken)
    } catch {
      _onSessionExpired?.()
      throw new Error('SESSION_EXPIRED')
    }
  }

  return res
}

export { BASE_URL }

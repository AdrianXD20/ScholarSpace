import { env } from '../../config/env'
import { tokenStorage } from '../security/tokenStorage'

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: Method
  body?: unknown
  headers?: Record<string, string>
  /** No añadir Authorization */
  skipAuth?: boolean
}

function dispatchSessionExpired() {
  tokenStorage.clear()
  window.dispatchEvent(new CustomEvent('auth:session-expired'))
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth } = options
  const url = `${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`

  const token = skipAuth ? null : tokenStorage.getAccessToken()
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }
  if (body !== undefined && body !== null && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }
  if (token) reqHeaders.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body:
      body !== undefined && body !== null
        ? typeof body === 'string'
          ? body
          : JSON.stringify(body)
        : undefined,
    credentials: 'include',
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (res.status === 401 && !skipAuth) {
    dispatchSessionExpired()
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : res.statusText || 'Error de red'
    throw new ApiError(msg, res.status, data)
  }

  return data as T
}

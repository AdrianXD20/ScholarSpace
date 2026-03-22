import type { User } from './user.types'

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

export interface AuthResultSuccess {
  ok: true
  user: User
  tokens?: AuthTokens
}

export interface AuthResultError {
  ok: false
  error: string
  code?: string
}

export type AuthResult = AuthResultSuccess | AuthResultError

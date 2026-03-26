import { env } from '../config/env'
import { resolvePermissions } from '../constants/permissions'
import type { AuthResult, AuthTokens } from '../types/auth.types'
import type { LoginCredentials, RegisterData, User, UserRole } from '../types/user.types'
import { generateId } from '../utils/helpers'
import { httpClient, ApiError } from './api/httpClient'
import { endpoints } from './api/endpoints'
import { tokenStorage } from './security/tokenStorage'
import { clasesService } from './clases.service'

const USERS_KEY = 'users'
const RESET_TOKENS_KEY = 'password_reset_tokens'

/** Usuario persistido en mock (puede venir sin `role` en datos antiguos) */
type StoredUser = User & { password: string; role?: UserRole }

/** Contrato esperado del backend (ajusta nombres de campos si tu API difiere) */
interface LoginApiResponse {
  JWT?: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  user: ApiUserPayload
}

interface RegisterApiResponse {
  id: string
  rol: string
  nombre: string
  email: string
  password: string
  foto_perfil: string | null
}

interface ApiUserPayload {
  id: string
  name?: string
  nombre?: string
  email: string
  avatar?: string
  foto_perfil?: string | null
  bio?: string
  institution?: string
  career?: string
  createdAt: string
  role?: UserRole
  rol?: string
  permissions?: User['permissions']
  perfilDocente?: User['perfilDocente']
  claseIds?: string[]
}

function mapApiUser(p: ApiUserPayload): User {
  const role: UserRole = p.role ?? (p.rol === 'USER' ? 'student' : 'student')
  const user: User = {
    id: p.id,
    name: p.name ?? p.nombre ?? '',
    email: p.email,
    avatar: p.avatar ?? (p.foto_perfil || undefined),
    bio: p.bio,
    institution: p.institution,
    career: p.career,
    createdAt: p.createdAt,
    role,
    permissions: p.permissions,
    perfilDocente: p.perfilDocente,
    claseIds: p.claseIds,
  }
  return normalizeUser(user)
}

function normalizeUser(u: User): User {
  return { ...u, permissions: resolvePermissions(u) }
}

function inferMockRole(email: string): UserRole {
  const e = email.toLowerCase()
  if (e.startsWith('admin@') || e.endsWith('@admin.local')) return 'admin'
  if (e.startsWith('teacher@') || e.includes('profesor@')) return 'teacher'
  return 'student'
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[]
  } catch {
    return []
  }
}

function persistUserSession(user: User, tokens?: AuthTokens): void {
  const normalized = normalizeUser(user)
  localStorage.setItem('user', JSON.stringify(normalized))
  if (tokens?.accessToken) {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (env.useMockAuth) {
      await new Promise((r) => setTimeout(r, 400))
      const users = readUsers()
      const found = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      )
      if (!found) {
        return { ok: false, error: 'Credenciales incorrectas.', code: 'INVALID_CREDENTIALS' }
      }
      const role = found.role ?? inferMockRole(found.email)
      const { password: _, ...rest } = found
      const user: User = normalizeUser({ ...rest, role })
      const fakeToken = `mock.${user.id}.${Date.now()}`
      persistUserSession(user, { accessToken: fakeToken })
      return { ok: true, user, tokens: { accessToken: fakeToken } }
    }

    try {
      const loginBody = {
        email: credentials.email,
        password: credentials.password,
        'contraseña': credentials.password,
      }
      const data = await httpClient<LoginApiResponse>(endpoints.auth.login, {
        method: 'POST',
        body: loginBody,
        skipAuth: true,
      })
      const user = normalizeUser(mapApiUser(data.user))
      const tokens: AuthTokens = {
        accessToken: data.JWT || data.accessToken || '',
        refreshToken: data.refreshToken,
      }
      persistUserSession(user, tokens)
      return { ok: true, user, tokens }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.'
      return { ok: false, error: msg, code: e instanceof ApiError ? String(e.status) : 'NETWORK' }
    }
  },

  async register(payload: RegisterData): Promise<AuthResult> {
    if (env.useMockAuth) {
      await new Promise((r) => setTimeout(r, 400))

      if (payload.accountType === 'teacher') {
        const p = payload.perfilDocente
        if (
          !p?.titulacionAcademica?.trim() ||
          !p.departamento?.trim() ||
          p.anosExperiencia == null ||
          Number.isNaN(Number(p.anosExperiencia)) ||
          p.anosExperiencia < 0
        ) {
          return {
            ok: false,
            error:
              'Completa titulación académica, departamento o área y años de experiencia docente.',
            code: 'TEACHER_FIELDS',
          }
        }
      }

      if (payload.accountType === 'student' && payload.codigoClase?.trim()) {
        const existe = clasesService.getClaseByCodigo(payload.codigoClase)
        if (!existe) {
          return { ok: false, error: 'El código de clase no es válido.', code: 'INVALID_CLASS_CODE' }
        }
      }

      const users = readUsers()
      if (users.some((u) => u.email === payload.email)) {
        return { ok: false, error: 'Este correo ya está registrado.', code: 'EMAIL_TAKEN' }
      }

      const role: UserRole =
        payload.accountType === 'teacher'
          ? 'teacher'
          : payload.accountType === 'student'
            ? 'student'
            : inferMockRole(payload.email)

      const newUser: StoredUser = {
        id: generateId(),
        name: payload.name,
        email: payload.email,
        password: payload.password,
        institution: payload.institution,
        career: payload.career,
        createdAt: new Date().toISOString(),
        role,
        perfilDocente:
          payload.accountType === 'teacher' ? payload.perfilDocente : undefined,
        claseIds: [],
      }
      users.push(newUser)
      localStorage.setItem(USERS_KEY, JSON.stringify(users))

      const { password: __, ...restNew } = newUser
      let user: User = normalizeUser({
        ...restNew,
        role: newUser.role ?? inferMockRole(newUser.email),
      })

      if (payload.accountType === 'student' && payload.codigoClase?.trim()) {
        const join = clasesService.joinClaseByCodigo(user.id, payload.codigoClase.trim())
        if (join.ok && join.user) user = join.user
      }

      const fakeToken = `mock.${user.id}.${Date.now()}`
      persistUserSession(user, { accessToken: fakeToken })
      return { ok: true, user, tokens: { accessToken: fakeToken } }
    }

    try {
      const apiPayload = {
        rol: "USER",
        nombre: payload.name,
        email: payload.email,
        password: payload.password,
        foto_perfil: null
      }
      const res = await httpClient<RegisterApiResponse>(endpoints.auth.register, {
        method: 'POST',
        body: apiPayload,
        skipAuth: true,
      })
      // Map the response to ApiUserPayload format
      const apiUser: ApiUserPayload = {
        id: res.id,
        nombre: res.nombre,
        email: res.email,
        foto_perfil: res.foto_perfil,
        rol: res.rol,
        createdAt: new Date().toISOString(), // Assuming created now
      }
      const user = normalizeUser(mapApiUser(apiUser))
      // No tokens returned, so no session persistence
      // User needs to login after registration
      return { ok: true, user }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo registrar.'
      return { ok: false, error: msg, code: e instanceof ApiError ? String(e.status) : 'NETWORK' }
    }
  },

  async requestPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
    if (env.useMockAuth) {
      await new Promise((r) => setTimeout(r, 500))
      const users = readUsers()
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}') as Record<
        string,
        string
      >
      const token = `reset_${generateId()}`
      tokens[token] = email.toLowerCase().trim()
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
      if (import.meta.env.DEV && exists) {
        console.info('[mock] Enlace de recuperación (solo dev):', `/reset-password?token=${token}`)
      }
      return { ok: true }
    }
    try {
      await httpClient(endpoints.auth.forgotPassword, {
        method: 'POST',
        body: { email },
        skipAuth: true,
      })
      return { ok: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo enviar el correo.'
      return { ok: false, error: msg }
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (env.useMockAuth) {
      await new Promise((r) => setTimeout(r, 500))
      const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}') as Record<
        string,
        string
      >
      const email = tokens[token]
      if (!email) {
        return { ok: false, error: 'Enlace inválido o expirado.' }
      }
      const users = readUsers()
      const idx = users.findIndex((u) => u.email.toLowerCase() === email)
      if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' }
      users[idx] = { ...users[idx], password: newPassword }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      delete tokens[token]
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
      return { ok: true }
    }
    try {
      await httpClient(endpoints.auth.resetPassword, {
        method: 'POST',
        body: { token, password: newPassword },
        skipAuth: true,
      })
      return { ok: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo restablecer la contraseña.'
      return { ok: false, error: msg }
    }
  },

  async refreshSession(): Promise<boolean> {
    if (env.useMockAuth) return true
    const refresh = tokenStorage.getRefreshToken()
    if (!refresh) return false
    try {
      const data = await httpClient<{ accessToken: string; refreshToken?: string }>(
        endpoints.auth.refresh,
        {
          method: 'POST',
          body: { refreshToken: refresh },
          skipAuth: true,
        }
      )
      tokenStorage.setTokens(data.accessToken, data.refreshToken ?? refresh)
      return true
    } catch {
      tokenStorage.clear()
      return false
    }
  },

  logout(): void {
    localStorage.removeItem('user')
    tokenStorage.clear()
  },

  /** Hidrata usuario desde localStorage (sin validar JWT; eso lo hace la API en cada request) */
  getStoredUser(): User | null {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      const u = JSON.parse(raw) as User
      if (!u.role) u.role = inferMockRole(u.email)
      return normalizeUser(u)
    } catch {
      return null
    }
  },
}

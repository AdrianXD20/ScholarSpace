import { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginCredentials, RegisterData, Permission } from '../types/user.types'
import { resolvePermissions, hasPermission as checkPermission } from '../constants/permissions'
import { authService } from '../services/auth.service'
import {
  clearLoginAttempts,
  isLoginBlocked,
  recordFailedLogin,
} from '../services/security/loginRateLimit'

interface LoginResult {
  ok: boolean
  error?: string
  user?: User
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  register: (data: RegisterData) => Promise<LoginResult>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  /** Comprueba un permiso concreto (API o rol por defecto) */
  can: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hydrate = useCallback(() => {
    const stored = authService.getStoredUser()
    setUser(stored)
  }, [])

  useEffect(() => {
    hydrate()
    setIsLoading(false)
  }, [hydrate])

  useEffect(() => {
    const onExpire = () => {
      setUser(null)
      localStorage.removeItem('user')
    }
    window.addEventListener('auth:session-expired', onExpire)
    return () => window.removeEventListener('auth:session-expired', onExpire)
  }, [])

  const can = useCallback(
    (permission: Permission) => checkPermission(user, permission),
    [user]
  )

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    if (isLoginBlocked(credentials.email)) {
      return {
        ok: false,
        error:
          'Demasiados intentos. Espera unos minutos o restablece tu contraseña.',
      }
    }
    setIsLoading(true)
    try {
      const result = await authService.login(credentials)
      if (result.ok) {
        clearLoginAttempts(credentials.email)
        setUser(result.user)
        return { ok: true, user: result.user }
      }
      recordFailedLogin(credentials.email)
      return { ok: false, error: result.error }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<LoginResult> => {
    setIsLoading(true)
    try {
      const result = await authService.register(data)
      if (result.ok) {
        return { ok: true, user: result.user }
      }
      return { ok: false, error: result.error }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...data }
      const updatedUser: User = {
        ...merged,
        permissions: resolvePermissions(merged),
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      const raw = localStorage.getItem('users')
      if (raw) {
        try {
          const users = JSON.parse(raw) as Array<{ id: string } & Record<string, unknown>>
          const idx = users.findIndex((u) => u.id === user.id)
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...data }
            localStorage.setItem('users', JSON.stringify(users))
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

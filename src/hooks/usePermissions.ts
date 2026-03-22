import { useAuth } from './useAuth'
import type { Permission, UserRole } from '../types/user.types'
import { hasAnyRole, hasPermission } from '../constants/permissions'

/**
 * Acceso a permisos y roles desde componentes.
 */
export function usePermissions() {
  const { user, can } = useAuth()

  return {
    user,
    can,
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasRole: (roles: UserRole | UserRole[]) => {
      const list = Array.isArray(roles) ? roles : [roles]
      return hasAnyRole(user, list)
    },
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
  }
}

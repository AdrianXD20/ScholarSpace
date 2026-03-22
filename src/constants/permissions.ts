import type { Permission, UserRole } from '../types/user.types'

/** Permisos por rol por defecto (cuando la API solo envía `role`) */
export const DEFAULT_PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  student: [
    'notes:read',
    'notes:write',
    'profile:read',
    'profile:write',
    'achievements:read',
    'achievements:write',
    'activities:read',
    'activities:write',
  ],
  teacher: [
    'notes:read',
    'notes:write',
    'profile:read',
    'profile:write',
    'achievements:read',
    'achievements:write',
    'activities:read',
    'activities:write',
    'teacher:students:read',
    'teacher:classes:manage',
  ],
  admin: [
    'notes:read',
    'notes:write',
    'profile:read',
    'profile:write',
    'achievements:read',
    'achievements:write',
    'activities:read',
    'activities:write',
    'teacher:students:read',
    'teacher:classes:manage',
    'admin:panel',
  ],
}

export function resolvePermissions(user: {
  role: UserRole
  permissions?: Permission[]
}): Permission[] {
  if (user.permissions?.length) return user.permissions
  return DEFAULT_PERMISSIONS_BY_ROLE[user.role] ?? DEFAULT_PERMISSIONS_BY_ROLE.student
}

export function hasPermission(
  user: { role: UserRole; permissions?: Permission[] } | null,
  permission: Permission
): boolean {
  if (!user) return false
  return resolvePermissions(user).includes(permission)
}

export function hasAnyRole(
  user: { role: UserRole } | null,
  allowed: UserRole[]
): boolean {
  if (!user) return false
  return allowed.includes(user.role)
}

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/common/Loader'
import type { UserRole, Permission } from '../types/user.types'
import { hasAnyRole, hasPermission } from '../constants/permissions'

/** Docentes entran al panel docente; el resto al dashboard del alumno/admin */
export function defaultHomePath(role: UserRole | undefined): string {
  if (role === 'teacher') return '/profesor'
  return '/dashboard'
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader size="lg" />
    </div>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) return <Navigate to={defaultHomePath(user?.role)} replace />
  return <>{children}</>
}

/** Sesión + uno de los roles */
export function RoleRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles: UserRole[]
}) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasAnyRole(user, roles)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

/** Sesión + permiso (lista desde API o según rol por defecto) */
export function PermissionRoute({
  children,
  permission,
}: {
  children: React.ReactNode
  permission: Permission
}) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasPermission(user, permission)) return <Navigate to="/unauthorized" replace />
  return <>{children}</>
}

/** El portafolio tipo alumno no aplica a docentes: redirige al panel docente */
export function StudentDashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <FullScreenLoader />
  if (user?.role === 'teacher') return <Navigate to="/profesor" replace />
  return <>{children}</>
}

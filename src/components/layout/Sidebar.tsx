import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { X, Shield } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'
import NavIconImg from '../common/NavIconImg'
import UserAvatar from '../common/UserAvatar'
import {
  iconDashboard,
  iconApuntes,
  iconLogros,
  iconActividades,
  iconPerfil,
  iconLogout,
} from '../../assets/Icons'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

type NavItem =
  | { to: string; label: string; src: string; alt: string }
  | { to: string; label: string; icon: 'shield' }

const baseNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', src: iconDashboard, alt: 'Dashboard' },
  { to: '/dashboard/notes', label: 'Apuntes', src: iconApuntes, alt: 'Apuntes' },
  { to: '/dashboard/achievements', label: 'Logros', src: iconLogros, alt: 'Logros' },
  { to: '/dashboard/activities', label: 'Actividades', src: iconActividades, alt: 'Actividades' },
  { to: '/dashboard/profile', label: 'Perfil', src: iconPerfil, alt: 'Perfil' },
]

const ROLE_LABEL = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
} as const

function isPngItem(item: NavItem): item is Extract<NavItem, { src: string }> {
  return 'src' in item
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user, can } = useAuth()

  const navItems = useMemo(() => {
    const items: NavItem[] = [...baseNav]
    if (can('admin:panel')) {
      items.push({ to: '/dashboard/admin', label: 'Administración', icon: 'shield' })
    }
    return items
  }, [can])

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <span className="font-semibold text-foreground">Portfolio</span>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-secondary"
              aria-label="Cerrar menu"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name} avatarUrl={user?.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.role && (
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {ROLE_LABEL[user.role]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4" aria-label="Menu principal">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                        'hover:bg-secondary',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground'
                      )
                    }
                  >
                    {isPngItem(item) ? (
                      <NavIconImg src={item.src} alt={item.alt} />
                    ) : (
                      <Shield className="w-5 h-5 shrink-0" aria-hidden />
                    )}
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <img src={iconLogout} alt="" className="w-6 h-6 object-contain shrink-0" aria-hidden />
              Cerrar Sesion
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

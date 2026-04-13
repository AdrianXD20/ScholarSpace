import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { X, LayoutGrid, BookOpen, User, LogOut } from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'
import UserAvatar from '../../components/common/UserAvatar'

interface ProfesorSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  end: boolean
}

const nav: NavItem[] = [
  { to: '/profesor', label: 'Panel Docente', icon: <LayoutGrid className="w-5 h-5" />, end: true },
  { to: '/profesor/clases', label: 'Mis Clases', icon: <BookOpen className="w-5 h-5" />, end: false },
  { to: '/dashboard/profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, end: false },
]

export default function ProfesorSidebar({ isOpen, onClose }: ProfesorSidebarProps) {
  const { logout, user } = useAuth()

  const items = useMemo(() => nav, [])

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
            <div>
              <span className="font-semibold text-foreground block">ScholarSpace</span>
              <span className="text-xs text-muted-foreground">Vista docente</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-secondary"
              aria-label="Cerrar menú"
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
                <p className="text-xs text-primary font-medium mt-0.5">Docente</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4" aria-label="Navegación docente">
            <ul className="flex flex-col gap-1">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                        'hover:bg-secondary',
                        isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                      )
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  X, Shield, LayoutGrid, BookOpen, FolderOpen, Trophy, 
  CheckSquare, User, LogOut, Settings
} from 'lucide-react'
import { cn } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth'
import UserAvatar from '../common/UserAvatar'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const baseNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { to: '/dashboard/notes', label: 'Apuntes', icon: <BookOpen className="w-5 h-5" /> },
  { to: '/dashboard/projects', label: 'Proyectos', icon: <FolderOpen className="w-5 h-5" /> },
  { to: '/dashboard/achievements', label: 'Logros', icon: <Trophy className="w-5 h-5" /> },
  { to: '/dashboard/activities', label: 'Actividades', icon: <CheckSquare className="w-5 h-5" /> },
  { to: '/dashboard/profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
]

const ROLE_LABEL = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
} as const

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user, can } = useAuth()

  const handleLogout = () => {
    onClose()
    logout()
  }

  const navItems = useMemo(() => {
    const items: NavItem[] = [...baseNav]
    if (can('admin:panel')) {
      items.push({ to: '/dashboard/admin', label: 'Administración', icon: <Settings className="w-5 h-5" /> })
    }
    if (can('teacher:classes:manage')) {
      items.push({ to: '/profesor', label: 'Panel Docente', icon: <LayoutGrid className="w-5 h-5" /> })
    }
    return items
  }, [can])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-white via-[#f8faf8] to-[#f0f8f4]',
          'border-r-2 border-r-[#000] shadow-[3px_0_8px_rgba(0,0,0,0.15)]',
          'transform transition-all duration-300 ease-out',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - Logo & Close */}
          <div className="p-5 border-b-2 border-b-[#000] bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#7dc280] border-2 border-[#000] flex items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,0.12)]">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-black text-[#000] text-sm">SCHOLAR</h1>
                  <p className="text-xs text-[#7dc280] font-bold">SPACE</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg border-2 border-[#000] bg-white hover:bg-[#ff7b7b] hover:text-white transition-all shadow-[2px_2px_0_rgba(0,0,0,0.08)]"
                aria-label="Cerrar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Card */}
          <div className="p-4 m-3 rounded-xl border-2 border-[#000] bg-white shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name} avatarUrl={user?.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#000] truncate">{user?.name}</p>
                <p className="text-xs text-[#636e72] truncate">{user?.email}</p>
                {user?.role && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#7dc280]" />
                    <span className="text-xs text-[#7dc280] font-bold">
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto" aria-label="Menu principal">
            <p className="text-xs font-extrabold text-[#636e72] px-2 mb-2 uppercase">Navegación</p>
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                        'border-2 border-transparent font-semibold text-sm',
                        isActive
                          ? 'bg-[#7dc280] text-white border-2 border-[#000] shadow-[3px_3px_0_rgba(0,0,0,0.12)]'
                          : 'text-[#636e72] hover:bg-[#f0f8f4] hover:text-[#7dc280] hover:border-[#7dc280]'
                      )
                    }
                  >
                    <span className="shrink-0 flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer - Logout */}
          <div className="p-3 border-t-2 border-t-[#000] bg-white">
            <button
              onClick={handleLogout}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 rounded-lg',
                'bg-white border-2 border-[#000] text-[#000] font-semibold',
                'hover:bg-[#ff7b7b] hover:text-white hover:border-[#ff7b7b]',
                'transition-all duration-200 shadow-[2px_2px_0_rgba(0,0,0,0.08)]'
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

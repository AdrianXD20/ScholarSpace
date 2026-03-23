import { Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import UserAvatar from '../common/UserAvatar'
import { iconBuscar, iconNotificacion } from '../../assets/Icons'

interface NavbarProps {
  onMenuClick: () => void
  title?: string
}

export default function Navbar({ onMenuClick, title = 'Dashboard' }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Buscar"
          >
            <img src={iconBuscar} alt="" className="w-6 h-6 object-contain" aria-hidden />
          </button>

          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
            aria-label="Notificaciones"
          >
            <img src={iconNotificacion} alt="" className="w-6 h-6 object-contain" aria-hidden />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          <UserAvatar name={user?.name} avatarUrl={user?.avatar} size="nav" />
        </div>
      </div>
    </header>
  )
}

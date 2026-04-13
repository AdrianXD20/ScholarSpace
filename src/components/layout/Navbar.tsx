import { Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import UserAvatar from '../common/UserAvatar'

interface NavbarProps {
  onMenuClick: () => void
  title?: string
}

export default function Navbar({ onMenuClick, title = 'Dashboard' }: NavbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-[#000] shadow-[0_4px_0_rgba(0,0,0,0.12)]">
      <div className="page-shell flex h-16 min-w-0 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-sm border-2 border-[#000] bg-white hover:bg-[#f8f8f8] transition-colors notebook-icon-btn shadow-[2px_2px_0_rgba(0,0,0,0.08)]"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-[#000]" />
          </button>
          <h1 className="truncate text-lg font-extrabold text-[#000]">{title}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <UserAvatar name={user?.name} avatarUrl={user?.avatar} size="nav" />
        </div>
      </div>
    </header>
  )
}

import { cn, getInitials } from '../../utils/helpers'

interface UserAvatarProps {
  name?: string | null
  avatarUrl?: string | null
  /** sm 32px · md 40px · nav 36px (navbar) · lg 64px · xl 96px (perfil) */
  size?: 'sm' | 'md' | 'nav' | 'lg' | 'xl'
  className?: string
}

const sizeClass: Record<NonNullable<UserAvatarProps['size']>, string> = {
  sm: 'w-8 h-8 min-w-8 min-h-8 text-xs',
  md: 'w-10 h-10 min-w-10 min-h-10 text-sm',
  nav: 'w-9 h-9 min-w-9 min-h-9 text-sm',
  lg: 'w-16 h-16 min-w-16 min-h-16 text-2xl',
  xl: 'w-24 h-24 min-w-24 min-h-24 text-3xl',
}

/** Solo foto de perfil (`user.avatar`) o iniciales si no hay imagen. */
export default function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const dim = sizeClass[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn(dim, 'rounded-full object-cover shrink-0', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        dim,
        'rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary',
        className
      )}
    >
      {name ? getInitials(name) : '?'}
    </div>
  )
}

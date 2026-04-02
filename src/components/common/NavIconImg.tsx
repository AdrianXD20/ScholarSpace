import { cn } from '../../utils/helpers'

interface NavIconImgProps {
  src: string
  alt: string
  className?: string
}

/** Icono de navegación desde `src/assets/Icons/*.png` */
export default function NavIconImg({ src, alt, className }: NavIconImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-6 h-6 object-contain shrink-0 notebook-icon', className)}
      loading="lazy"
    />
  )
}

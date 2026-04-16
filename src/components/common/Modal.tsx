import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const scrollY = window.scrollY
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width
    const previousHtmlOverflow = document.documentElement.style.overflow

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Bloquea scroll del fondo de forma robusta (body + html).
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)

      document.body.style.overflow = previousBodyOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      document.documentElement.style.overflow = previousHtmlOverflow

      if (isOpen) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-sm border-2 border-[#000]',
          'shadow-[8px_8px_0_rgba(0,0,0,0.18)]',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-[#000]">
          {title && (
            <h2 id="modal-title" className="text-lg font-extrabold text-[#000]">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-sm border-2 border-[#000] bg-white hover:bg-[#f0f0f0] transition-colors ml-auto notebook-icon-btn"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-[#000]" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

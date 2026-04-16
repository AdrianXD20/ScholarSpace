import { useState, useEffect } from 'react'
import { cn } from '../../utils/helpers'
import type { Toast } from '../../context/ToastContext'

interface ToastComponentProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastComponent({ toast, onClose }: ToastComponentProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(handleClose, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.id])

  return (
    <div
      className={cn(
        'toast',
        `toast-${toast.type}`,
        isExiting && 'exiting'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        {toast.type === 'loading' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v6M15.657 6.343l-4.242 4.242" strokeLinecap="round" />
          </svg>
        ) : toast.type === 'success' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" strokeDasharray="100" strokeDashoffset="100" />
          </svg>
        ) : toast.type === 'error' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M7 7l10 10M17 7L7 17" />
          </svg>
        ) : toast.type === 'warning' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 3L2.5 20.5h19L12 3z" />
            <path d="M12 9v6M12 18h.01" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 10v6M12 7h.01" />
          </svg>
        )}
      </div>

      <div className="toast-content">
        <p className="toast-title">{toast.title}</p>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>

      {toast.closeable && (
        <button
          onClick={handleClose}
          className="toast-close"
          aria-label="Cerrar notificación"
          title="Cerrar"
        >
          ✕
        </button>
      )}

      {toast.duration && toast.duration > 0 && (
        <div
          className={cn('toast-progress', toast.type)}
          style={{
            animationDuration: `${toast.duration}ms`,
          }}
        />
      )}
    </div>
  )
}

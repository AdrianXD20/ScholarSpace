import type { ReactNode } from 'react'
import { cn } from '../../utils/helpers'

interface AuthNotebookLayoutProps {
  children: ReactNode
  /** Ilustración superior */
  hero?: 'lock' | 'book'
  /** Etiqueta tipo “tag” encima del título */
  tag?: string
  tagClassName?: string
  title: ReactNode
  subtitle?: ReactNode
  /** Pasos 1–3 para flujos largos (ej. recuperar contraseña) */
  steps?: { label: string; state: 'pending' | 'active' | 'done' }[]
  className?: string
}

/** Ilustración simple: candado + llave (estilo dibujo plano) */
function SketchBookHero() {
  return (
    <div className="flex justify-center mb-6" aria-hidden>
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="12" width="72" height="66" fill="#fff" stroke="var(--sketch-ink)" strokeWidth="2.5" />
        <line x1="60" y1="12" x2="60" y2="78" stroke="var(--sketch-ink)" strokeWidth="2" />
        <path d="M32 28h20M32 40h48M32 52h36" stroke="var(--sketch-blue)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="88" cy="24" r="8" fill="var(--sketch-yellow)" stroke="var(--sketch-ink)" strokeWidth="2" />
        <path d="M4 86h112" stroke="var(--sketch-blue)" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
    </div>
  )
}

function SketchLockHero() {
  return (
    <div className="flex justify-center mb-6" aria-hidden>
      <svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[var(--sketch-ink)]"
      >
        <rect x="28" y="42" width="64" height="52" stroke="currentColor" strokeWidth="2.5" fill="#fff" />
        <path
          d="M40 42V32C40 22.06 47.16 14 60 14s20 8.06 20 22v10"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="60" cy="62" r="6" fill="var(--sketch-yellow)" stroke="currentColor" strokeWidth="2" />
        <path
          d="M78 58c8 4 14 12 16 22M82 52l12-8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="96" cy="38" r="5" fill="var(--sketch-green)" stroke="currentColor" strokeWidth="2" />
        <path d="M4 88h112" stroke="var(--sketch-blue)" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
    </div>
  )
}

export default function AuthNotebookLayout({
  children,
  hero = 'lock',
  tag,
  tagClassName,
  title,
  subtitle,
  steps,
  className,
}: AuthNotebookLayoutProps) {
  return (
    <main className={cn('auth-notebook-bg flex items-center justify-center px-4 py-10', className)}>
      <div className="w-full max-w-lg">
        {hero === 'book' ? <SketchBookHero /> : <SketchLockHero />}

        <div className="text-center mb-6 space-y-2">
          {tag && (
            <div>
              <span
                className={cn(
                  'auth-sketch-tag',
                  tagClassName ?? 'bg-[var(--sketch-green)]'
                )}
              >
                {tag}
              </span>
            </div>
          )}
          <h1 className="auth-sketch-title text-3xl sm:text-4xl tracking-tight">{title}</h1>
          {subtitle && <p className="text-[var(--sketch-ink)]/80 text-sm sm:text-base max-w-md mx-auto">{subtitle}</p>}
        </div>

        {steps && steps.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    'auth-sketch-step',
                    s.state === 'active' && 'auth-sketch-step-active',
                    s.state === 'done' && 'auth-sketch-step-done',
                    s.state === 'pending' && 'bg-white'
                  )}
                  aria-current={s.state === 'active' ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-bold text-[var(--sketch-ink)] uppercase tracking-wide hidden sm:inline">
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <span className="text-[var(--sketch-ink)] font-black mx-1" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="auth-sketch-panel p-6 sm:p-8">{children}</div>

        <p className="text-center text-xs text-[var(--sketch-ink)]/60 mt-4 font-medium">
          ScholarSpace · tu portafolio académico
        </p>
      </div>
    </main>
  )
}

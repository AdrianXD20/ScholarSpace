import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AuthNotebookLayout from '../../components/auth/AuthNotebookLayout'
import { useAuth } from '../../hooks/useAuth'
import { defaultHomePath } from '../../routes/guards'
import { AUTH_LIMITS, isValidEmail } from '../../utils/authValidation'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    const st = location.state as { resetOk?: boolean; registeredOk?: boolean } | null
    if (st?.resetOk) {
      setInfo('Contraseña actualizada. Inicia sesión con tu nueva clave.')
    } else if (st?.registeredOk) {
      setInfo('Cuenta creada correctamente. Inicia sesión con tus credenciales.')
    }
  }, [location.state])

  const handleSubmit = async () => {
    setError('')
    setInfo('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }
    if (!isValidEmail(email) || email.trim().length > AUTH_LIMITS.email.max) {
      setError('Correo inválido: debe incluir "@" y un formato válido.')
      return
    }
    if (password.length < AUTH_LIMITS.password.min || password.length > AUTH_LIMITS.password.max) {
      setError(`La contraseña debe tener entre ${AUTH_LIMITS.password.min} y ${AUTH_LIMITS.password.max} caracteres.`)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await login({ email, password })
      if (result.ok) {
        navigate(defaultHomePath(result.user?.role), { replace: true })
      } else {
        setError(result.error ?? 'Credenciales incorrectas. Verifica tu email y contraseña.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthNotebookLayout
      tag="Acceso"
      tagClassName="bg-[var(--sketch-blue)]"
      title={
        <>
          <span className="text-[var(--sketch-red)]">Student</span>{' '}
          <span className="auth-sketch-highlighter">Portfolio</span>
        </>
      }
      subtitle="Tu espacio para crecer y documentar tu camino"
    >
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-black text-[var(--sketch-ink)] uppercase tracking-wide">Iniciar sesión</h2>
        <p className="text-sm text-[var(--sketch-ink)]/75">
          Ingresa tus credenciales para acceder a tu portafolio
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="flex flex-col gap-4"
      >
        {info && <div className="p-3 text-sm font-medium auth-sketch-alert-ok">{info}</div>}
        {error && <div className="p-3 text-sm font-medium auth-sketch-alert-error">{error}</div>}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 auth-sketch-input"
            aria-label="Correo electronico"
            minLength={AUTH_LIMITS.email.min}
            maxLength={AUTH_LIMITS.email.max}
            error={
              email.length > 0 && !isValidEmail(email)
                ? 'Correo inválido: debe incluir "@".'
                : undefined
            }
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
          <Input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 auth-sketch-input"
            aria-label="Contraseña"
            minLength={AUTH_LIMITS.password.min}
            maxLength={AUTH_LIMITS.password.max}
            error={
              password.length > 0 &&
                (password.length < AUTH_LIMITS.password.min || password.length > AUTH_LIMITS.password.max)
                ? `Debe tener entre ${AUTH_LIMITS.password.min} y ${AUTH_LIMITS.password.max} caracteres.`
                : undefined
            }
          />
        </div>

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          isLoading={isSubmitting}
          className="w-full mt-2 auth-sketch-btn focus:ring-offset-[var(--sketch-paper)]"
        >
          Iniciar sesión
        </Button>

        <p className="text-center text-sm">
          <Link to="/forgot-password" className="auth-sketch-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center text-sm text-[var(--sketch-ink)]/80">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-sketch-link">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </AuthNotebookLayout>
  )
}

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Mail, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { defaultHomePath } from '../../routes/guards'
import { AUTH_LIMITS, isValidEmail } from '../../utils/authValidation'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuth()
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
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

    const result = await login({ email, password })
    if (result.ok) {
      navigate(defaultHomePath(result.user?.role))
    } else {
      setError(result.error ?? 'Credenciales incorrectas. Verifica tu email y contraseña.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Student Portfolio</h1>
          <p className="text-muted-foreground mt-2">Tu espacio para crecer y documentar tu camino</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesion</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a tu portafolio</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {info && (
                <div className="p-3 rounded-lg bg-primary/10 text-foreground text-sm">{info}</div>
              )}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  aria-label="Contraseña"
                  minLength={AUTH_LIMITS.password.min}
                  maxLength={AUTH_LIMITS.password.max}
                  error={
                    password.length > 0 &&
                    (password.length < AUTH_LIMITS.password.min ||
                      password.length > AUTH_LIMITS.password.max)
                      ? `Debe tener entre ${AUTH_LIMITS.password.min} y ${AUTH_LIMITS.password.max} caracteres.`
                      : undefined
                  }
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                Iniciar Sesion
              </Button>

              <p className="text-center text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>

              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Registrate aqui
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

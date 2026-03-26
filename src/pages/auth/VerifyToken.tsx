import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Key, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { authService } from '../../services/auth.service'

export default function VerifyToken() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') ?? ''
  const [token, setToken] = useState(tokenFromUrl)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError('Ingresa el token de recuperación que recibiste en tu correo.')
      return
    }

    setIsLoading(true)

    const result = await authService.verifyResetToken(token.trim())
    setIsLoading(false)

    if (result.ok) {
      // Redirigir a la página de nueva contraseña con el token
      navigate(`/reset-password?token=${encodeURIComponent(token.trim())}`)
    } else {
      setError(result.error ?? 'Token inválido o expirado.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Verificar token</h1>
          <p className="text-muted-foreground mt-2">
            {tokenFromUrl 
              ? 'Hemos detectado un token en el enlace. Confirma para continuar.' 
              : 'Ingresa el token que recibiste en tu correo electrónico.'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Token de recuperación</CardTitle>
            <CardDescription>
              {tokenFromUrl 
                ? 'Revisa el token y continúa para crear tu nueva contraseña.' 
                : 'Pega el código de verificación que te enviamos por correo.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ingresa tu token de recuperación"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                  aria-label="Token de recuperación"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                {isLoading ? 'Verificando...' : tokenFromUrl ? 'Continuar' : 'Verificar token'}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿No recibiste el correo?
                </p>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Solicitar nuevo enlace
                </Link>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
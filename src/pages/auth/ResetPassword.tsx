import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Lock, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { authService } from '../../services/auth.service'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Falta el token de recuperación. Abre el enlace del correo.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setIsLoading(true)
    const result = await authService.resetPassword(token, password)
    setIsLoading(false)
    if (result.ok) {
      navigate('/login', { replace: true, state: { resetOk: true } })
    } else {
      setError(result.error ?? 'No se pudo actualizar la contraseña.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="text-muted-foreground mt-2">Elige una contraseña segura para tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>El token viaja en la URL (query `token`)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="new-password"
                  aria-label="Nueva contraseña"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10"
                  autoComplete="new-password"
                  aria-label="Confirmar contraseña"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                Guardar contraseña
              </Button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Ir al inicio de sesión
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

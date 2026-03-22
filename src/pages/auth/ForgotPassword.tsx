import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Mail, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { authService } from '../../services/auth.service'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    setIsLoading(true)
    const result = await authService.requestPasswordReset(email.trim())
    setIsLoading(false)
    if (result.ok) {
      setMessage(
        'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.'
      )
    } else {
      setError(result.error ?? 'No se pudo procesar la solicitud.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Recuperar contraseña</h1>
          <p className="text-muted-foreground mt-2">
            Te enviaremos un enlace para crear una nueva contraseña
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Olvidé mi contraseña</CardTitle>
            <CardDescription>Escribe el correo asociado a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 rounded-lg bg-primary/10 text-foreground text-sm">{message}</div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  aria-label="Correo electrónico"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                Enviar enlace
              </Button>

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

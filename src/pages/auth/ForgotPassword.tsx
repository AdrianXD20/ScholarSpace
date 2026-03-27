import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Mail, ArrowLeft, Key, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { authService } from '../../services/auth.service'
import { getPasswordChecklist, isPasswordValid } from '../../utils/authValidation'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const step = searchParams.get('step') ?? 'email'
  const emailParam = searchParams.get('email') ?? ''
  const tokenParam = searchParams.get('token') ?? ''

  const [email, setEmail] = useState(emailParam)
  const [token, setToken] = useState(tokenParam)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isVerifyingToken, setIsVerifyingToken] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const checklist = useMemo(() => getPasswordChecklist(password), [password])
  const passwordOk = isPasswordValid(password)
  const confirmOk = confirmPassword.length > 0 && confirmPassword === password

  // Sincroniza estado con los query params cuando el router actualiza la URL.
  // Evita casos donde el componente no se remonta y `token` queda vacío.
  useEffect(() => {
    if (step === 'email') {
      setEmail(emailParam)
      setToken('')
      return
    }

    if (emailParam) setEmail(emailParam)
    if (tokenParam) setToken(tokenParam)
  }, [step, emailParam, tokenParam])

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    setIsSendingEmail(true)
    const result = await authService.requestPasswordReset(email.trim())
    setIsSendingEmail(false)
    if (result.ok) {
      setMessage('Código generado. Ahora ingrésalo para continuar con el cambio de contraseña.')
      navigate(
        `/forgot-password?step=token&email=${encodeURIComponent(email.trim())}`,
        { replace: true }
      )
    } else {
      setError(result.error ?? 'No se pudo procesar la solicitud.')
    }
  }

  const handleTokenSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!token.trim()) {
      setError('Ingresa el código de verificación.')
      return
    }
    setIsVerifyingToken(true)
    const result = await authService.verifyResetToken(token.trim())
    setIsVerifyingToken(false)
    if (!result.ok) {
      setError(result.error ?? 'Código inválido o expirado.')
      return
    }
    setMessage('Código validado. Ya puedes ingresar tu nueva contraseña.')
    navigate(
      `/forgot-password?step=reset&email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(token.trim())}`,
      { replace: true }
    )
  }

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token.trim()) {
      setError('Falta el código de verificación.')
      return
    }
    if (!passwordOk) {
      setError('Contraseña inválida: no cumple con los requisitos.')
      return
    }
    if (!confirmOk) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsChangingPassword(true)
    const result = await authService.resetPassword(token.trim(), password)
    setIsChangingPassword(false)

    if (!result.ok) {
      setError(result.error ?? 'No se pudo cambiar la contraseña.')
      return
    }

    navigate('/login', { replace: true, state: { resetOk: true } })
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
            Proceso continuo: correo, código y nueva contraseña en una sola vista
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Olvidé mi contraseña</CardTitle>
            <CardDescription>Solicita tu código, valídalo y actualiza tu contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={
                step === 'reset' ? handleResetSubmit : step === 'token' ? handleTokenSubmit : handleEmailSubmit
              }
              className="flex flex-col gap-4"
            >
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
                  disabled={step !== 'email'}
                />
              </div>

              {step !== 'email' && (
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Código de verificación"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                    aria-label="Código de verificación"
                    disabled={step === 'reset'}
                  />
                </div>
              )}

              {step === 'reset' && (
                <>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 ${passwordOk ? 'border-green-500 focus:ring-green-500' : ''}`}
                      autoComplete="new-password"
                      aria-label="Nueva contraseña"
                    />
                  </div>
                  <div className="rounded-lg border border-border p-3 text-sm space-y-1.5">
                    <p className={checklist.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                      {checklist.hasSpecial ? '✔' : '✖'} Al menos un carácter especial.
                    </p>
                    <p className={checklist.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                      {checklist.hasNumber ? '✔' : '✖'} Al menos un número.
                    </p>
                    <p className={checklist.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                      {checklist.hasUppercase ? '✔' : '✖'} Al menos una mayúscula.
                    </p>
                    <p className={checklist.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                      {checklist.minLength ? '✔' : '✖'} Longitud mínima (8).
                    </p>
                    {passwordOk && <p className="text-green-600 font-medium">Contraseña válida.</p>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      aria-label="Confirmar contraseña"
                    />
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-sm ${confirmOk ? 'text-green-600' : 'text-destructive'}`}>
                      {confirmOk ? '✔ Coinciden' : '✖ No coinciden'}
                    </p>
                  )}
                </>
              )}

              <Button
                type="submit"
                isLoading={step === 'email' ? isSendingEmail : step === 'token' ? isVerifyingToken : isChangingPassword}
                className="w-full mt-2"
              >
                {step === 'email'
                  ? 'Generar código'
                  : step === 'token'
                    ? 'Validar código'
                    : 'Cambiar contraseña'}
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

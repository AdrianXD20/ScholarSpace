import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, ArrowLeft, Key, Lock } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AuthNotebookLayout from '../../components/auth/AuthNotebookLayout'
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

  useEffect(() => {
    if (step === 'email') {
      setEmail(emailParam)
      setToken('')
      return
    }

    if (emailParam) setEmail(emailParam)
    if (tokenParam) setToken(tokenParam)
  }, [step, emailParam, tokenParam])

  const stepsUi = useMemo((): { label: string; state: 'pending' | 'active' | 'done' }[] => {
    const s1: 'pending' | 'active' | 'done' = step === 'email' ? 'active' : 'done'
    const s2: 'pending' | 'active' | 'done' =
      step === 'token' ? 'active' : step === 'reset' ? 'done' : 'pending'
    const s3: 'pending' | 'active' | 'done' = step === 'reset' ? 'active' : 'pending'
    return [
      { label: 'Correo', state: s1 },
      { label: 'Código', state: s2 },
      { label: 'Nueva clave', state: s3 },
    ]
  }, [step])

  const handleEmailSubmit = async () => {
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
      navigate(`/forgot-password?step=token&email=${encodeURIComponent(email.trim())}`, { replace: true })
    } else {
      setError(result.error ?? 'No se pudo procesar la solicitud.')
    }
  }

  const handleTokenSubmit = async () => {
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

  const handleResetSubmit = async () => {
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
    <AuthNotebookLayout
      tag="Recuperar"
      tagClassName="bg-[var(--sketch-yellow)]"
      title={
        <>
          <span className="auth-sketch-highlighter">Contraseña</span>{' '}
          <span className="text-[var(--sketch-blue)]">segura</span>
        </>
      }
      subtitle="Correo → código que te enviamos → nueva contraseña, todo en un solo lugar"
      steps={stepsUi}
    >
      <div className="space-y-1 mb-6">
        <h2 className="text-xl font-black text-[var(--sketch-ink)] uppercase tracking-wide">
          {step === 'email' && 'Paso 1 · Tu correo'}
          {step === 'token' && 'Paso 2 · Verificación'}
          {step === 'reset' && 'Paso 3 · Nueva clave'}
        </h2>
        <p className="text-sm text-[var(--sketch-ink)]/75">
          Solicita tu código, valídalo y actualiza tu contraseña
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="flex flex-col gap-4"
      >
        {error && <div className="p-3 text-sm font-medium auth-sketch-alert-error">{error}</div>}
        {message && <div className="p-3 text-sm font-medium auth-sketch-alert-ok">{message}</div>}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 auth-sketch-input"
            autoComplete="email"
            aria-label="Correo electrónico"
            disabled={step !== 'email'}
          />
        </div>

        {step !== 'email' && (
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
            <Input
              type="text"
              placeholder="Código de verificación"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="pl-10 auth-sketch-input"
              autoComplete="off"
              aria-label="Código de verificación"
              disabled={step === 'reset'}
            />
          </div>
        )}

        {step === 'reset' && (
          <>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 auth-sketch-input ${passwordOk ? '!border-[var(--sketch-green)] !shadow-[inset_0_0_0_2px_var(--sketch-green)]' : ''}`}
                autoComplete="new-password"
                aria-label="Nueva contraseña"
              />
            </div>
            <div className="auth-sketch-checklist p-3 text-sm space-y-1.5">
              <p className={checklist.hasSpecial ? 'font-bold text-[var(--sketch-ink)]' : 'text-[var(--sketch-ink)]/60'}>
                {checklist.hasSpecial ? '✔' : '○'} Al menos un carácter especial.
              </p>
              <p className={checklist.hasNumber ? 'font-bold text-[var(--sketch-ink)]' : 'text-[var(--sketch-ink)]/60'}>
                {checklist.hasNumber ? '✔' : '○'} Al menos un número.
              </p>
              <p className={checklist.hasUppercase ? 'font-bold text-[var(--sketch-ink)]' : 'text-[var(--sketch-ink)]/60'}>
                {checklist.hasUppercase ? '✔' : '○'} Al menos una mayúscula.
              </p>
              <p className={checklist.minLength ? 'font-bold text-[var(--sketch-ink)]' : 'text-[var(--sketch-ink)]/60'}>
                {checklist.minLength ? '✔' : '○'} Longitud mínima (8).
              </p>
              {passwordOk && (
                <p className="font-black text-[var(--sketch-ink)]">
                  <span className="auth-sketch-highlighter">Contraseña válida</span>
                </p>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sketch-ink)]" />
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 auth-sketch-input"
                autoComplete="new-password"
                aria-label="Confirmar contraseña"
              />
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-sm font-bold ${confirmOk ? 'text-[var(--sketch-green)]' : 'text-[var(--sketch-red)]'}`}>
                {confirmOk ? '✔ Coinciden' : '✖ No coinciden'}
              </p>
            )}
          </>
        )}

        <Button
          type="button"
          onClick={() => {
            if (step === 'reset') void handleResetSubmit()
            else if (step === 'token') void handleTokenSubmit()
            else void handleEmailSubmit()
          }}
          isLoading={step === 'email' ? isSendingEmail : step === 'token' ? isVerifyingToken : isChangingPassword}
          className="w-full mt-2 auth-sketch-btn focus:ring-offset-[var(--sketch-paper)]"
        >
          {step === 'email' ? 'Generar código' : step === 'token' ? 'Validar código' : 'Cambiar contraseña'}
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-sm auth-sketch-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthNotebookLayout>
  )
}

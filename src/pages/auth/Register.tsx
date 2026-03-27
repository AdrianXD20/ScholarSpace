import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Building,
  GraduationCap,
  School,
  Award,
  Hash,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/auth.service'
import type { AccountType } from '../../types/user.types'
import {
  AUTH_LIMITS,
  getPasswordChecklist,
  isPasswordValid,
  isValidEmail,
} from '../../utils/authValidation'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [accountType, setAccountType] = useState<AccountType>('student')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    career: '',
    codigoClase: '',
    titulacionAcademica: '',
    departamento: '',
    anosExperiencia: '',
    cargo: '',
  })
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailTaken, setEmailTaken] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const passwordRules = getPasswordChecklist(formData.password)
  const passwordOk = isPasswordValid(formData.password)
  const confirmOk = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

  useEffect(() => {
    const email = formData.email.trim()
    setEmailTaken(false)
    setEmailError('')

    if (!email) return
    if (!isValidEmail(email)) {
      setEmailError('Correo inválido: debe incluir "@" y dominio válido.')
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingEmail(true)
      const result = await authService.checkEmailExists(email)
      setIsCheckingEmail(false)
      if (!result.ok) return
      if (result.exists) {
        setEmailTaken(true)
        setEmailError('Este correo ya está registrado.')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.email])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa los campos obligatorios')
      return
    }

    const nameLen = formData.name.trim().length
    if (nameLen < AUTH_LIMITS.name.min || nameLen > AUTH_LIMITS.name.max) {
      setError(`El nombre debe tener entre ${AUTH_LIMITS.name.min} y ${AUTH_LIMITS.name.max} caracteres.`)
      return
    }

    const emailLen = formData.email.trim().length
    if (emailLen < AUTH_LIMITS.email.min || emailLen > AUTH_LIMITS.email.max || !isValidEmail(formData.email)) {
      setError('Correo inválido: debe incluir "@" y un formato válido.')
      return
    }

    if (emailTaken) {
      setError('Correo ya registrado.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (
      formData.password.length > AUTH_LIMITS.password.max ||
      !isPasswordValid(formData.password)
    ) {
      setError('Contraseña inválida: no cumple con los requisitos.')
      return
    }

    if (accountType === 'teacher') {
      if (!formData.titulacionAcademica.trim() || !formData.departamento.trim()) {
        setError('Titulación y departamento son obligatorios para docentes.')
        return
      }
      const anos = Number(formData.anosExperiencia)
      if (formData.anosExperiencia === '' || Number.isNaN(anos) || anos < 0) {
        setError('Indica años válidos de experiencia docente (0 o más).')
        return
      }
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      institution: formData.institution,
      career: formData.career,
      accountType,
      codigoClase: accountType === 'student' ? formData.codigoClase : undefined,
      perfilDocente:
        accountType === 'teacher'
          ? {
              titulacionAcademica: formData.titulacionAcademica.trim(),
              departamento: formData.departamento.trim(),
              anosExperiencia: Number(formData.anosExperiencia),
              cargo: formData.cargo.trim() || undefined,
            }
          : undefined,
    })

    if (result.ok) {
      navigate('/login', { replace: true, state: { registeredOk: true } })
    } else {
      setError(result.error ?? 'No se pudo completar el registro.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-muted-foreground mt-2">
            Estudiante o docente: elige tu perfil y completa los datos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Los docentes deben indicar titulación y experiencia para validar su perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-secondary/50">
                <button
                  type="button"
                  onClick={() => setAccountType('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    accountType === 'student'
                      ? 'bg-card shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <School className="w-4 h-4" />
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('teacher')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    accountType === 'teacher'
                      ? 'bg-card shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Docente
                </button>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="Nombre completo *"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  aria-label="Nombre completo"
                  minLength={AUTH_LIMITS.name.min}
                  maxLength={AUTH_LIMITS.name.max}
                  error={
                    formData.name.length > 0 &&
                    (formData.name.trim().length < AUTH_LIMITS.name.min ||
                      formData.name.trim().length > AUTH_LIMITS.name.max)
                      ? `Debe tener entre ${AUTH_LIMITS.name.min} y ${AUTH_LIMITS.name.max} caracteres.`
                      : undefined
                  }
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  placeholder="tu@email.com *"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  aria-label="Correo electronico"
                  minLength={AUTH_LIMITS.email.min}
                  maxLength={AUTH_LIMITS.email.max}
                  error={emailError || undefined}
                />
              </div>
              {isCheckingEmail && (
                <p className="text-xs text-muted-foreground -mt-2">Validando correo en servidor...</p>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Contraseña *"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 ${passwordOk ? 'border-green-500 focus:ring-green-500' : ''}`}
                  aria-label="Contraseña"
                  minLength={AUTH_LIMITS.password.min}
                  maxLength={AUTH_LIMITS.password.max}
                  error={
                    formData.password.length > 0 && !passwordOk
                      ? 'Contraseña inválida: no cumple con los requisitos.'
                      : undefined
                  }
                />
              </div>
              {formData.password.length > 0 && (
                <div className="rounded-lg border border-border p-3 text-sm space-y-1.5">
                  <p className={passwordRules.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordRules.hasSpecial ? '✔' : '✖'} Contiene al menos un carácter especial.
                  </p>
                  <p className={passwordRules.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordRules.hasNumber ? '✔' : '✖'} Contiene al menos un número.
                  </p>
                  <p className={passwordRules.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordRules.hasUppercase ? '✔' : '✖'} Contiene al menos una letra mayúscula.
                  </p>
                  <p className={passwordRules.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                    {passwordRules.minLength ? '✔' : '✖'} Cumple longitud mínima (≥ 8).
                  </p>
                  {passwordOk && <p className="text-green-600 font-medium">Contraseña válida.</p>}
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirmar contraseña *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  aria-label="Confirmar contraseña"
                  error={
                    formData.confirmPassword.length > 0 && !confirmOk
                      ? 'Las contraseñas no coinciden.'
                      : undefined
                  }
                />
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`text-sm ${confirmOk ? 'text-green-600' : 'text-destructive'}`}>
                  {confirmOk ? <CheckCircle2 className="inline w-4 h-4 mr-1" /> : <XCircle className="inline w-4 h-4 mr-1" />}
                  {confirmOk ? 'Coinciden' : 'No coinciden'}
                </p>
              )}

              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="institution"
                  placeholder="Institución educativa (opcional)"
                  value={formData.institution}
                  onChange={handleChange}
                  className="pl-10"
                  aria-label="Institucion educativa"
                />
              </div>

              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  name="career"
                  placeholder="Carrera o programa (opcional)"
                  value={formData.career}
                  onChange={handleChange}
                  className="pl-10"
                  aria-label="Carrera o programa"
                />
              </div>

              {accountType === 'student' && (
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    name="codigoClase"
                    placeholder="Código de clase (opcional)"
                    value={formData.codigoClase}
                    onChange={handleChange}
                    className="pl-10"
                    aria-label="Código de clase"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 pl-1">
                    Si tu profesor te dio un código, introdúcelo aquí o más tarde en tu perfil.
                  </p>
                </div>
              )}

              {accountType === 'teacher' && (
                <div className="space-y-4 rounded-lg border border-border p-4 bg-secondary/30">
                  <p className="text-sm font-medium text-foreground">Datos de docente</p>
                  <Input
                    name="titulacionAcademica"
                    label="Titulación académica *"
                    placeholder="Ej. Lic. en Matemáticas"
                    value={formData.titulacionAcademica}
                    onChange={handleChange}
                  />
                  <Input
                    name="departamento"
                    label="Departamento o área *"
                    placeholder="Ej. Ciencias exactas"
                    value={formData.departamento}
                    onChange={handleChange}
                  />
                  <Input
                    name="anosExperiencia"
                    label="Años de experiencia docente *"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.anosExperiencia}
                    onChange={handleChange}
                  />
                  <Input
                    name="cargo"
                    label="Cargo (opcional)"
                    placeholder="Ej. Profesor auxiliar"
                    value={formData.cargo}
                    onChange={handleChange}
                  />
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-2"
                disabled={emailTaken || isCheckingEmail}
              >
                Crear cuenta
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

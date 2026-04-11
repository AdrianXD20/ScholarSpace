import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Building, GraduationCap, Save, Users, Lock, Camera, Upload, X } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { notasService } from '../../services/notas.service'
import { userService } from '../../services/user.service'
import { usuarioService } from '../../services/usuario.service'
import { authService } from '../../services/auth.service'
import UserAvatar from '../../components/common/UserAvatar'
import { formatDate, cn } from '../../utils/helpers'
import { iconApuntes, iconLogros, iconActividades } from '../../assets/Icons'
import type { UsuarioData } from '../../services/usuario.service'
import { getPasswordChecklist, isPasswordValid } from '../../utils/authValidation'


const ROLE_LABEL = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
} as const

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [userData, setUserData] = useState<UsuarioData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false)
  
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    institution: '',
    career: '',
    bio: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [isSendingToken, setIsSendingToken] = useState(false)
  const checklist = getPasswordChecklist(passwordForm.password)
  const passwordOk = isPasswordValid(passwordForm.password)
  const confirmOk =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.password === passwordForm.confirmPassword

  const [stats, setStats] = useState({ notes: 0, achievements: 0, activities: 0 })

  // Load user profile from API
  useEffect(() => {
    if (!user?.id) return
    setIsLoadingProfile(true)
    usuarioService.getProfile(user.id).then((result) => {
      if (result.ok && result.data) {
        setUserData(result.data)
        setFormData({
          nombre: result.data.nombre || user.name || '',
          email: result.data.email || user.email || '',
          institution: user.institution || '',
          career: user.career || '',
          bio: user.bio || '',
        })
      }
      setIsLoadingProfile(false)
    })
  }, [user?.id])


 useEffect(() => {
  if (!user?.id) return

  const loadStats = async () => {
    const notasRes = await notasService.getNotas()

    setStats({
      notes:
        notasRes.ok && notasRes.data
          ? notasRes.data.filter(n => n.usuario_id === user.id).length
          : 0,
      achievements: userService.getAchievements(user.id).length,
      activities: userService.getActivities(user.id).length,
    })
  }

  loadStats()
}, [user?.id])

  const handleSubmit = async () => {
    if (!user?.id) return
    
    setIsSaving(true)
    const payload = {
      nombre: formData.nombre,
      email: formData.email,
    }
    
    const result = await usuarioService.updateProfile(user.id, payload)
    setIsSaving(false)

    if (result.ok && result.data) {
      setUserData(result.data)
      updateProfile({
        name: result.data.nombre,
        email: result.data.email,
      })
      setIsEditing(false)
      toast.success('¡Perfecto!' , 'Tu perfil fue actualizado')
    } else {
      toast.error('Error', result.error ?? 'No se pudo actualizar el perfil')
    }
  }

  const handlePhotoSelect = (file: File | null) => {
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Tipo inválido', 'Por favor carga una imagen (PNG, JPG, etc.)')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(
        'Archivo grande',
        `Máximo 5MB. Tu archivo: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      )
      return
    }

    setProfilePhoto(file)

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = async () => {
    if (!profilePhoto || !user?.id) return

    setIsUploadingPhoto(true)
    const toastId = toast.loading('Subiendo foto', 'Por favor espera...')

    try {
      // Aquí puedes usar tu servicio de upload
      // const result = await userService.uploadAvatar(user.id, profilePhoto)
      
      // Por ahora, crear una URL local (puedes reemplazar con tu servicio real)
      const photoUrl = photoPreview

      // Simular actualización (comenta esto cuando tengas el servicio real)
      await new Promise(resolve => setTimeout(resolve, 1500))

      updateProfile({ avatar: photoUrl })

      toast.removeToast(toastId)
      toast.success('¡Listo!', 'Tu foto de perfil fue actualizada')
      setShowPhotoUploadModal(false)
      setProfilePhoto(null)
      setPhotoPreview('')
    } catch (error) {
      toast.removeToast(toastId)
      toast.error('Error', 'No se pudo subir la foto')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePasswordChangeSubmit = async () => {
    setPasswordError('')
    if (!user?.id) return

    if (!passwordForm.token.trim()) {
      setPasswordError('Debes ingresar el código de verificación.')
      return
    }
    if (!passwordOk) {
      setPasswordError('Contraseña inválida: no cumple con los requisitos.')
      return
    }
    if (!confirmOk) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    setIsSaving(true)
    const verify = await authService.verifyResetToken(passwordForm.token.trim())
    if (!verify.ok) {
      setIsSaving(false)
      setPasswordError(verify.error ?? 'Código inválido o expirado.')
      return
    }
    const result = await authService.resetPassword(passwordForm.token.trim(), passwordForm.password)
    setIsSaving(false)

    if (result.ok) {
      alert('Contraseña actualizada correctamente')
      setShowPasswordModal(false)
      setPasswordForm({ token: '', password: '', confirmPassword: '' })
    } else {
      setPasswordError(result.error ?? 'No se pudo actualizar la contraseña')
    }
  }

  const statCards = [
    { label: 'Apuntes', value: stats.notes, src: iconApuntes, alt: 'Apuntes' },
    { label: 'Logros', value: stats.achievements, src: iconLogros, alt: 'Logros' },
    { label: 'Actividades', value: stats.activities, src: iconActividades, alt: 'Actividades' },
  ]

  const displayName = userData?.nombre || user?.name
  const displayEmail = userData?.email || user?.email

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <UserAvatar name={displayName} avatarUrl={user?.avatar} size="xl" />
              <button
                onClick={() => setShowPhotoUploadModal(true)}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#7dc280] border-2 border-[#000] shadow-[2px_2px_0_rgba(0,0,0,0.12)] hover:bg-[#6bb369] transition-all text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Cambiar foto de perfil"
                title="Cambiar foto"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
              <p className="text-muted-foreground">{displayEmail}</p>
              {user?.role && (
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {ROLE_LABEL[user.role]}
                </span>
              )}
              {(formData.institution || formData.career) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                  {formData.institution && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {formData.institution}
                    </span>
                  )}
                  {formData.career && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      {formData.career}
                    </span>
                  )}
                </div>
              )}
              {formData.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{formData.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="bordered">
            <CardContent className="p-4 text-center">
              <img
                src={stat.src}
                alt=""
                className="w-8 h-8 mx-auto mb-2 object-contain"
                aria-hidden
              />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {user?.role === 'student' && (
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>Clases disponibles</CardTitle>
            </div>
            <CardDescription>
              Recorre las clases a las que puedes unirte y usa su código si lo necesitas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/clases" className="block w-full">
              <Button variant="outline" className="w-full">
                Ver todas las clases
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informacion Personal</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isLoadingProfile}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <div className="text-center py-8 text-muted-foreground">Cargando datos...</div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Building className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                  <Input
                    label="Institucion"
                    placeholder="Tu institucion educativa"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                  <Input
                    label="Carrera"
                    placeholder="Tu carrera o programa"
                    value={formData.career}
                    onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                    className="pl-10"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Biografia</label>
                <textarea
                  placeholder="Cuentanos sobre ti..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'resize-none min-h-[100px]',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        nombre: userData?.nombre || user?.name || '',
                        email: userData?.email || user?.email || '',
                        institution: user?.institution || '',
                        career: user?.career || '',
                        bio: user?.bio || '',
                      })
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSubmit()}
                    isLoading={isSaving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </Button>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Cambiar Contraseña">
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
          className="flex flex-col gap-4"
        >
          {passwordError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{passwordError}</div>
          )}
          <div className="flex gap-2">
            <Input
              label="Código de verificación"
              placeholder="Ingresa el token/OTP"
              value={passwordForm.token}
              onChange={(e) => setPasswordForm({ ...passwordForm, token: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="outline"
              className="self-end"
              isLoading={isSendingToken}
              onClick={async () => {
                if (!user?.email) return
                setIsSendingToken(true)
                const res = await authService.requestPasswordReset(user.email)
                setIsSendingToken(false)
                if (res.ok) {
                  alert('Te enviamos un código de verificación al correo.')
                } else {
                  setPasswordError(res.error ?? 'No se pudo enviar el código.')
                }
              }}
            >
              Enviar código
            </Button>
          </div>
          <Input
            label="Nueva Contraseña"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            required
            className={passwordOk ? 'border-green-500 focus:ring-green-500' : ''}
            error={
              passwordForm.password.length > 0 && !passwordOk
                ? 'Contraseña inválida: no cumple con los requisitos.'
                : undefined
            }
          />
          {passwordForm.password.length > 0 && (
            <div className="rounded-lg border border-border p-3 text-sm space-y-1.5">
              <p className={checklist.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                {checklist.hasSpecial ? '✔' : '✖'} Contiene al menos un carácter especial.
              </p>
              <p className={checklist.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                {checklist.hasNumber ? '✔' : '✖'} Contiene al menos un número.
              </p>
              <p className={checklist.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                {checklist.hasUppercase ? '✔' : '✖'} Contiene al menos una letra mayúscula.
              </p>
              <p className={checklist.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                {checklist.minLength ? '✔' : '✖'} Cumple longitud mínima (≥ 8).
              </p>
              {passwordOk && <p className="text-green-600 font-medium">Contraseña válida.</p>}
            </div>
          )}
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
            error={
              passwordForm.confirmPassword.length > 0 && !confirmOk
                ? 'Las contraseñas no coinciden.'
                : undefined
            }
          />
          {passwordForm.confirmPassword.length > 0 && (
            <p className={`text-sm ${confirmOk ? 'text-green-600' : 'text-destructive'}`}>
              {confirmOk ? '✔ Coinciden' : '✖ No coinciden'}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handlePasswordChangeSubmit()}
              isLoading={isSaving}
              className="flex-1"
            >
              Actualizar Contraseña
            </Button>
          </div>
        </form>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal isOpen={showPhotoUploadModal} onClose={() => setShowPhotoUploadModal(false)} title="Cambiar Foto de Perfil">
        <div className="flex flex-col gap-4">
          {/* Photo Preview */}
          {photoPreview ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-lg border-2 border-[#000] overflow-hidden shadow-[3px_3px_0_rgba(0,0,0,0.12)]">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {profilePhoto?.name} {profilePhoto?.size ? `(${(profilePhoto.size / 1024).toFixed(1)}KB)` : ''}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 rounded-lg border-2 border-dashed border-[#000] bg-[#f8faf8]">
              <Upload className="w-8 h-8 text-[#7dc280]" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Arrastra tu foto aquí</p>
                <p className="text-xs text-muted-foreground">o haz click para seleccionar</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)}
                className="absolute opacity-0 cursor-pointer"
                id="photo-input"
              />
            </div>
          )}

          {/* File Input */}
          <label htmlFor="photo-input" className="block">
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={(e) => handlePhotoSelect(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => document.getElementById('photo-input')?.click()}>
              <Upload className="w-4 h-4" />
              Seleccionar Imagen
            </Button>
          </label>

          {/* Info Text */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-blue-50 border border-[#96c3e0]">
            <p>📸 <strong>Formatos:</strong> PNG, JPG, GIF, WEBP</p>
            <p>📊 <strong>Tamaño máximo:</strong> 5MB</p>
            <p>💡 <strong>Recomendación:</strong> Usa una imagen cuadrada para mejor resultado</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPhotoUploadModal(false)
                setProfilePhoto(null)
                setPhotoPreview('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePhotoUpload}
              isLoading={isUploadingPhoto}
              disabled={!photoPreview || isUploadingPhoto}
              className="flex-1"
            >
              <Upload className="w-4 h-4" />
              Subir Foto
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

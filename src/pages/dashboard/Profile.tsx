import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Building, GraduationCap, Save, Users, Lock } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/user.service'
import { notasService } from '../../services/notas.service'
import { actividadesService } from '../../services/actividades.service'
import { usuarioService } from '../../services/usuario.service'
import UserAvatar from '../../components/common/UserAvatar'
import { formatDate, cn } from '../../utils/helpers'
import { iconApuntes, iconLogros, iconActividades } from '../../assets/Icons'
import type { UsuarioData } from '../../services/usuario.service'

const ROLE_LABEL = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
} as const

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [userData, setUserData] = useState<UsuarioData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    institution: '',
    career: '',
    bio: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })

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
    if (user?.id) {
      void (async () => {
        const [notesRes, activitiesRes] = await Promise.all([
          notasService.getNotas(),
          actividadesService.getActividades(),
        ])

        const userIdNum = Number(user.id)

        setStats({
          notes: notesRes.ok && notesRes.data ? notesRes.data.filter((n) => n.usuario_id === userIdNum).length : 0,
          achievements: userService.getAchievements(user.id).length,
          activities:
            activitiesRes.ok && activitiesRes.data
              ? activitiesRes.data.filter((a) => a.usuario_id === userIdNum).length
              : 0,
        })
      })()
    }
  }, [user?.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
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
    } else {
      alert(result.error ?? 'No se pudo actualizar el perfil')
    }
  }

  const handlePasswordChangeSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    if (passwordForm.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsSaving(true)
    const result = await usuarioService.updateProfile(user.id, {
      password: passwordForm.password,
    })
    setIsSaving(false)

    if (result.ok) {
      alert('Contraseña actualizada correctamente')
      setShowPasswordModal(false)
      setPasswordForm({ password: '', confirmPassword: '' })
    } else {
      alert(result.error ?? 'No se pudo actualizar la contraseña')
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
            <UserAvatar name={displayName} avatarUrl={user?.avatar} size="xl" />
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
              <p className="text-xs text-muted-foreground mt-3">
                Miembro desde {user?.createdAt ? formatDate(user.createdAt) : 'Desconocido'}
              </p>
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <Button type="submit" isLoading={isSaving} className="flex-1">
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
        <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
          <Input
            label="Nueva Contraseña"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={passwordForm.password}
            onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
            required
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving} className="flex-1">
              Actualizar Contraseña
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}

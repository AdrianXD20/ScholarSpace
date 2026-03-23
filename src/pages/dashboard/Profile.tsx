import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { User, Mail, Building, GraduationCap, Save, Users } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { notesService } from '../../services/notes.service'
import { userService } from '../../services/user.service'
import { clasesService } from '../../services/clases.service'
import UserAvatar from '../../components/common/UserAvatar'
import { formatDate, cn } from '../../utils/helpers'
import { iconApuntes, iconLogros, iconActividades } from '../../assets/Icons'

const ROLE_LABEL = {
  student: 'Estudiante',
  teacher: 'Docente',
  admin: 'Administrador',
} as const

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [joinCodigo, setJoinCodigo] = useState('')
  const [joinMsg, setJoinMsg] = useState('')
  const [joinErr, setJoinErr] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    institution: user?.institution || '',
    career: user?.career || '',
    bio: user?.bio || '',
  })

  const [stats, setStats] = useState({ notes: 0, achievements: 0, activities: 0 })

  const clasesInscritas = useMemo(() => {
    if (!user?.id || user.role !== 'student') return []
    return clasesService.getClasesInscritasEstudiante(user.id)
  }, [user?.id, user?.role, user?.claseIds])

  const handleUnirseClase = async (e: FormEvent) => {
    e.preventDefault()
    setJoinMsg('')
    setJoinErr('')
    if (!user?.id || !joinCodigo.trim()) {
      setJoinErr('Escribe el código que te dio tu docente.')
      return
    }
    setIsJoining(true)
    const r = clasesService.joinClaseByCodigo(user.id, joinCodigo.trim())
    setIsJoining(false)
    if (r.ok && r.user) {
      updateProfile({ claseIds: r.user.claseIds })
      setJoinCodigo('')
      setJoinMsg('Te uniste a la clase correctamente.')
    } else {
      setJoinErr(r.error ?? 'No se pudo unir a la clase.')
    }
  }

  useEffect(() => {
    if (user?.id) {
      setStats({
        notes: notesService.getNotes(user.id).length,
        achievements: userService.getAchievements(user.id).length,
        activities: userService.getActivities(user.id).length,
      })
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        career: user.career || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateProfile({
      name: formData.name,
      institution: formData.institution,
      career: formData.career,
      bio: formData.bio,
    })

    setIsSaving(false)
    setIsEditing(false)
  }

  const statCards = [
    { label: 'Apuntes', value: stats.notes, src: iconApuntes, alt: 'Apuntes' },
    { label: 'Logros', value: stats.achievements, src: iconLogros, alt: 'Logros' },
    { label: 'Actividades', value: stats.activities, src: iconActividades, alt: 'Actividades' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <UserAvatar name={user?.name} avatarUrl={user?.avatar} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.role && (
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {ROLE_LABEL[user.role]}
                </span>
              )}
              {(user?.institution || user?.career) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                  {user?.institution && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      {user.institution}
                    </span>
                  )}
                  {user?.career && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      {user.career}
                    </span>
                  )}
                </div>
              )}
              {user?.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
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
              <CardTitle>Mis clases</CardTitle>
            </div>
            <CardDescription>
              Solo verás a tus compañeros en el contexto de la app cuando el docente use la misma
              clase. Introduce el código de invitación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {clasesInscritas.length > 0 && (
              <ul className="text-sm space-y-2">
                {clasesInscritas.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between items-center rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-medium text-foreground">{c.nombre}</span>
                    <span className="text-xs text-muted-foreground font-mono">{c.codigoInvitacion}</span>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleUnirseClase} className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Código de clase (ej. A1B2C3)"
                value={joinCodigo}
                onChange={(e) => setJoinCodigo(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" isLoading={isJoining} variant="outline">
                Unirme
              </Button>
            </form>
            {joinErr && <p className="text-sm text-destructive">{joinErr}</p>}
            {joinMsg && <p className="text-sm text-primary">{joinMsg}</p>}
          </CardContent>
        </Card>
      )}

      {/* Edit Profile */}
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informacion Personal</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-9 w-5 h-5 text-muted-foreground" />
                <Input
                  label="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  className="pl-10"
                  disabled
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
                      name: user?.name || '',
                      email: user?.email || '',
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
        </CardContent>
      </Card>
    </div>
  )
}

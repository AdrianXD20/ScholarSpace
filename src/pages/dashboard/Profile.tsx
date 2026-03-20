import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { User, Mail, Building, GraduationCap, FileText, Trophy, Calendar, Save } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../hooks/useAuth'
import { notesService } from '../../services/notes.service'
import { userService } from '../../services/user.service'
import { getInitials, formatDate, cn } from '../../utils/helpers'

export default function Profile() {
  const { user, updateProfile } = useAuth()
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
    { label: 'Apuntes', value: stats.notes, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Logros', value: stats.achievements, icon: Trophy, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Actividades', value: stats.activities, icon: Calendar, color: 'text-green-400', bg: 'bg-green-400/10' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {user?.name ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
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
              <div className={cn('w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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

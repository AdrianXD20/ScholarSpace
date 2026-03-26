import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/user.service'
import { notasService } from '../../services/notas.service'
import { actividadesService } from '../../services/actividades.service'
import type { NotaApi } from '../../services/notas.service'
import type { ActividadApi } from '../../services/actividades.service'
import type { Achievement } from '../../types/achievement.types'
import { formatDate, truncateText } from '../../utils/helpers'
import {
  iconApuntes,
  iconLogros,
  iconActividades,
  iconProgreso,
} from '../../assets/Icons'

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<NotaApi[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<ActividadApi[]>([])

  useEffect(() => {
    if (user?.id) {
      setAchievements(userService.getAchievements(user.id))
      void (async () => {
        const [notesRes, activitiesRes] = await Promise.all([
          notasService.getNotas(),
          actividadesService.getActividades(),
        ])

        const userIdNum = Number(user.id)

        if (notesRes.ok && notesRes.data) {
          setNotes(notesRes.data.filter((n) => n.usuario_id === userIdNum))
        } else {
          setNotes([])
        }

        if (activitiesRes.ok && activitiesRes.data) {
          setActivities(activitiesRes.data.filter((a) => a.usuario_id === userIdNum))
        } else {
          setActivities([])
        }
      })()
    }
  }, [user?.id])

  const stats = [
    { label: 'Apuntes', value: notes.length, src: iconApuntes, alt: 'Apuntes' },
    { label: 'Logros', value: achievements.length, src: iconLogros, alt: 'Logros' },
    { label: 'Actividades', value: activities.length, src: iconActividades, alt: 'Actividades' },
    {
      label: 'En progreso',
      value: activities.filter((a) => a.estado === 'En progreso' || a.estado === 'in-progress').length,
      src: iconProgreso,
      alt: 'Progreso',
    },
  ]

  const recentNotes = [...notes]
    .sort((a, b) => +new Date(b.fecha).valueOf() - +new Date(a.fecha).valueOf())
    .slice(0, 3)
  const recentAchievements = achievements.slice(-3).reverse()

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Hola, {user?.name?.split(' ')[0] || 'Estudiante'}
          </h2>
          <p className="text-muted-foreground">
            Bienvenido a tu portafolio academico. Sigue documentando tu progreso.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/notes">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Nuevo Apunte
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="bordered">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img src={stat.src} alt="" className="w-8 h-8 object-contain shrink-0" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Apuntes Recientes</CardTitle>
            <Link to="/dashboard/notes" className="text-primary text-sm hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentNotes.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {recentNotes.map((note) => (
                  <li key={note.id} className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <h4 className="font-medium text-foreground">{note.titulo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncateText(note.contenido, 80)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(note.fecha)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <img
                  src={iconApuntes}
                  alt=""
                  className="w-14 h-14 mx-auto mb-3 opacity-50 object-contain"
                  aria-hidden
                />
                <p>No tienes apuntes aun</p>
                <Link to="/dashboard/notes">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Crear primer apunte
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Logros Recientes</CardTitle>
            <Link to="/dashboard/achievements" className="text-primary text-sm hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentAchievements.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {recentAchievements.map((achievement) => (
                  <li key={achievement.id} className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-start gap-3">
                      <img
                        src={iconLogros}
                        alt=""
                        className="w-7 h-7 object-contain flex-shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {truncateText(achievement.description, 60)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(achievement.date)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <img
                  src={iconLogros}
                  alt=""
                  className="w-14 h-14 mx-auto mb-3 opacity-50 object-contain"
                  aria-hidden
                />
                <p>No tienes logros registrados</p>
                <Link to="/dashboard/achievements">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Agregar logro
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

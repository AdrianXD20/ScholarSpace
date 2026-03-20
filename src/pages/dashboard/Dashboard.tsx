import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Trophy, Calendar, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { notesService } from '../../services/notes.service'
import { userService } from '../../services/user.service'
import type { Note } from '../../types/note.types'
import type { Achievement, Activity } from '../../types/achievement.types'
import { formatDate, truncateText } from '../../utils/helpers'

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (user?.id) {
      setNotes(notesService.getNotes(user.id))
      setAchievements(userService.getAchievements(user.id))
      setActivities(userService.getActivities(user.id))
    }
  }, [user?.id])

  const stats = [
    { label: 'Apuntes', value: notes.length, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Logros', value: achievements.length, icon: Trophy, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Actividades', value: activities.length, icon: Calendar, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'En progreso', value: activities.filter(a => a.status === 'in-progress').length, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ]

  const recentNotes = notes.slice(-3).reverse()
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
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
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
                    <h4 className="font-medium text-foreground">{note.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncateText(note.content, 80)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-accent" />
                      </div>
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
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
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

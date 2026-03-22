import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { UserCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { clasesService } from '../../services/clases.service'
import { userService } from '../../services/user.service'
import Card, { CardContent } from '../../components/ui/Card'

export default function DetalleClase() {
  const { claseId } = useParams<{ claseId: string }>()
  const { user } = useAuth()

  const clase = claseId ? clasesService.getClaseById(claseId) : null

  const valido = clase && user?.id && clase.teacherId === user.id

  const estudiantes = useMemo(() => {
    if (!clase) return []
    return clase.estudianteIds
      .map((id) => {
        const u = clasesService.getUserPublic(id)
        if (!u) return null
        const logros = userService.getAchievements(id).length
        const acts = userService.getActivities(id).length
        return { u, logros, acts }
      })
      .filter(Boolean) as { u: NonNullable<ReturnType<typeof clasesService.getUserPublic>>; logros: number; acts: number }[]
  }, [clase])

  if (!claseId || !valido) {
    return <Navigate to="/profesor/clases" replace />
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link to="/profesor/clases" className="hover:text-foreground">
            ← Mis clases
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-foreground">{clase!.nombre}</h1>
        {clase!.descripcion && (
          <p className="text-muted-foreground mt-1">{clase!.descripcion}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Código de invitación:{' '}
          <span className="font-mono font-semibold text-foreground">{clase!.codigoInvitacion}</span>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Estudiantes en esta clase</h2>
        {estudiantes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nadie se ha unido aún. Comparte el código para que los alumnos lo ingresen al
            registrarse o desde su perfil.
          </p>
        ) : (
          <ul className="space-y-2">
            {estudiantes.map(({ u, logros, acts }) => (
              <li key={u.id}>
                <Link to={`/profesor/clases/${claseId}/estudiantes/${u.id}`}>
                  <Card variant="bordered" className="hover:bg-secondary/40 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {logros} logros · {acts} actividades
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import UserAvatar from '../../components/common/UserAvatar'
import { useAuth } from '../../hooks/useAuth'
import { env } from '../../config/env'
import { clasesService } from '../../services/clases.service'
import { logrosService } from '../../services/logros.service'
import { userService } from '../../services/user.service'
import { usuarioService } from '../../services/usuario.service'
import Card, { CardContent } from '../../components/ui/Card'

export default function DetalleClase() {
  const { claseId } = useParams<{ claseId: string }>()
  const { user } = useAuth()

  type StudentUI = { id: string; name: string; email: string; avatar?: string }

  // Mock (localStorage)
  const claseMock = claseId ? clasesService.getClaseById(claseId) : null
  const validoMock = !!(claseMock && user?.id && claseMock.teacherId === user.id)

  const estudiantesMock = useMemo(() => {
    if (!claseMock) return []
    return claseMock.estudianteIds
      .map((id) => {
        const u = clasesService.getUserPublic(id)
        if (!u) return null
        const logros = userService.getAchievements(id).length
        const acts = userService.getActivities(id).length
        const ui: StudentUI = { id: u.id, name: u.name, email: u.email, avatar: u.avatar }
        return { u: ui, logros, acts }
      })
      .filter(Boolean) as Array<{ u: StudentUI; logros: number; acts: number }>
  }, [claseMock])

  // API
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [apiValid, setApiValid] = useState<boolean | null>(null)
  const [claseApi, setClaseApi] = useState<null | { id: number; nombre: string; codigo: string; profesor_id: number }>(null)
  const [estudiantesApi, setEstudiantesApi] = useState<Array<{ u: StudentUI; logros: number; acts: number }>>([])

  useEffect(() => {
    if (!claseId || env.useMockAuth || !user?.id) return
    let cancelled = false

    const load = async () => {
      setIsLoadingApi(true)
      setApiValid(null)
      try {
        const teacherClasses = await clasesService.getClasesByDocenteFromApi(user.id)
        if (cancelled) return
        if (!teacherClasses.ok || !teacherClasses.data) {
          setApiValid(false)
          return
        }

        const found = teacherClasses.data.find((c) => String(c.id) === String(claseId)) ?? null
        if (!found) {
          setApiValid(false)
          return
        }

        setClaseApi(found)

        const alumnosRes = await clasesService.getAlumnosIdsFromClaseApi(found.id)
        if (cancelled) return
        const studentIds = alumnosRes.ok && alumnosRes.data ? alumnosRes.data : []

        // Cargar logros una sola vez y contarlos por usuario.
        const logrosRes = await logrosService.getLogrosFromApi()
        const countsByUserId: Record<string, number> = {}
        if (logrosRes.ok && logrosRes.data) {
          const allowed = new Set(studentIds.map(String))
          for (const l of logrosRes.data) {
            const uid = String(l.usuario_id)
            if (!allowed.has(uid)) continue
            countsByUserId[uid] = (countsByUserId[uid] ?? 0) + 1
          }
        }

        const alumnosUI = await Promise.all(
          studentIds.map(async (sid) => {
            // Actividades: si el backend no persiste aún, se mantiene desde mock/local.
            const acts = userService.getActivities(sid).length

            const profile = await usuarioService.getProfile(sid)
            const uData = profile.ok && profile.data ? profile.data : null

            const u: StudentUI = {
              id: sid,
              name: uData?.nombre ?? 'Alumno',
              email: uData?.email ?? '',
              avatar: uData?.foto_perfil ?? undefined,
            }

            return { u, logros: countsByUserId[String(sid)] ?? 0, acts }
          })
        )

        if (cancelled) return
        setEstudiantesApi(alumnosUI)
        setApiValid(true)
      } finally {
        if (!cancelled) setIsLoadingApi(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [claseId, user?.id])

  if (!claseId) {
    return <Navigate to="/profesor/clases" replace />
  }

  if (env.useMockAuth) {
    if (!validoMock) return <Navigate to="/profesor/clases" replace />
  } else {
    if (isLoadingApi || apiValid === null) {
      return (
        <div className="space-y-6 max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">Cargando clase...</p>
        </div>
      )
    }
    if (!apiValid) return <Navigate to="/profesor/clases" replace />
  }

  const title = env.useMockAuth ? claseMock!.nombre : claseApi!.nombre
  const descripcion = env.useMockAuth ? claseMock!.descripcion : (claseApi as any)?.descripcion
  const codigo = env.useMockAuth ? claseMock!.codigoInvitacion : claseApi!.codigo
  const estudiantes = env.useMockAuth ? estudiantesMock : estudiantesApi

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link to="/profesor/clases" className="hover:text-foreground">
            ← Mis clases
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {descripcion && (
          <p className="text-muted-foreground mt-1">{descripcion}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Código de invitación:{' '}
          <span className="font-mono font-semibold text-foreground">{codigo}</span>
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
                        <UserAvatar name={u.name} avatarUrl={u.avatar} size="md" className="shrink-0" />
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

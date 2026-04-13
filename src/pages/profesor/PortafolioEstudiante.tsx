import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import {
  iconLogros,
  iconActividades,
  iconPerfil,
  iconApuntes,
  iconNotificacion,
} from '../../assets/Icons'
import { useAuth } from '../../hooks/useAuth'
import { env } from '../../config/env'
import { clasesService } from '../../services/clases.service'
import { notesService } from '../../services/notes.service'
import { userService } from '../../services/user.service'
import { motivacionService } from '../../services/motivacion.service'
import { usuarioService } from '../../services/usuario.service'
import { logrosService } from '../../services/logros.service'
import { actividadesService } from '../../services/actividades.service'
import { notasService } from '../../services/notas.service'
import Button from '../../components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { formatDate } from '../../utils/helpers'

export default function PortafolioEstudiante() {
  const { claseId, estudianteId } = useParams<{ claseId: string; estudianteId: string }>()
  const { user } = useAuth()
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [info, setInfo] = useState('')
  const [motivacionTick, setMotivacionTick] = useState(0)

  // --- Modo mock/local (localStorage) ---
  const claseMock = claseId ? clasesService.getClaseById(claseId) : null
  const alumnoMock = estudianteId ? clasesService.getUserPublic(estudianteId) : null
  const accesoMock =
    claseMock &&
    user?.id &&
    claseMock.teacherId === user.id &&
    estudianteId &&
    claseMock.estudianteIds.includes(estudianteId)

  // --- Modo API ---
  type StudentUI = { id: string; name: string; email: string; avatar?: string; career?: string }
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [apiValid, setApiValid] = useState<boolean | null>(null)
  const [claseNombreApi, setClaseNombreApi] = useState<string>('')
  const [alumnoApi, setAlumnoApi] = useState<StudentUI | null>(null)

  type NotaUI = { id: string | number; title: string }
  type ActividadUI = { id: string | number; title: string; description: string; date: string; status: string; type: 'project' | 'activity' }
  type LogroUI = { id: string | number; title: string; description: string; date: string; category: 'professional' | 'personal' | 'extracurricular' | 'academic' }

  const [notasApi, setNotasApi] = useState<NotaUI[]>([])
  const [actividadesApi, setActividadesApi] = useState<ActividadUI[]>([])
  const [logrosApi, setLogrosApi] = useState<LogroUI[]>([])

  useEffect(() => {
    if (!claseId || !estudianteId || env.useMockAuth || !user?.id) return
    let cancelled = false

    const load = async () => {
      setIsLoadingApi(true)
      setApiValid(null)
      try {
        // 1) Validar que la clase pertenezca al docente.
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
        setClaseNombreApi(String((found as any).nombre ?? 'Clase'))

        // 2) Validar que el estudiante esté inscrito en la clase.
        const alumnosRes = await clasesService.getAlumnosIdsFromClaseApi(found.id)
        if (cancelled) return
        const ids = alumnosRes.ok && alumnosRes.data ? alumnosRes.data.map(String) : []
        if (!ids.includes(String(estudianteId))) {
          setApiValid(false)
          return
        }

        // 3) Cargar perfil del estudiante desde API.
        const profile = await usuarioService.getProfile(estudianteId)
        if (cancelled) return
        const uData = profile.ok && profile.data ? profile.data : null
        const alumno: StudentUI = {
          id: String(estudianteId),
          name: uData?.nombre ?? 'Alumno',
          email: uData?.email ?? '',
          avatar: uData?.foto_perfil ?? undefined,
          career: (uData as any)?.carrera ?? undefined,
        }
        setAlumnoApi(alumno)

        const studentIdNum = Number(estudianteId)

        // 4) Cargar notas/actividades/logros y filtrar por estudiante.
        const [notasRes, actsRes, logrosRes] = await Promise.all([
          notasService.getNotas(),
          actividadesService.getActividades(),
          logrosService.getLogrosFromApi(),
        ])
        if (cancelled) return

        setNotasApi(
          notasRes.ok && notasRes.data
            ? notasRes.data
                .filter((n) => Number(n.usuario_id) === studentIdNum)
                .map((n) => ({ id: n.id, title: n.titulo }))
            : []
        )

        setActividadesApi(
          actsRes.ok && actsRes.data
            ? actsRes.data
                .filter((a) => Number(a.usuario_id) === studentIdNum)
                .map((a) => ({
                  id: a.id,
                  title: a.titulo,
                  description: a.descripcion,
                  date: a.fecha,
                  status: a.estado,
                  type: a.proyecto_id != null ? 'project' : 'activity',
                }))
            : []
        )

        const mapTipoToCategory = (tipo: unknown): LogroUI['category'] => {
          const t = String(tipo ?? '').trim().toLowerCase()
          if (t.includes('prof')) return 'professional'
          if (t.includes('extra')) return 'extracurricular'
          if (t.includes('acad')) return 'academic'
          return 'personal'
        }
        setLogrosApi(
          logrosRes.ok && logrosRes.data
            ? logrosRes.data
                .filter((l) => Number(l.usuario_id) === studentIdNum)
                .map((l) => ({
                  id: l.id,
                  title: l.titulo,
                  description: l.descripcion,
                  date: l.fecha,
                  category: mapTipoToCategory(l.tipo),
                }))
            : []
        )

        setApiValid(true)
      } finally {
        if (!cancelled) setIsLoadingApi(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [claseId, estudianteId, user?.id])

  const notas = useMemo(
    () => (env.useMockAuth ? (estudianteId ? notesService.getNotes(estudianteId) : []) : notasApi),
    [estudianteId, notasApi]
  )
  const logros = useMemo(
    () => (env.useMockAuth ? (estudianteId ? userService.getAchievements(estudianteId) : []) : logrosApi),
    [estudianteId, logrosApi]
  )
  const actividades = useMemo(
    () => (env.useMockAuth ? (estudianteId ? userService.getActivities(estudianteId) : []) : actividadesApi),
    [estudianteId, actividadesApi]
  )
  const experiencias = useMemo(
    () => (estudianteId ? userService.getExperiences(estudianteId) : []),
    [estudianteId]
  )

  const logrosProfesional = useMemo(
    () => logros.filter((a) => a.category === 'professional'),
    [logros]
  )
  const proyectos = useMemo(
    () => actividades.filter((a) => a.type === 'project'),
    [actividades]
  )

  const motivaciones = useMemo(
    () => (estudianteId ? motivacionService.listPorEstudiante(estudianteId) : []),
    [estudianteId, motivacionTick]
  )

  const handleMotivacion = () => {
    if (!user?.id || !claseId || !estudianteId || !mensaje.trim()) return
    setEnviando(true)
    motivacionService.registrarMensaje(user.id, estudianteId, claseId, mensaje.trim())
    setMensaje('')
    setInfo('Mensaje de motivación guardado.')
    setMotivacionTick((t) => t + 1)
    setEnviando(false)
  }

  if (!claseId || !estudianteId) {
    return <Navigate to="/profesor/clases" replace />
  }
  const isMock = env.useMockAuth
  if (isMock) {
    if (!accesoMock || !alumnoMock || !claseMock) return <Navigate to="/profesor/clases" replace />
  } else {
    if (isLoadingApi || apiValid === null) {
      return (
        <div className="space-y-6 max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">Cargando portafolio del estudiante...</p>
        </div>
      )
    }
    if (!apiValid || !alumnoApi) return <Navigate to="/profesor/clases" replace />
  }

  let alumno: StudentUI
  let claseNombre: string
  if (isMock) {
    const a = alumnoMock!
    const c = claseMock!
    alumno = { id: a.id, name: a.name, email: a.email, avatar: a.avatar, career: a.career }
    claseNombre = c.nombre
  } else {
    alumno = alumnoApi!
    claseNombre = claseNombreApi
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link to={`/profesor/clases/${claseId}`} className="hover:text-foreground">
            ← {claseNombre}
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-foreground">{alumno.name}</h1>
        <p className="text-muted-foreground text-sm">{alumno.email}</p>
        {alumno.career && (
          <p className="text-sm text-muted-foreground mt-1">{alumno.career}</p>
        )}
      </div>

      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <img src={iconNotificacion} alt="" className="w-6 h-6 object-contain" aria-hidden />
            <CardTitle className="text-lg">Motivación</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Escribe un mensaje breve de ánimo. El estudiante podrá ver el historial aquí (mock
            local).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {info && <p className="text-sm text-primary">{info}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              className="flex-1 px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ej. ¡Buen trabajo con el proyecto!"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={500}
            />
            <Button type="button" onClick={handleMotivacion} isLoading={enviando} className="gap-2 shrink-0">
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </form>
          {motivaciones.length > 0 && (
            <ul className="text-sm space-y-2 border-t border-border pt-4">
              {motivaciones.slice(0, 5).map((m) => (
                <li key={m.id} className="text-muted-foreground">
                  <span className="text-xs">{formatDate(m.createdAt)}</span> — {m.mensaje}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <img src={iconLogros} alt="" className="w-6 h-6 object-contain" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Ámbito profesional (logros)</h2>
        </div>
        {logrosProfesional.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin logros en categoría profesional aún.</p>
        ) : (
          <ul className="space-y-2">
            {logrosProfesional.map((a) => (
              <li key={a.id}>
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(a.date)}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <img src={iconActividades} alt="" className="w-6 h-6 object-contain" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Proyectos (actividades)</h2>
        </div>
        {proyectos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividades tipo proyecto registradas.</p>
        ) : (
          <ul className="space-y-2">
            {proyectos.map((a) => (
              <li key={a.id}>
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(a.date)} · {a.status === 'completed' ? 'Completado' : a.status}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <img src={iconPerfil} alt="" className="w-6 h-6 object-contain" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Experiencias</h2>
        </div>
        {experiencias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin experiencias registradas.</p>
        ) : (
          <ul className="space-y-2">
            {experiencias.map((ex) => (
              <li key={ex.id}>
                <Card variant="bordered">
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{ex.title}</p>
                    <p className="text-sm text-muted-foreground">{ex.organization}</p>
                    <p className="text-sm text-muted-foreground mt-2">{ex.description}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <img src={iconApuntes} alt="" className="w-6 h-6 object-contain" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Apuntes (vista previa)</h2>
        </div>
        {notas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin apuntes.</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {notas.slice(0, 12).map((n) => (
              <li key={n.id}>{n.title}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

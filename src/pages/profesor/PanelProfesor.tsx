import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { iconDashboard, iconPerfil, iconLogros, iconNotificacion } from '../../assets/Icons'
import { useAuth } from '../../hooks/useAuth'
import { clasesService } from '../../services/clases.service'
import { logrosService } from '../../services/logros.service'
import { userService } from '../../services/user.service'
import { motivacionService } from '../../services/motivacion.service'
import { env } from '../../config/env'
import GraficoBarrasSimple from './GraficoBarrasSimple'
import Card, { CardContent } from '../../components/ui/Card'

const CAT_LABEL: Record<string, string> = {
  extracurricular: 'Extracurricular',
  personal: 'Personal',
  professional: 'Profesional',
}

function logrosTotalesPorCategoriaLocal(studentIds: string[]) {
  const counts = {
    extracurricular: 0,
    personal: 0,
    professional: 0,
  }
  let total = 0

  for (const sid of studentIds) {
    const ach = userService.getAchievements(sid)
    total += ach.length
    for (const a of ach) {
      if (a.category === 'extracurricular') counts.extracurricular += 1
      if (a.category === 'personal') counts.personal += 1
      if (a.category === 'professional') counts.professional += 1
    }
  }

  return { counts, total }
}

export default function PanelProfesor() {
  const { user } = useAuth()
  const teacherId = user?.id ?? ''

  // --- Modo mock/local (localStorage) ---
  const clasesMock = useMemo(
    () => (teacherId ? clasesService.getClasesByDocente(teacherId) : []),
    [teacherId]
  )

  const estudianteIdsMock = useMemo(() => {
    const set = new Set<string>()
    for (const c of clasesMock) {
      for (const id of c.estudianteIds) set.add(id)
    }
    return [...set]
  }, [clasesMock])

  const logrosLocal = useMemo(
    () => logrosTotalesPorCategoriaLocal(estudianteIdsMock),
    [estudianteIdsMock]
  )

  // --- Modo API ---
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [clasesCountApi, setClasesCountApi] = useState(0)
  const [estudianteIdsApi, setEstudianteIdsApi] = useState<string[]>([])
  const [logrosCategoriasApi, setLogrosCategoriasApi] = useState({
    extracurricular: 0,
    personal: 0,
    professional: 0,
  })
  const [logrosTotalApi, setLogrosTotalApi] = useState(0)

  useEffect(() => {
    if (!teacherId || env.useMockAuth) return
    let cancelled = false

    const load = async () => {
      setIsLoadingApi(true)
      try {
        const teacherClasses = await clasesService.getClasesByDocenteFromApi(teacherId)
        if (cancelled) return
        if (!teacherClasses.ok || !teacherClasses.data) {
          setClasesCountApi(0)
          setEstudianteIdsApi([])
          setLogrosCategoriasApi({ extracurricular: 0, personal: 0, professional: 0 })
          setLogrosTotalApi(0)
          return
        }

        const clases = teacherClasses.data
        setClasesCountApi(clases.length)

        const studentSets: Set<string> = new Set()
        for (const c of clases) {
          const alumnosRes = await clasesService.getAlumnosIdsFromClaseApi(c.id)
          if (!alumnosRes.ok || !alumnosRes.data) continue
          for (const sid of alumnosRes.data) studentSets.add(String(sid))
        }

        const studentIds = [...studentSets]
        setEstudianteIdsApi(studentIds)

        const logrosRes = await logrosService.getLogrosFromApi()
        const counts = { extracurricular: 0, personal: 0, professional: 0 }
        let total = 0

        if (logrosRes.ok && logrosRes.data) {
          const allowed = new Set(studentIds.map(String))
          for (const l of logrosRes.data) {
            const uid = String(l.usuario_id)
            if (!allowed.has(uid)) continue
            total += 1
            const tipo = String(l.tipo ?? '').trim().toLowerCase()
            if (tipo === 'extracurricular') counts.extracurricular += 1
            if (tipo === 'personal') counts.personal += 1
            if (tipo === 'profesional') counts.professional += 1
          }
        }

        if (!cancelled) {
          setLogrosCategoriasApi(counts)
          setLogrosTotalApi(total)
        }
      } finally {
        if (!cancelled) setIsLoadingApi(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [teacherId])

  const barras = useMemo(() => {
    if (env.useMockAuth) {
      const c = logrosLocal.counts
      return ([
        { etiqueta: CAT_LABEL.extracurricular, valor: c.extracurricular },
        { etiqueta: CAT_LABEL.personal, valor: c.personal },
        { etiqueta: CAT_LABEL.professional, valor: c.professional },
      ] as const).map((x) => ({ etiqueta: x.etiqueta, valor: x.valor }))
    }

    return [
      { etiqueta: CAT_LABEL.extracurricular, valor: logrosCategoriasApi.extracurricular },
      { etiqueta: CAT_LABEL.personal, valor: logrosCategoriasApi.personal },
      { etiqueta: CAT_LABEL.professional, valor: logrosCategoriasApi.professional },
    ]
  }, [env.useMockAuth, logrosCategoriasApi, logrosLocal.counts])

  const mensajesRecientes = useMemo(() => {
    const out: { nombre: string; preview: string }[] = []
    const ids = env.useMockAuth ? estudianteIdsMock : estudianteIdsApi
    for (const sid of ids.slice(0, 5)) {
      const u = clasesService.getUserPublic(sid)
      const ult = motivacionService.ultimoParaEstudiante(sid)
      if (ult && u) out.push({ nombre: u.name, preview: ult.mensaje.slice(0, 80) })
    }
    return out
  }, [estudianteIdsApi, estudianteIdsMock])

  const clasesCount = env.useMockAuth ? clasesMock.length : clasesCountApi
  const estudianteIds = env.useMockAuth ? estudianteIdsMock : estudianteIdsApi
  const logrosTotal = env.useMockAuth ? logrosLocal.total : logrosTotalApi

  if (!env.useMockAuth && isLoadingApi) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <p className="text-sm text-muted-foreground">Cargando resumen docente...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumen docente</h1>
        <p className="text-muted-foreground mt-1">
          Vista de tus clases, estudiantes y logros en general.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4 flex items-center gap-3">
            <img src={iconDashboard} alt="" className="w-10 h-10 object-contain shrink-0" aria-hidden />
            <div>
              <p className="text-2xl font-bold text-foreground">{clasesCount}</p>
              <p className="text-sm text-muted-foreground">Clases</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 flex items-center gap-3">
            <img src={iconPerfil} alt="" className="w-10 h-10 object-contain shrink-0" aria-hidden />
            <div>
              <p className="text-2xl font-bold text-foreground">{estudianteIds.length}</p>
              <p className="text-sm text-muted-foreground">Estudiantes en tus clases</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="p-4 flex items-center gap-3">
            <img src={iconLogros} alt="" className="w-10 h-10 object-contain shrink-0" aria-hidden />
            <div>
              <p className="text-2xl font-bold text-foreground">{logrosTotal}</p>
              <p className="text-sm text-muted-foreground">Logros registrados (total)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GraficoBarrasSimple
          titulo="Logros por categoría (Extracurricular, Personal, Profesional)"
          descripcion="Suma de logros que registraron tus estudiantes en tus clases, por tipo."
          datos={barras}
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <img src={iconNotificacion} alt="" className="w-6 h-6 object-contain" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">Motivación enviada</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Últimos mensajes de ánimo que dejaste en perfiles de estudiantes (desde el detalle de
            clase).
          </p>
          {mensajesRecientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay mensajes. Entra a una clase y abre el portafolio de un estudiante.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {mensajesRecientes.map((m) => (
                <li key={m.nombre} className="border-b border-border pb-2 last:border-0">
                  <span className="font-medium text-foreground">{m.nombre}</span>
                  <p className="text-muted-foreground text-xs mt-0.5">{m.preview}…</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/profesor/clases"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          Ir a mis clases
        </Link>
      </div>
    </div>
  )
}

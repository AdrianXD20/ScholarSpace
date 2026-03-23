import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { iconDashboard, iconPerfil, iconLogros, iconNotificacion } from '../../assets/Icons'
import { useAuth } from '../../hooks/useAuth'
import { clasesService } from '../../services/clases.service'
import { userService } from '../../services/user.service'
import { motivacionService } from '../../services/motivacion.service'
import GraficoBarrasSimple from './GraficoBarrasSimple'
import Card, { CardContent } from '../../components/ui/Card'

const CAT_LABEL: Record<string, string> = {
  academic: 'Académico',
  extracurricular: 'Extracurricular',
  personal: 'Personal',
  professional: 'Profesional / laboral',
}

function logrosDelMesPorCategoria(studentIds: string[]) {
  const now = new Date()
  const m = now.getMonth()
  const y = now.getFullYear()
  const counts: Record<string, number> = {
    academic: 0,
    extracurricular: 0,
    personal: 0,
    professional: 0,
  }
  for (const sid of studentIds) {
    for (const a of userService.getAchievements(sid)) {
      const d = new Date(a.date)
      if (d.getMonth() === m && d.getFullYear() === y) {
        counts[a.category] = (counts[a.category] ?? 0) + 1
      }
    }
  }
  return counts
}

export default function PanelProfesor() {
  const { user } = useAuth()
  const teacherId = user?.id ?? ''

  const clases = useMemo(
    () => (teacherId ? clasesService.getClasesByDocente(teacherId) : []),
    [teacherId]
  )

  const estudianteIds = useMemo(() => {
    const set = new Set<string>()
    for (const c of clases) {
      for (const id of c.estudianteIds) set.add(id)
    }
    return [...set]
  }, [clases])

  const logrosMes = useMemo(
    () => logrosDelMesPorCategoria(estudianteIds),
    [estudianteIds]
  )

  const barras = useMemo(
    () =>
      Object.entries(logrosMes).map(([k, v]) => ({
        etiqueta: CAT_LABEL[k] ?? k,
        valor: v,
      })),
    [logrosMes]
  )

  const mensajesRecientes = useMemo(() => {
    const out: { nombre: string; preview: string }[] = []
    for (const sid of estudianteIds.slice(0, 5)) {
      const u = clasesService.getUserPublic(sid)
      const ult = motivacionService.ultimoParaEstudiante(sid)
      if (ult && u) {
        out.push({ nombre: u.name, preview: ult.mensaje.slice(0, 80) })
      }
    }
    return out
  }, [estudianteIds])

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumen docente</h1>
        <p className="text-muted-foreground mt-1">
          Vista de tus clases y del progreso de tus estudiantes este mes.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-4 flex items-center gap-3">
            <img src={iconDashboard} alt="" className="w-10 h-10 object-contain shrink-0" aria-hidden />
            <div>
              <p className="text-2xl font-bold text-foreground">{clases.length}</p>
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
              <p className="text-2xl font-bold text-foreground">
                {Object.values(logrosMes).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Logros registrados (mes)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GraficoBarrasSimple
          titulo="Logros por categoría (mes actual)"
          descripcion="Suma de logros que tus estudiantes registraron este mes, por tipo."
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

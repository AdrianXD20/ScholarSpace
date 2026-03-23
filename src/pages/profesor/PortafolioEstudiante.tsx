import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
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
import { clasesService } from '../../services/clases.service'
import { notesService } from '../../services/notes.service'
import { userService } from '../../services/user.service'
import { motivacionService } from '../../services/motivacion.service'
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

  const clase = claseId ? clasesService.getClaseById(claseId) : null
  const alumno = estudianteId ? clasesService.getUserPublic(estudianteId) : null

  const acceso =
    clase &&
    user?.id &&
    clase.teacherId === user.id &&
    estudianteId &&
    clase.estudianteIds.includes(estudianteId)

  const notas = useMemo(
    () => (estudianteId ? notesService.getNotes(estudianteId) : []),
    [estudianteId]
  )
  const logros = useMemo(
    () => (estudianteId ? userService.getAchievements(estudianteId) : []),
    [estudianteId]
  )
  const actividades = useMemo(
    () => (estudianteId ? userService.getActivities(estudianteId) : []),
    [estudianteId]
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

  const handleMotivacion = (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !claseId || !estudianteId || !mensaje.trim()) return
    setEnviando(true)
    motivacionService.registrarMensaje(user.id, estudianteId, claseId, mensaje.trim())
    setMensaje('')
    setInfo('Mensaje de motivación guardado.')
    setMotivacionTick((t) => t + 1)
    setEnviando(false)
  }

  if (!claseId || !estudianteId || !acceso || !alumno) {
    return <Navigate to="/profesor/clases" replace />
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          <Link to={`/profesor/clases/${claseId}`} className="hover:text-foreground">
            ← {clase!.nombre}
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
          <form onSubmit={handleMotivacion} className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ej. ¡Buen trabajo con el proyecto!"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={500}
            />
            <Button type="submit" isLoading={enviando} className="gap-2 shrink-0">
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

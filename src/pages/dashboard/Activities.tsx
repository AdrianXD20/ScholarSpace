import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, CheckCircle, Clock, Target, Trash2, Edit } from 'lucide-react'
import { iconActividades } from '../../assets/Icons'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/user.service'
import { proyectosService } from '../../services/proyectos.service'
import { actividadesService } from '../../services/actividades.service'
import { clasesService } from '../../services/clases.service'
import type { ClaseApi } from '../../services/clases.service'
import type { ProyectoApi } from '../../services/proyectos.service'
import type { ActividadApi } from '../../services/actividades.service'
import type { Activity } from '../../types/achievement.types'
import { formatDate, cn } from '../../utils/helpers'

const typeOptions = [
  { value: 'event', label: 'Evento' },
  { value: 'project', label: 'Proyecto' },
  { value: 'course', label: 'Curso' },
  { value: 'workshop', label: 'Taller' },
  { value: 'volunteer', label: 'Voluntariado' },
] as const

const statusOptions = [
  { value: 'Completado', label: 'Completado', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  { value: 'En progreso', label: 'En progreso', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { value: 'Planeado', label: 'Planeado', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
] as const

interface ActividadLocal extends Activity {
  apiId?: number
  proyectoId?: number
  claseId?: number
}

export default function Activities() {
  const { user } = useAuth()
  const [activitiesApi, setActivitiesApi] = useState<ActividadApi[]>([])
  const [activitiesLocal, setActivitiesLocal] = useState<ActividadLocal[]>([])
  const [projects, setProjects] = useState<ProyectoApi[]>([])
  const [clases, setClases] = useState<ClaseApi[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActividadLocal | null>(null)
  const [isSavingActivity, setIsSavingActivity] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'project' as Activity['type'],
    status: 'Planeado' as string,
    proyectoId: '',
    claseId: '',
  })

  // Load activities from API
  const loadActivities = async () => {
    if (!user?.id) return
    setIsLoadingApi(true)
    const result = await actividadesService.getActividades()
    if (result.ok && result.data) {
      const userActivities = result.data.filter((a) => a.usuario_id === Number(user?.id))
      setActivitiesApi(userActivities)
    }
    setIsLoadingApi(false)
  }

  useEffect(() => {
    loadActivities()
  }, [user?.id])

  // Load projects (to avoid typing ids manually)
  useEffect(() => {
    if (!user?.id) return
    const loadProjects = async () => {
      const res = await proyectosService.getProyectos()
      if (res.ok && res.data) {
        const userIdNum = Number(user.id)
        setProjects(res.data.filter((p) => p.usuario_id === userIdNum))
      } else {
        setProjects([])
      }
    }
    void loadProjects()
  }, [user?.id])

  // Load classes (for selection)
  useEffect(() => {
    const loadClases = async () => {
      const res = await clasesService.getClasesFromApi()
      if (res.ok && res.data) {
        setClases(res.data as ClaseApi[])
      } else {
        setClases([])
      }
    }
    void loadClases()
  }, [])

  // Load local activities (mock)
  useEffect(() => {
    if (user?.id) {
      const local = userService.getActivities(user.id)
      setActivitiesLocal(local)
    }
  }, [user?.id])

  // Combine APIs and local activities, filter by status
  const allActivities = [
    ...activitiesApi.map((a) => ({
      id: `api-${a.id}`,
      apiId: a.id,
      title: a.titulo,
      description: a.descripcion,
      date: a.fecha,
      type: 'project' as Activity['type'],
      status: a.estado,
      userId: String(a.usuario_id),
      proyectoId: a.proyecto_id,
      claseId: a.clase_id,
    } as ActividadLocal)),
    ...activitiesLocal,
  ]

  const filteredActivities = filterStatus
    ? allActivities.filter((a) => a.status === filterStatus)
    : allActivities

  // Auto-select first available project/class when creating a new activity.
  useEffect(() => {
    if (!isModalOpen) return
    if (editingActivity) return

    if (projects.length > 0 && formData.proyectoId === '') {
      setFormData((prev) => ({ ...prev, proyectoId: String(projects[0].id) }))
    }
  }, [isModalOpen, projects, editingActivity, formData.proyectoId])

  useEffect(() => {
    if (!isModalOpen) return
    if (editingActivity) return

    if (clases.length > 0 && formData.claseId === '') {
      setFormData((prev) => ({ ...prev, claseId: String(clases[0].id) }))
    }
  }, [isModalOpen, clases, editingActivity, formData.claseId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.title.trim()) return

    setIsSavingActivity(true)

    const payload = {
      titulo: formData.title.trim(),
      descripcion: formData.description.trim(),
      fecha: formData.date || new Date().toISOString(),
      estado: formData.status,
      usuario_id: Number(user.id),
      proyecto_id: formData.proyectoId ? Number(formData.proyectoId) : undefined,
      clase_id: formData.claseId ? Number(formData.claseId) : undefined,
    }

    if (editingActivity?.apiId) {
      const result = await actividadesService.updateActividad(editingActivity.apiId, payload)
      setIsSavingActivity(false)
      if (result.ok) {
        await loadActivities()
        setEditingActivity(null)
        setIsModalOpen(false)
      } else {
        alert(result.error ?? 'No se pudo actualizar la actividad')
      }
    } else {
      const result = await actividadesService.createActividad(payload as Omit<ActividadApi, 'id'>)
      setIsSavingActivity(false)
      if (result.ok) {
        await loadActivities()
        setIsModalOpen(false)
      } else {
        alert(result.error ?? 'No se pudo crear la actividad')
      }
    }

    setFormData({ title: '', description: '', date: '', type: 'project', status: 'Planeado', proyectoId: '', claseId: '' })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!user?.id) return

    // `user.id` puede venir como string; comparamos con el `userId` ya normalizado del item mostrado.
    const userIdStr = String(user.id)

    if (id.startsWith('api-')) {
      const activity = allActivities.find((a) => a.id === id)
      if (!activity || activity.userId !== userIdStr) return

      const apiId = activity.apiId
      if (!apiId) return

      const payload = {
        titulo: activity.title,
        descripcion: activity.description,
        fecha: activity.date,
        estado: newStatus,
        usuario_id: Number(activity.userId),
        proyecto_id: activity.proyectoId,
        clase_id: activity.claseId,
      }

      const result = await actividadesService.updateActividad(apiId, payload)
      if (result.ok) {
        setActivitiesApi((prev) =>
          prev.map((a) => (a.id === apiId ? { ...a, estado: newStatus } : a))
        )
      }
      return
    }

    userService.updateActivity(id, { status: newStatus as Activity['status'] })
    setActivitiesLocal(userService.getActivities(user.id))
  }

  const handleDelete = async (id: string) => {
    if (!user?.id) return
    const userIdStr = String(user.id)

    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return

    if (id.startsWith('api-')) {
      const activity = allActivities.find((a) => a.id === id)
      if (!activity || activity.userId !== userIdStr) return

      const apiId = activity.apiId
      if (!apiId) return

      const result = await actividadesService.deleteActividad(apiId)
      if (result.ok) {
        await loadActivities()
      } else {
        alert(result.error ?? 'No se pudo eliminar la actividad')
      }
      return
    }

    userService.deleteActivity(id)
    setActivitiesLocal(userService.getActivities(user.id))
  }

  const getStatusInfo = (status: string) => {
    return (
      statusOptions.find((s) => s.value === status) || {
        label: status,
        icon: CheckCircle,
        color: 'text-muted-foreground',
        bg: 'bg-secondary/10',
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(null)}
          >
            Todas
          </Button>
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={filterStatus === status.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status.value)}
            >
              {status.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 text-black dark:text-white" />
          Nueva Actividad
        </Button>
      </div>

      {/* Activities List */}
      {isLoadingApi ? (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Cargando actividades...</div>
          </CardContent>
        </Card>
      ) : filteredActivities.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredActivities.map((activity) => {
            const statusInfo = getStatusInfo(activity.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card
                key={activity.id}
                variant="bordered"
                className="group hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        statusInfo.bg
                      )}
                    >
                      <StatusIcon className={cn('w-5 h-5 text-black dark:text-white')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{activity.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'inline-block px-2 py-0.5 text-xs rounded-full',
                                statusInfo.bg,
                                statusInfo.color
                              )}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {activity.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingActivity(activity)
                              setFormData({
                                title: activity.title,
                                description: activity.description,
                                date: activity.date,
                                type: activity.type,
                                status: activity.status,
                                proyectoId: String(activity.proyectoId ?? ''),
                                claseId: String(activity.claseId ?? ''),
                              })
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary/10 transition-all"
                            aria-label="Editar actividad"
                          >
                            <Edit className="w-4 h-4 text-black dark:text-white" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                            aria-label="Eliminar actividad"
                          >
                            <Trash2 className="w-4 h-4 text-black dark:text-white" />
                          </button>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleStatusChange(activity.id, status.value as string)}
                            className={cn(
                              'px-2 py-1 text-xs rounded-lg transition-colors',
                              (activity.status as string) === (status.value as string)
                                ? `${status.bg} ${status.color}`
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            )}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <img
              src={iconActividades}
              alt=""
              className="w-16 h-16 mx-auto mb-4 object-contain"
              aria-hidden
            />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {filterStatus ? 'No hay actividades con este estado' : 'Registra tus actividades'}
            </h3>
            <p className="text-muted-foreground mb-4">Organiza tus proyectos, cursos y eventos académicos</p>
            <Button
            onClick={() => {
              setEditingActivity(null)
              setFormData({
                title: '',
                description: '',
                date: '',
                type: 'project',
                status: 'Planeado',
                proyectoId: '',
                claseId: '',
              })
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar primera actividad
          </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingActivity(null)
        }}
        title={editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Titulo"
            placeholder="Ej: Proyecto de investigación"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Descripcion</label>
            <textarea
              placeholder="Describe la actividad..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'resize-none min-h-[100px]'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Activity['type'] })}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {typeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Fecha"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Proyecto</label>
              <select
                value={formData.proyectoId}
                onChange={(e) => setFormData((prev) => ({ ...prev, proyectoId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Selecciona un proyecto
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Clase</label>
              <select
                value={formData.claseId}
                onChange={(e) => setFormData((prev) => ({ ...prev, claseId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Selecciona una clase
                </option>
                {clases.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSavingActivity} className="flex-1">
              {editingActivity ? 'Actualizar Actividad' : 'Crear Actividad'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

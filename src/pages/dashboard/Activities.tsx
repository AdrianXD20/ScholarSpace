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
import { actividadesService } from '../../services/actividades.service'
import type { ActividadApi } from '../../services/actividades.service'
import type { Activity } from '../../types/achievement.types'
import { formatDate, cn } from '../../utils/helpers'
import { proyectosService } from '../../services/proyectos.service'
import { clasesService } from '../../services/clases.service'

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

interface ActividadLocal extends Omit<Activity, 'status'> {
  apiId?: number
  proyectoId?: number
  claseId?: number
  proyectoNombre?: string
  claseNombre?: string
  status: string
}

export default function Activities() {
  const { user } = useAuth()
  const [activities, setActivitie] = useState<ActividadApi[]>([])
  const [activitiesLocal, setActivitiesLocal] = useState<ActividadLocal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActividadLocal | null>(null)
  const [isSavingActivity, setIsSavingActivity] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [proyectos, setProyectos] = useState<any[]>([])
  const [clases, setClases] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'project' as Activity['type'],
    status: 'Planeado',
    proyectoId: '',
    claseId: '',
  })

  const loadActivities = async () => {
    if (!user?.id) return

    setIsLoadingApi(true)

    const res = await actividadesService.getActividades()

    if (!res.ok || !res.data) {
      setActivitie([])
      setIsLoadingApi(false)
      return
    }

    const userIdNumber = Number(user.id)

    setActivitie(
      res.data.filter((a) => a.usuario_id === userIdNumber)
    )

    setIsLoadingApi(false)
  }

  useEffect(() => {
    const loadExtras = async () => {
      if (!user?.id) {
        setProyectos([])
        setClases([])
        return
      }

      const userIdNum = Number(user.id)
      
      const resProyectos = await proyectosService.getProyectos()
      const resClases = await clasesService.getClasesByUsuario(userIdNum)

      if (resProyectos.ok && resProyectos.data) {
        setProyectos(resProyectos.data.filter((proyecto) => proyecto.usuario_id === userIdNum))
      } else {
        setProyectos([])
      }
      
      if (resClases.ok && resClases.data) {
        setClases(resClases.data)
      } else {
        setClases([])
      }
    }

    loadExtras()
  }, [user?.id])
  
  useEffect(() => {
    loadActivities()
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      const local = userService.getActivities(user.id)
      setActivitiesLocal(local)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isModalOpen) return
    if (proyectos.length === 0) return
    if (formData.proyectoId !== '') return

    setFormData((prev) => ({ ...prev, proyectoId: String(proyectos[0].id) }))
  }, [isModalOpen, proyectos, formData.proyectoId])

  useEffect(() => {
    if (!isModalOpen) return
    if (clases.length === 0) return
    if (formData.claseId !== '') return

    setFormData((prev) => ({ ...prev, claseId: String(clases[0].id) }))
  }, [isModalOpen, clases, formData.claseId])

  const allActivities = [
    ...activities.map((a) => {
      const proyecto = proyectos.find(p => p.id === a.proyecto_id)
      const clase = clases.find(c => c.id === a.clase_id)

      return {
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
        proyectoNombre: proyecto?.titulo || 'Sin proyecto',
        claseNombre: clase?.nombre || 'Sin clase',
      }
    }),
    ...activitiesLocal,
  ]

  const filteredActivities = filterStatus
    ? allActivities.filter((a) => a.status === filterStatus)
    : allActivities

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.title.trim()) return

    if (proyectos.length === 0 || !formData.proyectoId) {
      alert('Debes seleccionar un proyecto para esta actividad.')
      return
    }

    if (clases.length === 0 || !formData.claseId) {
      alert('Debes seleccionar una clase para esta actividad.')
      return
    }

    setIsSavingActivity(true)

    const payload = {
      titulo: formData.title.trim(),
      descripcion: formData.description.trim(),
      fecha: editingActivity?.date || new Date().toISOString(),
      estado: formData.status,
      usuario_id: Number(user.id),
      proyecto_id: Number(formData.proyectoId),
      clase_id: Number(formData.claseId),
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

    setFormData({ title: '', description: '', type: 'project', status: 'Planeado', proyectoId: '', claseId: '' })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!user?.id) return

    if (id.startsWith('api-')) {
      const apiId = Number(id.replace('api-', ''))
      const result = await actividadesService.updateActividad(apiId, { estado: newStatus })
      if (result.ok) {
        setActivitie((prev) =>
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

    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return

    if (id.startsWith('api-')) {
      const apiId = Number(id.replace('api-', ''))
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

  const openModal = () => {
    setEditingActivity(null)
    setFormData({
      title: '',
      description: '',
      type: 'project',
      status: 'Planeado',
      proyectoId: proyectos.length > 0 ? String(proyectos[0].id) : '',
      claseId: clases.length > 0 ? String(clases[0].id) : '',
    })
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
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
        <Button onClick={openModal}>
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>

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
                      <StatusIcon className={cn('w-5 h-5', statusInfo.color)} />
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
                            <Edit className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                            aria-label="Eliminar actividad"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      {activity.proyectoNombre && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Proyecto: {activity.proyectoNombre}
                        </p>
                      )}
                      {activity.claseNombre && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Clase: {activity.claseNombre}
                        </p>
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
            <Button onClick={openModal}>
              <Plus className="w-4 h-4" />
              Agregar primera actividad
            </Button>
          </CardContent>
        </Card>
      )}

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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Proyecto</label>
              {proyectos.length > 0 ? (
                <select
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                  )}
                  value={formData.proyectoId}
                  onChange={(e) => setFormData({ ...formData, proyectoId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Selecciona un proyecto
                  </option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.titulo}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    No tienes proyectos creados. Debes crear al menos un proyecto antes de registrar actividades.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Clase</label>
              {clases.length > 0 ? (
                <select
                  className={cn(
                    'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                  )}
                  value={formData.claseId}
                  onChange={(e) => setFormData({ ...formData, claseId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Selecciona una clase
                  </option>
                  {clases.map((clase) => (
                    <option key={clase.id} value={clase.id}>
                      {clase.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    No tienes clases creadas. Debes crear al menos una clase antes de registrar actividades.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isSavingActivity} 
              className="flex-1"
              disabled={proyectos.length === 0 || clases.length === 0 || !formData.proyectoId || !formData.claseId}
            >
              {editingActivity ? 'Actualizar Actividad' : 'Crear Actividad'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, CheckCircle, Clock, Target, Trash2 } from 'lucide-react'
import { iconActividades } from '../../assets/Icons'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/user.service'
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
  { value: 'completed', label: 'Completado', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  { value: 'in-progress', label: 'En progreso', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { value: 'planned', label: 'Planeado', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
] as const

export default function Activities() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'project' as Activity['type'],
    status: 'planned' as Activity['status'],
  })

  useEffect(() => {
    if (user?.id) {
      loadActivities()
    }
  }, [user?.id])

  const loadActivities = () => {
    if (user?.id) {
      setActivities(userService.getActivities(user.id))
    }
  }

  const filteredActivities = filterStatus
    ? activities.filter((a) => a.status === filterStatus)
    : activities

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.title.trim()) return

    userService.createActivity(
      {
        title: formData.title,
        description: formData.description,
        date: formData.date || new Date().toISOString(),
        type: formData.type,
        status: formData.status,
      },
      user.id
    )

    loadActivities()
    setIsModalOpen(false)
    setFormData({ title: '', description: '', date: '', type: 'project', status: 'planned' })
  }

  const handleStatusChange = (id: string, newStatus: Activity['status']) => {
    userService.updateActivity(id, { status: newStatus })
    loadActivities()
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estas seguro de eliminar esta actividad?')) {
      userService.deleteActivity(id)
      loadActivities()
    }
  }

  const getStatusInfo = (status: Activity['status']) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
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
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>

      {/* Activities List */}
      {filteredActivities.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredActivities.map((activity) => {
            const statusInfo = getStatusInfo(activity.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={activity.id} variant="bordered" className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', statusInfo.bg)}>
                      <StatusIcon className={cn('w-5 h-5', statusInfo.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{activity.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={cn('inline-block px-2 py-0.5 text-xs rounded-full', statusInfo.bg, statusInfo.color)}>
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">{activity.type}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.date)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                          aria-label="Eliminar actividad"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                      {activity.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleStatusChange(activity.id, status.value)}
                            className={cn(
                              'px-2 py-1 text-xs rounded-lg transition-colors',
                              activity.status === status.value
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
            <p className="text-muted-foreground mb-4">
              Organiza tus proyectos, cursos y eventos academicos
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Agregar primera actividad
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Actividad">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Titulo"
            placeholder="Ej: Proyecto de investigacion"
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Activity['status'] })}
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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear Actividad
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

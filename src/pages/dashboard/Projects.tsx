import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, FolderOpen, Edit, Trash2 } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { proyectosService } from '../../services/proyectos.service'
import type { ProyectoApi, CreateProyectoRequest } from '../../services/proyectos.service'
import { cn } from '../../utils/helpers'

export default function Projects() {
  const { user } = useAuth()
  const toast = useToast()
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoApi | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    descripcion: '',
  })
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
  })

  const loadProyectos = async () => {
    setIsLoading(true)
    setError('')
    const result = await proyectosService.getProyectos()
    if (result.ok && result.data) {
      // Filtrar solo los proyectos del usuario actual
      const userProjects = result.data.filter(proyecto => 
        proyecto.usuario_id === parseInt(user?.id || '0')
      )
      setProyectos(userProjects)
    } else {
      setError(result.error ?? 'No se pudo cargar los proyectos')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadProyectos()
  }, [])

  const handleCreateProyecto = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim() || !user?.id) {
      toast.warning('Título requerido', 'Ingresa un título para el proyecto')
      return
    }

    setIsCreating(true)

    const proyectoData: CreateProyectoRequest = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      usuario_id: parseInt(user.id),
    }

    const toastId = toast.loading('Creando proyecto...', 'Por favor espera')
    const result = await proyectosService.createProyecto(proyectoData)
    setIsCreating(false)

    if (result.ok) {
      toast.removeToast(toastId)
      toast.success('¡Creado!', 'Tu proyecto fue creado correctamente')
      setFormData({ titulo: '', descripcion: '' })
      setShowCreateModal(false)
      loadProyectos()
    } else {
      toast.removeToast(toastId)
      toast.error('Error', result.error ?? 'No se pudo crear el proyecto')
    }
  }

  const handleViewDetails = async (proyectoId: number) => {
    setIsLoadingDetails(true)
    setError('')
    const result = await proyectosService.getProyectoById(proyectoId)
    setIsLoadingDetails(false)

    if (result.ok && result.data) {
      setSelectedProyecto(result.data)
      setShowDetailsModal(true)
    } else {
      setError(result.error ?? 'No se pudo cargar los detalles del proyecto')
    }
  }

  const handleEditProyecto = (proyecto: ProyectoApi) => {
    setSelectedProyecto(proyecto)
    setEditFormData({
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
    })
    setShowEditModal(true)
  }

  const handleUpdateProyecto = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedProyecto || !editFormData.titulo.trim()) {
      toast.warning('Título requerido', 'Ingresa un título para el proyecto')
      return
    }

    setIsUpdating(true)

    const updateData = {
      titulo: editFormData.titulo.trim(),
      descripcion: editFormData.descripcion.trim(),
    }

    const toastId = toast.loading('Actualizando proyecto...', 'Por favor espera')
    const result = await proyectosService.updateProyecto(selectedProyecto.id, updateData)
    setIsUpdating(false)

    if (result.ok) {
      toast.removeToast(toastId)
      toast.success('¡Actualizado!', 'Tu proyecto fue modificado correctamente')
      setShowEditModal(false)
      setSelectedProyecto(null)
      loadProyectos()
    } else {
      toast.removeToast(toastId)
      toast.error('Error', result.error ?? 'No se pudo actualizar el proyecto')
    }
  }

  const handleDeleteProyecto = async (proyectoId: number) => {
    setIsDeleting(proyectoId)

    const toastId = toast.loading('Eliminando proyecto...', 'Por favor espera')
    try {
      const result = await proyectosService.deleteProyecto(proyectoId)
      setIsDeleting(null)
      setShowDeleteConfirm(null)

      if (result.ok) {
        toast.removeToast(toastId)
        toast.success('¡Eliminado!', 'Tu proyecto fue eliminado correctamente')
        loadProyectos()
      } else {
        toast.removeToast(toastId)
        toast.error('Error', result.error ?? 'No se pudo eliminar el proyecto')
      }
    } catch (error) {
      setIsDeleting(null)
      toast.removeToast(toastId)
      toast.error('Error', 'Algo salió mal al eliminar')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Mis Proyectos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus proyectos personales</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Crear Proyecto
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Cargando proyectos...</div>
          </CardContent>
        </Card>
      ) : proyectos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((proyecto) => (
            <Card key={proyecto.id} variant="bordered" className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{proyecto.titulo}</h3>
                    {proyecto.descripcion && (
                      <p className="text-sm text-muted-foreground mt-2">{proyecto.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      ID: {proyecto.id}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(proyecto.id)}
                        disabled={isLoadingDetails}
                      >
                        Ver detalles
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditProyecto(proyecto)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(proyecto.id)}
                        disabled={isDeleting === proyecto.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay proyectos</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer proyecto para empezar a organizar tu trabajo.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Crear Proyecto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear Nuevo Proyecto">
        <form onSubmit={handleCreateProyecto} className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            Crea un nuevo proyecto para organizar tu trabajo.
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Título</label>
              <span className={cn(
                'text-xs font-semibold',
                formData.titulo.length > 50 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {formData.titulo.length}/50
              </span>
            </div>
            <Input
              placeholder="Ingresa el título del proyecto"
              value={formData.titulo}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 50) {
                  setFormData(prev => ({ ...prev, titulo: text }))
                }
              }}
              maxLength={50}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <span className={cn(
                'text-xs font-semibold',
                formData.descripcion.length > 250 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {formData.descripcion.length}/250
              </span>
            </div>
            <textarea
              placeholder="Describe tu proyecto (opcional)"
              value={formData.descripcion}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 250) {
                  setFormData(prev => ({ ...prev, descripcion: text }))
                }
              }}
              maxLength={250}
              className={cn(
                'flex min-h-[80px] w-full rounded-lg border-2 border-[#000] bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[#7dc280]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Crear Proyecto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detalles del Proyecto">
        {selectedProyecto && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {selectedProyecto.titulo}
              </h3>
              {selectedProyecto.descripcion ? (
                <p className="text-sm text-muted-foreground">
                  {selectedProyecto.descripcion}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin descripción
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-muted-foreground">
                ID del proyecto: {selectedProyecto.id}
              </span>
              <span className="text-xs text-muted-foreground">
                Usuario ID: {selectedProyecto.usuario_id}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Proyecto">
        <form onSubmit={handleUpdateProyecto} className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            Modifica los detalles de tu proyecto.
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Título</label>
              <span className={cn(
                'text-xs font-semibold',
                editFormData.titulo.length > 50 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {editFormData.titulo.length}/50
              </span>
            </div>
            <Input
              placeholder="Ingresa el título del proyecto"
              value={editFormData.titulo}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 50) {
                  setEditFormData(prev => ({ ...prev, titulo: text }))
                }
              }}
              maxLength={50}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <span className={cn(
                'text-xs font-semibold',
                editFormData.descripcion.length > 250 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {editFormData.descripcion.length}/250
              </span>
            </div>
            <textarea
              placeholder="Describe tu proyecto"
              value={editFormData.descripcion}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 250) {
                  setEditFormData(prev => ({ ...prev, descripcion: text }))
                }
              }}
              maxLength={250}
              className={cn(
                'flex min-h-[80px] w-full rounded-lg border-2 border-[#000] bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[#7dc280]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isUpdating} className="flex-1">
              Actualizar Proyecto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirmar eliminación"
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-foreground">
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción <strong>no se puede deshacer</strong> y se perderán todos los apuntes asociados.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (showDeleteConfirm !== null) {
                  handleDeleteProyecto(showDeleteConfirm)
                }
              }}
              className="flex-1 bg-destructive hover:bg-destructive/90"
              isLoading={isDeleting !== null}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
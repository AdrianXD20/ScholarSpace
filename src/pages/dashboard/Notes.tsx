import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { iconBuscar, iconApuntes } from '../../assets/Icons'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { notasService } from '../../services/notas.service'
import { proyectosService } from '../../services/proyectos.service'
import type { NotaApi } from '../../services/notas.service'
import type { ProyectoApi } from '../../services/proyectos.service'
import { formatDate, cn } from '../../utils/helpers'

export default function Notes() {
  const { user } = useAuth()
  const toast = useToast()
  const [notes, setNotes] = useState<NotaApi[]>([])
  const [projects, setProjects] = useState<ProyectoApi[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<NotaApi | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    proyectoId: '' as number | '',
  })

  useEffect(() => {
    if (!user?.id) return

    const load = async () => {
      const userIdNum = Number(user.id)
      const [notesRes, projectsRes] = await Promise.all([
        notasService.getNotas(),
        proyectosService.getProyectos(),
      ])

      if (notesRes.ok && notesRes.data) {
        setNotes(notesRes.data.filter((n) => n.usuario_id === userIdNum))
      } else {
        setNotes([])
      }

      if (projectsRes.ok && projectsRes.data) {
        setProjects(projectsRes.data.filter((p) => p.usuario_id === userIdNum))
      } else {
        setProjects([])
      }
    }

    void load()
  }, [user?.id])

  useEffect(() => {
    if (!isModalOpen || formData.proyectoId !== '' || projects.length === 0) return
    setFormData((prev) => ({ ...prev, proyectoId: projects[0].id }))
  }, [isModalOpen, formData.proyectoId, projects])

  const loadNotes = async () => {
    if (!user?.id) return
    const userIdNum = Number(user.id)
    const res = await notasService.getNotas()
    if (res.ok && res.data) {
      setNotes(res.data.filter((n) => n.usuario_id === userIdNum))
    } else {
      setNotes([])
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingNote(null)
    setFormData({
      titulo: '',
      contenido: '',
      proyectoId: projects[0]?.id ?? '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (note: NotaApi) => {
    setEditingNote(note)
    setFormData({
      titulo: note.titulo,
      contenido: note.contenido,
      proyectoId: note.proyecto_id,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id || !formData.titulo.trim() || !formData.contenido.trim()) return
    if (projects.length === 0 || formData.proyectoId === '') {
      toast.warning('Proyecto requerido', 'Selecciona un proyecto para asociar este apunte')
      return
    }

    const payload = {
      titulo: formData.titulo.trim(),
      contenido: formData.contenido.trim(),
      fecha: editingNote?.fecha || new Date().toISOString().slice(0, 10),
      usuario_id: Number(user.id),
      proyecto_id: Number(formData.proyectoId),
    }

    setIsSubmitting(true)
    const toastId = toast.loading(
      editingNote ? 'Actualizando apunte...' : 'Creando apunte...',
      'Por favor espera'
    )
    try {
      if (editingNote) {
        const res = await notasService.updateNota(editingNote.id, payload)
        if (!res.ok) {
          toast.removeToast(toastId)
          toast.error('Error', res.error ?? 'No se pudo actualizar el apunte')
          return
        }
        toast.removeToast(toastId)
        toast.success('¡Actualizado!', 'Tu apunte fue modificado correctamente')
      } else {
        const res = await notasService.createNota(payload)
        if (!res.ok) {
          toast.removeToast(toastId)
          toast.error('Error', res.error ?? 'No se pudo crear el apunte')
          return
        }
        toast.removeToast(toastId)
        toast.success('¡Creado!', 'Tu apunte fue guardado correctamente')
      }

      await loadNotes()
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    const toastId = toast.loading('Eliminando apunte...', 'Por favor espera')
    try {
      const res = await notasService.deleteNota(id)
      if (!res.ok) {
        toast.removeToast(toastId)
        toast.error('Error', res.error ?? 'No se pudo eliminar el apunte')
        return
      }
      toast.removeToast(toastId)
      toast.success('¡Eliminado!', 'Tu apunte fue eliminado correctamente')
      setShowDeleteConfirm(null)
      await loadNotes()
    } catch (error) {
      toast.removeToast(toastId)
      toast.error('Error', 'Algo salió mal al eliminar')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <img
            src={iconBuscar}
            alt=""
            className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 object-contain pointer-events-none"
            aria-hidden
          />
          <Input
            placeholder="Buscar apuntes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 text-black dark:text-white" />
          Nuevo Apunte
        </Button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} variant="bordered" className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{note.titulo}</h3>
                  <div className="flex gap-1 transition-opacity">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1.5 rounded-lg bg-secondary/40 hover:bg-secondary transition-colors"
                      aria-label="Editar apunte"
                    >
                      <Edit className="w-4 h-4 text-black dark:text-white" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(note.id)}
                      className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                      aria-label="Eliminar apunte"
                    >
                      <Trash2 className="w-4 h-4 text-black dark:text-white" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{note.contenido}</p>
                <p className="mt-3 text-xs text-muted-foreground">{formatDate(note.fecha)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <img
              src={iconApuntes}
              alt=""
              className="w-16 h-16 mx-auto mb-4 object-contain"
              aria-hidden
            />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'No se encontraron resultados' : 'Comienza a crear apuntes'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Intenta con otros terminos de busqueda'
                : 'Guarda tus notas, ideas y conocimientos aqui'}
            </p>
            {!searchTerm && (
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4" />
                Crear primer apunte
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Editar Apunte' : 'Nuevo Apunte'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="Título del apunte"
              value={formData.titulo}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 50) {
                  setFormData({ ...formData, titulo: text })
                }
              }}
              maxLength={50}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Contenido</label>
              <span className={cn(
                'text-xs font-semibold',
                formData.contenido.length > 250 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {formData.contenido.length}/250
              </span>
            </div>
            <textarea
              placeholder="Escribe tu apunte aquí..."
              value={formData.contenido}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 250) {
                  setFormData({ ...formData, contenido: text })
                }
              }}
              maxLength={250}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-input border-2 border-[#000]',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[#7dc280]',
                'resize-none min-h-[120px]'
              )}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Proyecto</label>
            {projects.length > 0 ? (
              <select
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg bg-input border border-border',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
                )}
                value={formData.proyectoId}
                onChange={(e) => {
                  const raw = e.target.value
                  setFormData((prev) => ({ ...prev, proyectoId: raw ? Number(raw) : '' }))
                }}
              >
                <option value="" disabled>
                  Selecciona un proyecto
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                Primero crea un proyecto para poder asociar este apunte.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={projects.length === 0 || formData.proyectoId === ''}
            >
              {editingNote ? 'Guardar Cambios' : 'Crear Apunte'}
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
              ¿Estás seguro de que quieres eliminar este apunte? Esta acción <strong>no se puede deshacer</strong>.
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
                  handleDelete(showDeleteConfirm)
                }
              }}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

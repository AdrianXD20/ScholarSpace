import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Plus, Copy, CheckCircle, BookOpen } from 'lucide-react'
import Card, { CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/common/Modal'
import { useToast } from '../../context/ToastContext'
import { clasesService } from '../../services/clases.service'
import type { ClaseApi } from '../../services/clases.service'

export default function Clases() {
  const toast = useToast()
  const [clases, setClases] = useState<ClaseApi[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCodigo, setJoinCodigo] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [joinedIds, setJoinedIds] = useState<number[]>([])

  const availableClases = clases.filter((c) => !joinedIds.includes(c.id))

  const loadClases = async () => {
    setIsLoading(true)
    setError('')
    const result = await clasesService.getClasesFromApi()
    if (result.ok && result.data) {
      setClases(result.data as ClaseApi[])
      setJoinedIds(clasesService.getJoinedClassIds())
    } else {
      setError(result.error ?? 'No se pudo cargar las clases')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadClases()
  }, [])

  const handleCopyCode = (codigo: string, id: number) => {
    navigator.clipboard.writeText(codigo)
    setCopiedId(id)
    toast.success('¡Copiado!', `Código: ${codigo}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleJoinByCodigo = async (codigo: string) => {
    setIsJoining(true)
    const toastId = toast.loading('Uniéndote a la clase...', 'Por favor espera')
    
    const result = await clasesService.joinClaseFromApi(codigo.trim())
    setIsJoining(false)

    if (result.ok) {
      setJoinedIds(clasesService.getJoinedClassIds())
      toast.removeToast(toastId)
      toast.success('¡Bienvenido!', 'Te uniste a la clase correctamente')
    } else {
      toast.removeToast(toastId)
      toast.error('Error', result.error ?? 'No se pudo unir a la clase')
    }
  }

  const handleJoinClase = async (e: FormEvent) => {
    e.preventDefault()
    if (!joinCodigo.trim()) {
      toast.warning('Código requerido', 'Ingresa un código de clase')
      return
    }

    setIsJoining(true)
    const toastId = toast.loading('Uniéndote a la clase...', 'Por favor espera')
    
    const result = await clasesService.joinClaseFromApi(joinCodigo.trim())
    setIsJoining(false)

    if (result.ok) {
      if (result.data?.id) {
        const claseId = Number(result.data.id)
        clasesService.addJoinedClassId(claseId)
        setJoinedIds(clasesService.getJoinedClassIds())
      }
      toast.removeToast(toastId)
      toast.success('¡Bienvenido!', 'Te uniste a la clase correctamente')
      setJoinCodigo('')
      setShowJoinModal(false)
      loadClases()
    } else {
      toast.removeToast(toastId)
      toast.error('Error', result.error ?? 'No se pudo unir a la clase')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Clases disponibles
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Únete a una clase usando su código de invitación.</p>
        </div>
        <Button onClick={() => setShowJoinModal(true)}>
          <Plus className="w-4 h-4" />
          Unirme a una clase
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
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Classes List */}
      {isLoading ? (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">Cargando clases...</div>
          </CardContent>
        </Card>
      ) : availableClases.length > 0 ? (
        <div className="grid gap-4">
          {availableClases.map((clase) => (
            <Card key={clase.id} variant="bordered" className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{clase.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-2">Profesor: {clase.profesor?.nombre ?? 'Sin asignar'}</p>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-mono font-medium text-foreground">
                          {clase.codigo}
                        </code>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(clase.codigo, clase.id)}
                        >
                          {copiedId === clase.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-primary" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copiar código
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="sm:self-center">
                    <Button variant="outline" onClick={() => handleJoinByCodigo(clase.codigo)} disabled={isJoining}>
                      Unirse
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hay clases disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Solicita un código de clase a tu profesor o únete con el botón de arriba.
            </p>
            <Button onClick={() => setShowJoinModal(true)}>
              <Plus className="w-4 h-4" />
              Unirme a una clase
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Join Class Modal */}
      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Unirme a una clase">
        <form onSubmit={handleJoinClase} className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            Ingresa el código de clase que te proporcionó tu profesor.
          </div>
          <Input
            placeholder="Código de clase (ej: ced047)"
            value={joinCodigo}
            onChange={(e) => setJoinCodigo(e.target.value.toLowerCase())}
            required
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isJoining} className="flex-1">
              Unirme
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

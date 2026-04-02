import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import Button from '../ui/Button'

/**
 * Componente de ejemplo que muestra todas las posibilidades del sistema de alertas
 * Para usar: importa este componente en una página y renderizalo
 * 
 * Ejemplos de uso:
 * - <AlertsDemo />
 */

export default function AlertsDemo() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Ejemplos de cada tipo de alerta
  const showSuccess = () => {
    toast.success('¡Éxito!', 'La acción se completó correctamente')
  }

  const showError = () => {
    toast.error('Error', 'Ocurrió un problema y no se pudo completar la acción')
  }

  const showWarning = () => {
    toast.warning('Advertencia', 'Asegúrate de lo que estás haciendo')
  }

  const showInfo = () => {
    toast.info('Información', 'Esto es solo una notificación informativa')
  }

  const showLoading = () => {
    setIsLoading(true)
    const id = toast.loading('Procesando', 'Por favor, espera a que termine...')

    // Simular operación larga
    setTimeout(() => {
      toast.removeToast(id)
      toast.success('¡Completado!', 'La operación terminó exitosamente')
      setIsLoading(false)
    }, 3000)
  }

  // Caso real: Guardar formulario
  const handleSaveForm = async () => {
    const id = toast.loading('Guardando datos', 'Por favor espera...')

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.removeToast(id)
      toast.success('Datos guardados', 'Tu información fue actualizada correctamente')
    } catch (error) {
      toast.error('Error al guardar', 'Intenta nuevamente más tarde')
    }
  }

  // Caso real: Eliminar elemento
  const handleDeleteItem = async () => {
    const id = toast.loading('Eliminando item', 'Esto solo toma un momento...')

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.removeToast(id)
      toast.success('Item eliminado', 'El elemento fue borrado permanentemente')
    } catch (error) {
      toast.error('No se pudo eliminar', 'Por favor intenta de nuevo')
    }
  }

  // Caso real: Validación de formulario
  const handleValidateForm = (email: string) => {
    if (!email) {
      toast.warning('Campo requerido', 'Por favor ingresa un email')
      return false
    }

    if (!email.includes('@')) {
      toast.error('Email inválido', 'Asegúrate de escribir un email válido')
      return false
    }

    toast.success('Email válido', email)
    return true
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-[#000] mb-2">Sistema de Alertas</h1>
        <p className="text-[#636e72] text-lg">
          Ejemplos de todas las posibilidades del sistema de notificaciones
        </p>
      </div>

      {/* Alertas Básicas */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Tipos de Alertas Básicas</h2>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="primary" onClick={showSuccess}>
            Success
          </Button>
          <Button variant="secondary" onClick={showError}>
            Error
          </Button>
          <Button variant="warning" onClick={showWarning}>
            Warning
          </Button>
          <Button variant="secondary" onClick={showInfo}>
            Info
          </Button>
        </div>
      </div>

      {/* Loading */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Loading Alert</h2>

        <Button
          variant="secondary"
          onClick={showLoading}
          disabled={isLoading}
          isLoading={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Iniciar proceso de 3 segundos'}
        </Button>

        <p className="text-[#636e72] text-sm mt-4">
          Verás un alert tipo loading que se cierra automáticamente después de 3 segundos
        </p>
      </div>

      {/* Casos Reales */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Casos de Uso Reales</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#000] mb-2">Guardar Formulario</h3>
            <Button variant="primary" onClick={handleSaveForm}>
              Simular Guardado
            </Button>
            <p className="text-[#636e72] text-sm mt-2">
              Muestra loading durante 2 segundos, luego success
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#000] mb-2">Eliminar Item</h3>
            <Button variant="warning" onClick={handleDeleteItem}>
              Simular Eliminación
            </Button>
            <p className="text-[#636e72] text-sm mt-2">
              Muestra loading durante 1.5 segundos, luego success
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#000] mb-2">Validación</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Ingresa un email..."
                className="flex-1 px-4 py-2 border-2 border-[#000] rounded-sm"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const email = (
                    document.querySelector('input[type=email]') as HTMLInputElement
                  )?.value
                  handleValidateForm(email)
                }}
              >
                Validar
              </Button>
            </div>
            <p className="text-[#636e72] text-sm mt-2">
              Prueba: vacío, sinválido @, o válido
            </p>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Cómo Usar en tu Código</h2>

        <div className="bg-[#f8f8f8] border-2 border-[#000] rounded-sm p-4 font-mono text-sm overflow-x-auto">
          <pre>{`import { useToast } from '@/context/ToastContext'

export function MyComponent() {
  const toast = useToast()

  // Success
  toast.success('Título', 'Mensaje')

  // Error
  toast.error('Título', 'Mensaje')

  // Warning
  toast.warning('Título', 'Mensaje')

  // Info
  toast.info('Título', 'Mensaje')

  // Loading
  const id = toast.loading('Título', 'Mensaje')
  await doSomething()
  toast.removeToast(id)
}`}</pre>
        </div>
      </div>

      {/* Múltiples Alertas */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Múltiples Alertas</h2>

        <Button
          variant="primary"
          onClick={() => {
            toast.info('Primera notificación')
            setTimeout(() => toast.success('Segunda notificación'), 300)
            setTimeout(() => toast.warning('Tercera notificación'), 600)
          }}
        >
          Mostrar 3 Alertas en Secuencia
        </Button>
      </div>

      {/* Features */}
      <div className="bg-white border-2 border-[#000] rounded-sm shadow-[6px_6px_0_rgba(0,0,0,0.15)] p-6">
        <h2 className="text-2xl font-extrabold text-[#000] mb-4">Características</h2>

        <ul className="space-y-2 text-[#636e72]">
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Animaciones únicas para cada tipo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Auto-dismiss configurable (3-4 segundos)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Botón de cierre manual (X)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Progress bar visual del tiempo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Loading indefinido sin auto-close</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Coherente con el design de cuaderno</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Responsive en mobile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Dark mode automático</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7dc280] font-bold">✓</span>
            <span>Accesible (WCAG AA)</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

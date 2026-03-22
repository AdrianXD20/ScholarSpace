import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Copy, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { clasesService } from '../../services/clases.service'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'

export default function MisClases() {
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [msg, setMsg] = useState('')
  const [version, setVersion] = useState(0)

  const clases = useMemo(() => {
    if (!user?.id) return []
    return clasesService.getClasesByDocente(user.id)
  }, [user?.id, version])

  function refresh() {
    setVersion((n) => n + 1)
  }

  const handleCrear = (e: FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!user?.id || !nombre.trim()) {
      setMsg('Indica el nombre de la clase.')
      return
    }
    clasesService.crearClase(user.id, nombre.trim(), descripcion.trim() || undefined)
    setNombre('')
    setDescripcion('')
    setMsg('Clase creada. Comparte el código de invitación con tus estudiantes.')
    refresh()
  }

  const copiar = (codigo: string) => {
    void navigator.clipboard.writeText(codigo)
    setMsg('Código copiado al portapapeles.')
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis clases</h1>
        <p className="text-muted-foreground mt-1">
          Crea grupos y comparte el código para que solo esos alumnos aparezcan en tu vista.
        </p>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Nueva clase</CardTitle>
          <CardDescription>
            Cada clase tiene un código único. Los estudiantes lo ingresan al registrarse o en su
            perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCrear} className="space-y-4">
            {msg && (
              <p className="text-sm text-primary bg-primary/10 rounded-lg px-3 py-2">{msg}</p>
            )}
            <Input
              label="Nombre de la clase"
              placeholder="Ej. Programación I — Grupo A"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Breve descripción para tu referencia"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Crear clase
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Clases creadas</h2>
        {clases.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no tienes clases. Crea la primera arriba.</p>
        ) : (
          <ul className="space-y-3">
            {clases.map((c) => (
              <li key={c.id}>
                <Card variant="bordered">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{c.nombre}</p>
                      {c.descripcion && (
                        <p className="text-sm text-muted-foreground mt-0.5">{c.descripcion}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {c.estudianteIds.length} estudiante(s) · Código:{' '}
                        <span className="font-mono font-semibold text-foreground">
                          {c.codigoInvitacion}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => copiar(c.codigoInvitacion)}
                      >
                        <Copy className="w-4 h-4" />
                        Copiar código
                      </Button>
                      <Link to={`/profesor/clases/${c.id}`}>
                        <Button type="button" size="sm" className="gap-1">
                          Abrir clase
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

import { cn } from '../../utils/helpers'

interface BarItem {
  etiqueta: string
  valor: number
  colorClass?: string
}

interface GraficoBarrasSimpleProps {
  titulo: string
  datos: BarItem[]
  descripcion?: string
}

export default function GraficoBarrasSimple({ titulo, datos, descripcion }: GraficoBarrasSimpleProps) {
  const max = Math.max(1, ...datos.map((d) => d.valor))

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">{titulo}</h3>
      {descripcion && <p className="text-xs text-muted-foreground mb-4">{descripcion}</p>}
      <div className="space-y-3">
        {datos.map((d) => (
          <div key={d.etiqueta}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{d.etiqueta}</span>
              <span className="font-medium text-foreground">{d.valor}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', d.colorClass ?? 'bg-primary')}
                style={{ width: `${(d.valor / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Shield } from 'lucide-react'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" aria-hidden />
          Administración
        </h1>
        <p className="text-muted-foreground mt-1">
          Panel reservado para usuarios con rol administrador. Conecta aquí tus endpoints de gestión
          cuando la API esté lista.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
          <CardDescription>
            Esta vista está protegida por rol (`admin`) y por el permiso `admin:panel`.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Puedes añadir tablas de usuarios, métricas o configuración global llamando a tus
            servicios desde `src/services/api/`.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Unauthorized() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" aria-hidden />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Acceso no autorizado</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        No tienes permisos para ver esta sección. Si crees que es un error, contacta a un
        administrador.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Volver al panel
      </Link>
    </main>
  )
}

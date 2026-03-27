/** Rutas relativas al prefijo `VITE_API_URL` (sin barra inicial obligatoria) */
export const endpoints = {
  auth: {
    login: '/login',
    register: '/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/recuperar',
    resetear: '/resetear',
    resetPassword: '/auth/reset-password',
    verifyResetToken: '/auth/verify-reset-token',
    checkEmail: '/auth/check-email',
  },
  usuario: {
    profile: (id: string | number) => `/usuario/${id}`,
  },
  clases: {
    list: '/clases',
    /** Crea una clase para el docente autenticado */
    create: '/clases',
    join: '/clases/unirse',
    alumnos: (claseId: string | number) => `/clases/${claseId}/alumnos`,
  },
  actividades: {
    list: '/actividades',
  },
  proyectos: {
    list: '/proyectos',
    create: '/proyectos',
  },
  notes: {
    list: '/notes',
    one: (id: string) => `/notes/${id}`,
  },
  notas: {
    list: '/notas',
    one: (id: string | number) => `/notas/${id}`,
    create: '/notas',
  },
  profile: {
    me: '/users/me',
  },
  achievements: {
    list: '/achievements',
  },
  logros: {
    list: '/logros',
    create: '/logros',
  },
  experiences: {
    list: '/experiences',
  },
} as const

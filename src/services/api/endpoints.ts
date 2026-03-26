/** Rutas relativas al prefijo `VITE_API_URL` (sin barra inicial obligatoria) */
export const endpoints = {
  auth: {
    login: '/login',
    register: '/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  usuario: {
    profile: (id: string | number) => `/usuario/${id}`,
  },
  clases: {
    list: '/clases',
    join: '/clases/unirse',
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

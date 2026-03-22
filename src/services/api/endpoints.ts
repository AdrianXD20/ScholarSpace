/** Rutas relativas al prefijo `VITE_API_URL` (sin barra inicial obligatoria) */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  notes: {
    list: '/notes',
    one: (id: string) => `/notes/${id}`,
  },
  profile: {
    me: '/users/me',
  },
  achievements: {
    list: '/achievements',
  },
  activities: {
    list: '/activities',
  },
  experiences: {
    list: '/experiences',
  },
} as const

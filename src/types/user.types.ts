export type UserRole = 'student' | 'teacher' | 'admin'

export type AccountType = 'student' | 'teacher'

/** Datos extra obligatorios al registrarse como docente */
export interface PerfilDocenteRegistro {
  titulacionAcademica: string
  departamento: string
  anosExperiencia: number
  cargo?: string
}

/** Permisos granulares; la API puede devolver esta lista o derivarla del rol */
export type Permission =
  | 'notes:read'
  | 'notes:write'
  | 'profile:read'
  | 'profile:write'
  | 'achievements:read'
  | 'achievements:write'
  | 'activities:read'
  | 'activities:write'
  | 'teacher:students:read'
  | 'teacher:classes:manage'
  | 'admin:panel'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  institution?: string
  career?: string
  createdAt: string
  role: UserRole
  permissions?: Permission[]
  /** Solo docentes: datos de validación académica */
  perfilDocente?: PerfilDocenteRegistro
  /** Estudiantes: ids de clases a las que pertenecen */
  claseIds?: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  institution?: string
  career?: string
  accountType: AccountType
  /** Estudiante: opcional al registrarse para entrar a una clase */
  codigoClase?: string
  /** Obligatorio si accountType es teacher */
  perfilDocente?: PerfilDocenteRegistro
}

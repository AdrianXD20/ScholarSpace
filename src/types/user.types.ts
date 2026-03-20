export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  institution?: string
  career?: string
  createdAt: string
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
}

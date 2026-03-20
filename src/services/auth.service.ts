import type { LoginCredentials, RegisterData, User } from '../types/user.types'
import { generateId } from '../utils/helpers'

const USERS_KEY = 'users'

export const authService = {
  async login(credentials: LoginCredentials): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const user = users.find(
      (u: User & { password: string }) =>
        u.email === credentials.email && u.password === credentials.password
    )
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }
    return null
  },

  async register(data: RegisterData): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const exists = users.some((u: User) => u.email === data.email)
    
    if (exists) return null

    const newUser = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword
  },
}

export const AUTH_LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 120 },
  password: { min: 8, max: 64 },
} as const

export interface PasswordChecklist {
  minLength: boolean
  hasSpecial: boolean
  hasNumber: boolean
  hasUppercase: boolean
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  return /\S+@\S+\.\S+/.test(trimmed)
}

export function getPasswordChecklist(password: string): PasswordChecklist {
  return {
    minLength: password.length >= AUTH_LIMITS.password.min,
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const c = getPasswordChecklist(password)
  return c.minLength && c.hasSpecial && c.hasNumber && c.hasUppercase
}

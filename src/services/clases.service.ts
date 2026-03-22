import type { Clase } from '../types/clase.types'
import type { User } from '../types/user.types'
import { generateId } from '../utils/helpers'
import { resolvePermissions } from '../constants/permissions'

const CLASSES_KEY = 'scholarspace_clases'
const USERS_KEY = 'users'

type StoredUser = User & { password: string }

function readClasses(): Clase[] {
  try {
    return JSON.parse(localStorage.getItem(CLASSES_KEY) || '[]') as Clase[]
  } catch {
    return []
  }
}

function writeClasses(list: Clase[]) {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(list))
}

function readUsersRaw(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[]
  } catch {
    return []
  }
}

function writeUsers(list: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

function normalizeUser(u: User): User {
  return { ...u, permissions: resolvePermissions(u) }
}

function syncSessionUser(updated: User) {
  const session = localStorage.getItem('user')
  if (!session) return
  try {
    const cur = JSON.parse(session) as User
    if (cur.id === updated.id) {
      localStorage.setItem('user', JSON.stringify(normalizeUser(updated)))
    }
  } catch {
    /* ignore */
  }
}

function getUserPublicById(userId: string): User | null {
  const users = readUsersRaw()
  const u = users.find((x) => x.id === userId)
  if (!u) return null
  const { password: _, ...rest } = u
  return normalizeUser(rest)
}

function genCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export const clasesService = {
  crearClase(teacherId: string, nombre: string, descripcion?: string): Clase {
    const list = readClasses()
    let codigo = genCodigo()
    while (list.some((c) => c.codigoInvitacion === codigo)) codigo = genCodigo()
    const clase: Clase = {
      id: generateId(),
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
      teacherId,
      codigoInvitacion: codigo,
      estudianteIds: [],
      createdAt: new Date().toISOString(),
    }
    list.push(clase)
    writeClasses(list)
    return clase
  },

  getClasesByDocente(teacherId: string): Clase[] {
    return readClasses().filter((c) => c.teacherId === teacherId)
  },

  /** Clases en las que está inscrito el estudiante */
  getClasesInscritasEstudiante(studentId: string): Clase[] {
    return readClasses().filter((c) => c.estudianteIds.includes(studentId))
  },

  getClaseById(id: string): Clase | null {
    return readClasses().find((c) => c.id === id) ?? null
  },

  getClaseByCodigo(codigoRaw: string): Clase | null {
    const codigo = codigoRaw.trim().toUpperCase()
    return readClasses().find((c) => c.codigoInvitacion === codigo) ?? null
  },

  /** Estudiante se une con código mostrado por el docente */
  joinClaseByCodigo(studentId: string, codigoRaw: string): { ok: boolean; error?: string; user?: User } {
    const codigo = codigoRaw.trim().toUpperCase()
    if (codigo.length < 4) {
      return { ok: false, error: 'Código inválido.' }
    }
    const list = readClasses()
    const clase = list.find((c) => c.codigoInvitacion === codigo)
    if (!clase) return { ok: false, error: 'No existe una clase con ese código.' }
    if (clase.estudianteIds.includes(studentId)) {
      const u = getUserPublicById(studentId)
      return u ? { ok: true, user: u } : { ok: false, error: 'Usuario no encontrado.' }
    }
    clase.estudianteIds.push(studentId)
    writeClasses(list)

    const users = readUsersRaw()
    const idx = users.findIndex((u) => u.id === studentId)
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' }
    const prev = users[idx].claseIds ?? []
    if (!prev.includes(clase.id)) {
      users[idx] = { ...users[idx], claseIds: [...prev, clase.id] }
      writeUsers(users)
    }
    const { password: _, ...rest } = users[idx]
    const user = normalizeUser(rest)
    syncSessionUser(user)
    return { ok: true, user }
  },

  getUserPublic(userId: string): User | null {
    return getUserPublicById(userId)
  },

  /** Docente: quita estudiante de la clase (mock) */
  quitarEstudianteDeClase(claseId: string, studentId: string, teacherId: string): boolean {
    const list = readClasses()
    const c = list.find((x) => x.id === claseId && x.teacherId === teacherId)
    if (!c) return false
    c.estudianteIds = c.estudianteIds.filter((id) => id !== studentId)
    writeClasses(list)
    const users = readUsersRaw()
    const idx = users.findIndex((u) => u.id === studentId)
    if (idx !== -1) {
      const ids = (users[idx].claseIds ?? []).filter((id) => id !== claseId)
      users[idx] = { ...users[idx], claseIds: ids }
      writeUsers(users)
      const { password: _, ...rest } = users[idx]
      syncSessionUser(normalizeUser(rest))
    }
    return true
  },
}

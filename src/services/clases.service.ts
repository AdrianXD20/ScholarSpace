import type { Clase } from '../types/clase.types'
import type { User } from '../types/user.types'
import { generateId } from '../utils/helpers'
import { resolvePermissions } from '../constants/permissions'
import { httpClient, ApiError } from './api/httpClient'
import { endpoints } from './api/endpoints'

// API Clase interface (diferente de la Clase local/mock)
export interface ClaseApi {
  id: number
  nombre: string
  codigo: string
  profesor_id: number
  profesor: {
    nombre: string
    email: string
  }
}

type AlumnoApiLike = unknown

function extractAlumnoUserId(raw: AlumnoApiLike): string | null {
  if (raw == null) return null
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw)
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const id = obj.id ?? obj.usuario_id ?? obj.user_id
    if (id != null) return String(id)
  }
  return null
}

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

const JOINED_CLASSES_KEY = 'joined_clases'

function getJoinedClassIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(JOINED_CLASSES_KEY) || '[]') as number[]
  } catch {
    return []
  }
}

function setJoinedClassIds(ids: number[]) {
  localStorage.setItem(JOINED_CLASSES_KEY, JSON.stringify(Array.from(new Set(ids))))
}

function addJoinedClassId(id: number) {
  const ids = getJoinedClassIds()
  if (!ids.includes(id)) {
    ids.push(id)
    setJoinedClassIds(ids)
  }
}

function isClassJoined(id: number): boolean {
  return getJoinedClassIds().includes(id)
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

  // API Methods
  async getClasesFromApi(): Promise<{ ok: boolean; data?: ClaseApi[]; error?: string }> {
    try {
      const res = await httpClient<unknown>(endpoints.clases.list, {
        method: 'GET',
      })
      const arr = Array.isArray(res)
        ? res
        : typeof res === 'object' && res !== null && Array.isArray((res as any).data)
          ? (res as any).data
          : []
      return { ok: true, data: arr as ClaseApi[] }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener las clases'
      return { ok: false, error: msg }
    }
  },

  async crearClaseFromApi(nombre: string): Promise<{ ok: boolean; data?: ClaseApi; error?: string }> {
    const cleanNombre = nombre.trim()
    if (!cleanNombre) return { ok: false, error: 'Nombre inválido.' }
    try {
      const data = await httpClient<ClaseApi>(endpoints.clases.create, {
        method: 'POST',
        body: { nombre: cleanNombre },
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear la clase'
      return { ok: false, error: msg }
    }
  },

  async getClasesByDocenteFromApi(
    teacherId: string
  ): Promise<{ ok: boolean; data?: ClaseApi[]; error?: string }> {
    const res = await clasesService.getClasesFromApi()
    if (!res.ok || !res.data) return res
    const teacherIdStr = String(teacherId)
    return {
      ok: true,
      data: res.data.filter((c) => {
        const anyC = c as unknown as Record<string, unknown>
        const profesorId = anyC.profesor_id ?? anyC.teacher_id ?? anyC.profesorId ?? anyC.teacherId
        return String(profesorId) === teacherIdStr
      }),
    }
  },

  async getAlumnosIdsFromClaseApi(
    claseId: string | number
  ): Promise<{ ok: boolean; data?: string[]; error?: string }> {
    try {
      const res = await httpClient<unknown>(endpoints.clases.alumnos(claseId), {
        method: 'GET',
      })
      const arr = Array.isArray(res)
        ? res
        : typeof res === 'object' && res !== null && Array.isArray((res as any).data)
          ? (res as any).data
          : typeof res === 'object' && res !== null && Array.isArray((res as any).alumnos)
            ? (res as any).alumnos
            : typeof res === 'object' && res !== null && Array.isArray((res as any).students)
              ? (res as any).students
              : []
      const ids = arr.map(extractAlumnoUserId).filter((x: string | null): x is string => !!x)
      return { ok: true, data: ids }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener alumnos'
      return { ok: false, error: msg }
    }
  },

  async joinClaseFromApi(codigo: string): Promise<{ ok: boolean; data?: any; error?: string }> {
    try {
      const data = await httpClient<any>(endpoints.clases.join, {
        method: 'POST',
        body: { codigo },
      })
      // Si la API devuelve la clase con id, guardamos localmente para flag
      if (data?.id) {
        addJoinedClassId(Number(data.id))
      }
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo unir a la clase'
      return { ok: false, error: msg }
    }
  },

  getJoinedClassIds,
  isClassJoined,
  addJoinedClassId,
  setJoinedClassIds,
}

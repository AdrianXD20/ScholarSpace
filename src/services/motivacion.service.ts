import { generateId } from '../utils/helpers'

const KEY = 'scholarspace_motivacion'

export interface MensajeMotivacion {
  id: string
  teacherId: string
  studentId: string
  claseId: string
  mensaje: string
  createdAt: string
}

function read(): MensajeMotivacion[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as MensajeMotivacion[]
  } catch {
    return []
  }
}

function write(list: MensajeMotivacion[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const motivacionService = {
  registrarMensaje(
    teacherId: string,
    studentId: string,
    claseId: string,
    mensaje: string
  ): MensajeMotivacion {
    const list = read()
    const item: MensajeMotivacion = {
      id: generateId(),
      teacherId,
      studentId,
      claseId,
      mensaje: mensaje.trim(),
      createdAt: new Date().toISOString(),
    }
    list.push(item)
    write(list)
    return item
  },

  listPorEstudiante(studentId: string): MensajeMotivacion[] {
    return read()
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  ultimoParaEstudiante(studentId: string): MensajeMotivacion | null {
    const list = read()
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return list[0] ?? null
  },
}

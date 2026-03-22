/** Grupo/clase creada por un docente; los estudiantes se unen con código */
export interface Clase {
  id: string
  nombre: string
  descripcion?: string
  teacherId: string
  codigoInvitacion: string
  estudianteIds: string[]
  createdAt: string
}

import { httpClient, ApiError } from './api/httpClient'
import { endpoints } from './api/endpoints'

export interface CreateLogroRequest {
  titulo: string
  descripcion: string
  fecha: string
  tipo: 'Academico' | 'Extracurricular' | 'Personal' | 'Profesional'
  usuario_id: number
  proyecto_id: number
}

export interface LogroApi {
  id: number | string
  titulo: string
  descripcion: string
  fecha: string
  tipo: 'Academico' | 'Extracurricular' | 'Personal' | 'Profesional'
  usuario_id: number
  proyecto_id: number
}

export const logrosService = {
  async createLogro(payload: CreateLogroRequest): Promise<{ ok: boolean; data?: LogroApi; error?: string }> {
    try {
      const data = await httpClient<LogroApi>(endpoints.logros.create, {
        method: 'POST',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear el logro'
      return { ok: false, error: msg }
    }
  },
}


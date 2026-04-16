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

  async updateLogro(
    id: number | string,
    payload: Partial<CreateLogroRequest>
  ): Promise<{ ok: boolean; data?: LogroApi; error?: string }> {
    try {
      const data = await httpClient<LogroApi>(`${endpoints.logros.list}/${id}`, {
        method: 'PUT',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar el logro'
      return { ok: false, error: msg }
    }
  },

  async getLogrosFromApi(): Promise<{ ok: boolean; data?: LogroApi[]; error?: string }> {
    try {
      const res = await httpClient<unknown>(endpoints.logros.list, {
        method: 'GET',
      })
      const arr = Array.isArray(res)
        ? res
        : typeof res === 'object' && res !== null && Array.isArray((res as any).data)
          ? (res as any).data
          : typeof res === 'object' && res !== null && Array.isArray((res as any).logros)
            ? (res as any).logros
            : []
      return { ok: true, data: arr as LogroApi[] }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener los logros'
      return { ok: false, error: msg }
    }
  },
}


import { ApiError, httpClient } from './api/httpClient'
import { endpoints } from './api/endpoints'

export interface ActividadApi {
  id: number
  titulo: string
  descripcion: string
  fecha: string
  estado: string
  usuario_id: number
  proyecto_id?: number
  clase_id?: number
}

export const actividadesService = {
  async getActividades(): Promise<{ ok: boolean; data?: ActividadApi[]; error?: string }> {
    try {
      const data = await httpClient<ActividadApi[]>(endpoints.actividades.list, { method: 'GET' })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener las actividades'
      return { ok: false, error: msg }
    }
  },
}

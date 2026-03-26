import { httpClient, ApiError } from './api/httpClient'
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
      const data = await httpClient<ActividadApi[]>(endpoints.actividades.list, {
        method: 'GET',
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener las actividades'
      return { ok: false, error: msg }
    }
  },

  async createActividad(payload: Omit<ActividadApi, 'id'>): Promise<{ ok: boolean; data?: ActividadApi; error?: string }> {
    try {
      const data = await httpClient<ActividadApi>(endpoints.actividades.list, {
        method: 'POST',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear la actividad'
      return { ok: false, error: msg }
    }
  },

  async updateActividad(id: number, payload: Partial<Omit<ActividadApi, 'id'>>): Promise<{ ok: boolean; data?: ActividadApi; error?: string }> {
    try {
      const data = await httpClient<ActividadApi>(`${endpoints.actividades.list}/${id}`, {
        method: 'PUT',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar la actividad'
      return { ok: false, error: msg }
    }
  },

  async deleteActividad(id: number): Promise<{ ok: boolean; error?: string }> {
    try {
      await httpClient(`${endpoints.actividades.list}/${id}`, {
        method: 'DELETE',
      })
      return { ok: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar la actividad'
      return { ok: false, error: msg }
    }
  },
}

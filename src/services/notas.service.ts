import { ApiError, httpClient } from './api/httpClient'
import { endpoints } from './api/endpoints'

export interface NotaApi {
  id: number
  titulo: string
  contenido: string
  fecha: string
  usuario_id: number
  proyecto_id: number
}

export interface CreateNotaRequest {
  titulo: string
  contenido: string
  fecha: string
  usuario_id: number
  proyecto_id: number
}

export const notasService = {
  async getNotas(): Promise<{ ok: boolean; data?: NotaApi[]; error?: string }> {
    try {
      const data = await httpClient<NotaApi[]>(endpoints.notas.list, { method: 'GET' })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener las notas'
      return { ok: false, error: msg }
    }
  },

  async getNotaById(id: number): Promise<{ ok: boolean; data?: NotaApi; error?: string }> {
    try {
      const data = await httpClient<NotaApi>(endpoints.notas.one(id), { method: 'GET' })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener la nota'
      return { ok: false, error: msg }
    }
  },

  async createNota(payload: CreateNotaRequest): Promise<{ ok: boolean; data?: NotaApi; error?: string }> {
    try {
      const data = await httpClient<NotaApi>(endpoints.notas.create, {
        method: 'POST',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear la nota'
      return { ok: false, error: msg }
    }
  },

  async updateNota(
    id: number,
    payload: Partial<CreateNotaRequest>
  ): Promise<{ ok: boolean; data?: NotaApi; error?: string }> {
    try {
      const data = await httpClient<NotaApi>(endpoints.notas.one(id), {
        method: 'PUT',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar la nota'
      return { ok: false, error: msg }
    }
  },

  async deleteNota(id: number): Promise<{ ok: boolean; error?: string }> {
    try {
      await httpClient(endpoints.notas.one(id), { method: 'DELETE' })
      return { ok: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar la nota'
      return { ok: false, error: msg }
    }
  },
}


import { httpClient, ApiError } from './api/httpClient'
import { endpoints } from './api/endpoints'

// API Proyecto interface
export interface ProyectoApi {
  id: number
  titulo: string
  descripcion: string
  usuario_id: number
  created_at?: string
  updated_at?: string
}

export interface CreateProyectoRequest {
  titulo: string
  descripcion: string
  usuario_id: number
}

export const proyectosService = {
  async getProyectos(): Promise<{ ok: boolean; data?: ProyectoApi[]; error?: string }> {
    try {
      const data = await httpClient<ProyectoApi[]>(endpoints.proyectos.list, {
        method: 'GET',
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener los proyectos'
      return { ok: false, error: msg }
    }
  },

  async getProyectoById(id: number): Promise<{ ok: boolean; data?: ProyectoApi; error?: string }> {
    try {
      const data = await httpClient<ProyectoApi>(`${endpoints.proyectos.list}/${id}`, {
        method: 'GET',
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener el proyecto'
      return { ok: false, error: msg }
    }
  },

  async createProyecto(proyecto: CreateProyectoRequest): Promise<{ ok: boolean; data?: ProyectoApi; error?: string }> {
    try {
      const data = await httpClient<ProyectoApi>(endpoints.proyectos.create, {
        method: 'POST',
        body: proyecto,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo crear el proyecto'
      return { ok: false, error: msg }
    }
  },

  async updateProyecto(id: number, proyecto: Partial<CreateProyectoRequest>): Promise<{ ok: boolean; data?: ProyectoApi; error?: string }> {
    try {
      const data = await httpClient<ProyectoApi>(`${endpoints.proyectos.list}/${id}`, {
        method: 'PUT',
        body: proyecto,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar el proyecto'
      return { ok: false, error: msg }
    }
  },

  async deleteProyecto(id: number): Promise<{ ok: boolean; error?: string }> {
    try {
      await httpClient(`${endpoints.proyectos.list}/${id}`, {
        method: 'DELETE',
      })
      return { ok: true }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo eliminar el proyecto'
      return { ok: false, error: msg }
    }
  },
}
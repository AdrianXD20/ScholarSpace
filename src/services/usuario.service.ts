import { httpClient, ApiError } from './api/httpClient'
import { endpoints } from './api/endpoints'

export interface UsuarioData {
  id: number
  nombre: string
  email: string
  password?: string
  rol: string
  foto_perfil: string | null
  reset_token: string | null
  token_expira: string | null
}

export interface UsuarioUpdatePayload {
  nombre?: string
  email?: string
  password?: string
  foto_perfil?: string | null
}

export const usuarioService = {
  async getProfile(userId: string | number): Promise<{ ok: boolean; data?: UsuarioData; error?: string }> {
    try {
      const data = await httpClient<UsuarioData>(endpoints.usuario.profile(userId), {
        method: 'GET',
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo obtener el perfil'
      return { ok: false, error: msg }
    }
  },

  async updateProfile(
    userId: string | number,
    payload: UsuarioUpdatePayload
  ): Promise<{ ok: boolean; data?: UsuarioData; error?: string }> {
    try {
      const data = await httpClient<UsuarioData>(endpoints.usuario.profile(userId), {
        method: 'PUT',
        body: payload,
      })
      return { ok: true, data }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo actualizar el perfil'
      return { ok: false, error: msg }
    }
  },
}

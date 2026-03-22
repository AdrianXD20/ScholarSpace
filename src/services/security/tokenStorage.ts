/**
 * Almacenamiento de tokens en el cliente.
 * En producción, preferir cookies httpOnly + SameSite establecidas por el backend.
 * Aquí sessionStorage reduce exposición a XSS frente a localStorage y se limpia al cerrar pestaña.
 */
const ACCESS = 'ss_access_token'
const REFRESH = 'ss_refresh_token'

export const tokenStorage = {
  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS)
  },

  setTokens(access: string, refresh?: string) {
    sessionStorage.setItem(ACCESS, access)
    if (refresh) sessionStorage.setItem(REFRESH, refresh)
  },

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH)
  },

  clear() {
    sessionStorage.removeItem(ACCESS)
    sessionStorage.removeItem(REFRESH)
  },
}

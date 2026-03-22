const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const mockFlag = import.meta.env.VITE_USE_MOCK_AUTH

/** Sin URL de API → mock. Con URL → API salvo que fuerces VITE_USE_MOCK_AUTH=true */
const useMockAuth =
  mockFlag === 'true' || (mockFlag !== 'false' && !apiUrl)

/**
 * Configuración central. Conecta tu API con `VITE_API_URL` en `.env`.
 */
export const env = {
  apiUrl,
  useMockAuth,
} as const

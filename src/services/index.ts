/**
 * Punto de entrada de servicios. Con mock/localStorage: `notes.service`, `user.service`.
 * Con API: usa `api/notesApi`, `api/portfolioApi` y `auth.service` (ya unificado).
 */
export { authService } from './auth.service'
export { notesService } from './notes.service'
export { userService } from './user.service'
export { notesApi } from './api/notesApi'
export { portfolioApi } from './api/portfolioApi'
export { httpClient, ApiError } from './api/httpClient'
export { endpoints } from './api/endpoints'
export { tokenStorage } from './security/tokenStorage'
export { clasesService } from './clases.service'
export { motivacionService } from './motivacion.service'
export { proyectosService } from './proyectos.service'
export { notasService } from './notas.service'

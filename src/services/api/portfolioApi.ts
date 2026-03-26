import type { Achievement, Experience } from '../../types/achievement.types'
import { httpClient } from './httpClient'
import { endpoints } from './endpoints'

/**
 * Cliente para logros y experiencias. Ajusta rutas a tu API real.
 */
export const portfolioApi = {
  async achievements(): Promise<Achievement[]> {
    return httpClient<Achievement[]>(endpoints.achievements.list)
  },

  async experiences(): Promise<Experience[]> {
    return httpClient<Experience[]>(endpoints.experiences.list)
  },
}

import type { Achievement, Activity, Experience } from '../../types/achievement.types'
import { httpClient } from './httpClient'
import { endpoints } from './endpoints'

/**
 * Cliente para logros, actividades y experiencias. Ajusta rutas a tu API real.
 */
export const portfolioApi = {
  async achievements(): Promise<Achievement[]> {
    return httpClient<Achievement[]>(endpoints.achievements.list)
  },

  async activities(): Promise<Activity[]> {
    return httpClient<Activity[]>(endpoints.activities.list)
  },

  async experiences(): Promise<Experience[]> {
    return httpClient<Experience[]>(endpoints.experiences.list)
  },
}

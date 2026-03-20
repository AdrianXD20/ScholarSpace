import type { Achievement, Activity, Experience } from '../types/achievement.types'
import { generateId } from '../utils/helpers'

const ACHIEVEMENTS_KEY = 'achievements'
const ACTIVITIES_KEY = 'activities'
const EXPERIENCES_KEY = 'experiences'

export const userService = {
  // Achievements
  getAchievements(userId: string): Achievement[] {
    const data = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]')
    return data.filter((item: Achievement) => item.userId === userId)
  },

  createAchievement(data: Omit<Achievement, 'id' | 'userId'>, userId: string): Achievement {
    const items = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]')
    const newItem: Achievement = { id: generateId(), ...data, userId }
    items.push(newItem)
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(items))
    return newItem
  },

  deleteAchievement(id: string): boolean {
    const items = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]')
    const filtered = items.filter((item: Achievement) => item.id !== id)
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(filtered))
    return filtered.length < items.length
  },

  // Activities
  getActivities(userId: string): Activity[] {
    const data = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]')
    return data.filter((item: Activity) => item.userId === userId)
  },

  createActivity(data: Omit<Activity, 'id' | 'userId'>, userId: string): Activity {
    const items = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]')
    const newItem: Activity = { id: generateId(), ...data, userId }
    items.push(newItem)
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(items))
    return newItem
  },

  updateActivity(id: string, data: Partial<Activity>): Activity | null {
    const items = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]')
    const index = items.findIndex((item: Activity) => item.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...data }
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(items))
    return items[index]
  },

  deleteActivity(id: string): boolean {
    const items = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]')
    const filtered = items.filter((item: Activity) => item.id !== id)
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filtered))
    return filtered.length < items.length
  },

  // Experiences
  getExperiences(userId: string): Experience[] {
    const data = JSON.parse(localStorage.getItem(EXPERIENCES_KEY) || '[]')
    return data.filter((item: Experience) => item.userId === userId)
  },

  createExperience(data: Omit<Experience, 'id' | 'userId'>, userId: string): Experience {
    const items = JSON.parse(localStorage.getItem(EXPERIENCES_KEY) || '[]')
    const newItem: Experience = { id: generateId(), ...data, userId }
    items.push(newItem)
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(items))
    return newItem
  },

  deleteExperience(id: string): boolean {
    const items = JSON.parse(localStorage.getItem(EXPERIENCES_KEY) || '[]')
    const filtered = items.filter((item: Experience) => item.id !== id)
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(filtered))
    return filtered.length < items.length
  },
}

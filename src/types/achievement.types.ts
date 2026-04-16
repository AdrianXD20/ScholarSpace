export interface Achievement {
  id: string
  /** ID real del logro en backend (si existe). */
  apiId?: number | string
  title: string
  description: string
  date: string
  category: 'academic' | 'extracurricular' | 'personal' | 'professional'
  icon?: string
  userId: string
  /** Proyecto asociado (backend: `proyecto_id`). Solo se usa para relacionar. */
  proyecto_id?: number
}

export interface Activity {
  id: string
  title: string
  description: string
  date: string
  type: 'event' | 'project' | 'course' | 'workshop' | 'volunteer'
  status: 'completed' | 'in-progress' | 'planned'
  userId: string
}

export interface Experience {
  id: string
  title: string
  organization: string
  description: string
  startDate: string
  endDate?: string
  type: 'work' | 'internship' | 'volunteer' | 'research'
  userId: string
}

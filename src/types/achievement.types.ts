export interface Achievement {
  id: string
  title: string
  description: string
  date: string
  category: 'academic' | 'extracurricular' | 'personal' | 'professional'
  icon?: string
  userId: string
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

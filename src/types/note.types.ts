export interface Note {
  id: string
  title: string
  content: string
  subject?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId: string
}

export interface NoteFormData {
  title: string
  content: string
  subject?: string
  tags: string[]
}

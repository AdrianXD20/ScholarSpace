import type { Note, NoteFormData } from '../types/note.types'
import { generateId } from '../utils/helpers'

const NOTES_KEY = 'notes'

export const notesService = {
  getNotes(userId: string): Note[] {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
    return notes.filter((note: Note) => note.userId === userId)
  },

  createNote(data: NoteFormData, userId: string): Note {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
    const newNote: Note = {
      id: generateId(),
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    notes.push(newNote)
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return newNote
  },

  updateNote(id: string, data: Partial<NoteFormData>): Note | null {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
    const index = notes.findIndex((note: Note) => note.id === id)
    
    if (index === -1) return null

    notes[index] = {
      ...notes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return notes[index]
  },

  deleteNote(id: string): boolean {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
    const filtered = notes.filter((note: Note) => note.id !== id)
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered))
    return filtered.length < notes.length
  },
}

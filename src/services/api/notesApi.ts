import type { Note, NoteFormData } from '../../types/note.types'
import { httpClient } from './httpClient'
import { endpoints } from './endpoints'

/**
 * Cliente HTTP para apuntes. Sustituye el uso de `notes.service` (localStorage)
 * cuando `VITE_API_URL` apunte a tu backend.
 */
export const notesApi = {
  async list(): Promise<Note[]> {
    return httpClient<Note[]>(endpoints.notes.list)
  },

  async create(body: NoteFormData): Promise<Note> {
    return httpClient<Note>(endpoints.notes.list, { method: 'POST', body })
  },

  async update(id: string, body: Partial<NoteFormData>): Promise<Note> {
    return httpClient<Note>(endpoints.notes.one(id), { method: 'PATCH', body })
  },

  async remove(id: string): Promise<void> {
    await httpClient(endpoints.notes.one(id), { method: 'DELETE' })
  },
}

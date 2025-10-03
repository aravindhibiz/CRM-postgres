import apiClient from '../lib/apiClient';

export const notesService = {
  // Get all notes for a contact
  async getContactNotes(contactId) {
    try {
      const { data, error } = await apiClient.get(`/api/v1/notes/contact/${contactId}`);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching contact notes:', err);
      throw err;
    }
  },

  // Create a new note
  async createNote(noteData) {
    try {
      const { data, error } = await apiClient.post('/api/v1/notes', noteData);
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  },

  // Update a note
  async updateNote(noteId, updates) {
    try {
      const { data, error } = await apiClient.put(`/api/v1/notes/${noteId}`, updates);
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  },

  // Delete a note
  async deleteNote(noteId) {
    try {
      const { data, error } = await apiClient.delete(`/api/v1/notes/${noteId}`);
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  }
};

export default notesService;
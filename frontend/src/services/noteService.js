import api from './api';

const noteService = {
  getUserNotes: async () => {
    try {
      const response = await api.get('/notes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createNote: async (lessonId, noteData) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/notes/`, noteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateNote: async (lessonId, noteId, noteData) => {
    try {
      const response = await api.put(`/lessons/${lessonId}/notes/${noteId}/`, noteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteNote: async (lessonId, noteId) => {
    try {
      await api.delete(`/lessons/${lessonId}/notes/${noteId}/`);
    } catch (error) {
      throw error;
    }
  },

  shareNote: async (noteId, shareData) => {
    try {
      const response = await api.post(`/notes/${noteId}/share/`, shareData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportNotes: async (format = 'pdf') => {
    try {
      const response = await api.get(`/notes/export/?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default noteService; 
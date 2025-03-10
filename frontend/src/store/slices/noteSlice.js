import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import noteService from '../../services/noteService';

export const fetchUserNotes = createAsyncThunk(
  'note/fetchUserNotes',
  async () => {
    const response = await noteService.getUserNotes();
    return response.data;
  }
);

export const createNote = createAsyncThunk(
  'note/createNote',
  async ({ lessonId, noteData }) => {
    const response = await noteService.createNote(lessonId, noteData);
    return response.data;
  }
);

export const updateNote = createAsyncThunk(
  'note/updateNote',
  async ({ lessonId, noteId, noteData }) => {
    const response = await noteService.updateNote(lessonId, noteId, noteData);
    return response.data;
  }
);

export const deleteNote = createAsyncThunk(
  'note/deleteNote',
  async ({ lessonId, noteId }) => {
    await noteService.deleteNote(lessonId, noteId);
    return noteId;
  }
);

const initialState = {
  userNotes: [],
  currentNote: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    tags: [],
    shared: null,
    dateRange: {
      start: null,
      end: null,
    },
  },
};

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    setNoteFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetNoteFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user notes
      .addCase(fetchUserNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.userNotes = action.payload;
      })
      .addCase(fetchUserNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.userNotes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.userNotes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.userNotes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.userNotes = state.userNotes.filter(note => note.id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setNoteFilters, resetNoteFilters, setCurrentNote } = noteSlice.actions;
export default noteSlice.reducer; 
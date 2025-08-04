import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadNotes = createAsyncThunk(
  'notes/loadNotes',
  async (userId: string) => {
    try {
      const notesData = await AsyncStorage.getItem(`notes_${userId}`);
      return notesData ? JSON.parse(notesData) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }
);

export const addNote = createAsyncThunk(
  'notes/addNote',
  async ({ userId, title, content }: { userId: string; title: string; content: string }, { getState }) => {
    try {
      const state = getState() as { notes: NotesState };
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const updatedNotes = [...state.notes.notes, newNote];
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(updatedNotes));
      
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ userId, id, title, content }: { userId: string; id: string; title: string; content: string }, { getState }) => {
    try {
      const state = getState() as { notes: NotesState };
      const updatedNotes = state.notes.notes.map(note =>
        note.id === id
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      );
      
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(updatedNotes));
      
      return { id, title, content, updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async ({ userId, id }: { userId: string; id: string }, { getState }) => {
    try {
      const state = getState() as { notes: NotesState };
      const updatedNotes = state.notes.notes.filter(note => note.id !== id);
      
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(updatedNotes));
      
      return id;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearNotes: (state) => {
      state.notes = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Notes
      .addCase(loadNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load notes';
      })
      // Add Note
      .addCase(addNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.push(action.payload);
        state.error = null;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add note';
      })
      // Update Note
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notes.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = { ...state.notes[index], ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update note';
      })
      // Delete Note
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = state.notes.filter(note => note.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete note';
      });
  },
});

export const { clearNotes, clearError } = notesSlice.actions;
export default notesSlice.reducer;
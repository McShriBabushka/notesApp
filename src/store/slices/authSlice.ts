import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string; 
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  profileImage: string | null; // Add this line
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  profileImage: null, // Add this line
};

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    // Load users
    const usersData = await AsyncStorage.getItem('registeredUsers');
    const existingUsers: StoredUser[] = usersData ? JSON.parse(usersData) : [];

    // Check if email already exists
    const userExists = existingUsers.some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
    if (userExists) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...existingUsers, newUser];
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      // Get all registered users
      const usersData = await AsyncStorage.getItem('registeredUsers');
      const existingUsers: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      
      // Find user by email
      const foundUser = existingUsers.find(
        user => user.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!foundUser) {
        throw new Error('No account found with this email address');
      }

      // Check password
      if (foundUser.password !== password) {
        throw new Error('Incorrect password');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = foundUser;
      return userWithoutPassword;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  }
);

// Load profile image thunk
export const loadProfileImage = createAsyncThunk(
  'auth/loadProfileImage',
  async (userId: string) => {
    try {
      const savedImage = await AsyncStorage.getItem(`profileImage_${userId}`);
      return savedImage;
    } catch (error) {
      console.log('Error loading profile image:', error);
      return null;
    }
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
    //maybe changes in storage later?
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    setProfileImage: (state, action: PayloadAction<string | null>) => {
      state.profileImage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Load Profile Image
      .addCase(loadProfileImage.fulfilled, (state, action) => {
        state.profileImage = action.payload;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
        state.profileImage = null; // Clear profile image on sign out
      });
  },
});

export const { clearError, setProfileImage } = authSlice.actions;
export default authSlice.reducer;
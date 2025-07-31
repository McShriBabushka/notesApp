import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('update authcontext error later');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Remove password from user object
        const { password, ...userWithoutPassword } = parsedUser;
        setUser(userWithoutPassword);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async (): Promise<StoredUser[]> => {
    try {
      const usersData = await AsyncStorage.getItem('registeredUsers');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  };

  const saveUsers = async (users: StoredUser[]) => {
    try {
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if user already exists
      const existingUsers = await getAllUsers();
      const userExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Validate inputs
      if (!email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (name.trim().length < 2) {
        return { success: false, error: 'Name must be at least 2 characters long' };
      }

      // Create new user
      const newUser: StoredUser = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: password, //ofc save hash later
        createdAt: new Date().toISOString(),
      };
      console.log("newUser: ", newUser);
      // Save to registered users
      const updatedUsers = [...existingUsers, newUser];
      await saveUsers(updatedUsers);

      // Set current user (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      await AsyncStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create account' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get all registered users
      const existingUsers = await getAllUsers();
      
      // Find user by email
      const foundUser = existingUsers.find(
        user => user.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!foundUser) {
        return { success: false, error: 'No account found with this email address' };
        //render error on screen
      }

      // Check password
      if (foundUser.password !== password) {
        return { success: false, error: 'Incorrect password' };
        //render error on screen
      }

      // Set current user (without password)
      const { password: _, ...userWithoutPassword } = foundUser;
      await AsyncStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
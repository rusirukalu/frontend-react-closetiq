import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '@/services/authService';
import apiClient from '@/services/apiClient';
import { auth } from '@/config/firebase';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  profile: {
    age?: number;
    gender?: string;
    stylePreferences: string[];
    bodyType?: string;
    location?: string;
    profilePicture?: string;
  };
  preferences: {
    favoriteColors: string[];
    dislikedColors: string[];
    stylePersonality?: string;
    occasionPreferences: {
      work: boolean;
      casual: boolean;
      formal: boolean;
      party: boolean;
      sport: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
  isActive: boolean;
  isEmailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLogin: string | null;
  emailVerificationSent: boolean;
  passwordResetSent: boolean;
  backendVerified: boolean; // New field to track backend verification
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLogin: null,
  emailVerificationSent: false,
  passwordResetSent: false,
  backendVerified: false,
};

// Enhanced login with backend verification
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Step 1: Authenticate with Firebase
      await authService.login(credentials);
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Step 2: Verify with backend (REQUIRED)
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If backend verification fails, logout from Firebase
        await authService.logout();
        
        if (response.status === 401) {
          throw new Error('User not found in system. Please register first.');
        } else if (response.status === 403) {
          throw new Error('Account is disabled or inactive.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error('Failed to verify user account.');
        }
      }

      const profileData = await response.json();
      
      return {
        user: profileData.data.user,
        token: token,
        refreshToken: null,
        backendVerified: true,
      };
    } catch (error: any) {
      // Ensure Firebase logout on any error
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Failed to logout from Firebase:', logoutError);
      }

      let errorMessage = 'Login failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Enhanced Google login with backend verification
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Authenticate with Firebase
      const authUser = await authService.loginWithGoogle();
      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Step 2: Try to get user from backend
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          return {
            user: profileData.data.user,
            token: token,
            refreshToken: null,
            backendVerified: true,
          };
        }
      } catch (error) {
        console.error('Error fetching profile after Google login:', error);
      }

      // Step 3: If user doesn't exist in backend, auto-register them
      try {
        const registerResponse = await apiClient.post('/api/auth/register', {
          email: authUser.email,
          username: authUser.email?.split('@')[0] || 'user',
          firebaseUid: authUser.uid,
          displayName: authUser.displayName,
        });

        if (registerResponse.data?.user) {
          return {
            user: registerResponse.data.user,
            token: token,
            refreshToken: null,
            backendVerified: true,
          };
        }
      } catch (registerError) {
        console.error('Failed to auto-register Google user:', registerError);
      }

      // Step 4: If backend registration fails, return Firebase data but mark as unverified
      const fallbackUser: User = {
        id: authUser.uid,
        email: authUser.email || '',
        username: authUser.email?.split('@')[0] || 'user',
        displayName: authUser.displayName || '',
        photoURL: authUser.photoURL || '',
        profile: {
          stylePreferences: [],
        },
        preferences: {
          favoriteColors: [],
          dislikedColors: [],
          occasionPreferences: {
            work: false,
            casual: false,
            formal: false,
            party: false,
            sport: false,
          },
        },
        subscription: {
          plan: 'free' as const,
        },
        createdAt: new Date().toISOString(),
        isActive: true,
        isEmailVerified: authUser.email ? true : false,
      };

      return {
        user: fallbackUser,
        token: token,
        refreshToken: null,
        backendVerified: false, // Mark as not verified with backend
      };
    } catch (error: any) {
      // Ensure Firebase logout on error
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Failed to logout from Firebase:', logoutError);
      }

      let errorMessage = 'Google login failed';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Login cancelled';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup blocked. Please allow popups and try again';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with this email using a different sign-in method';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Enhanced registration with backend verification
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { 
    username: string; 
    email: string; 
    password: string; 
    displayName?: string; 
  }, { rejectWithValue }) => {
    try {
      // Step 1: Create Firebase user
      const authUser = await authService.register({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        displayName: userData.displayName,
      });

      const token = await authService.getCurrentUserToken();
      
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Step 2: Register in backend (REQUIRED)
      const response = await apiClient.post('/api/auth/register', {
        email: userData.email,
        username: userData.username,
        firebaseUid: authUser.uid,
        displayName: userData.displayName,
      });

      if (!response.data?.user) {
        // If backend registration fails, delete Firebase user
        try {
          await authService.logout();
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase user:', cleanupError);
        }
        throw new Error('Failed to complete registration. Please try again.');
      }

      return {
        user: response.data.user,
        token: token,
        refreshToken: null,
        backendVerified: true,
      };
    } catch (error: any) {
      // Cleanup Firebase user on error
      try {
        await authService.logout();
      } catch (cleanupError) {
        console.error('Failed to cleanup Firebase user:', cleanupError);
      }

      let errorMessage = 'Registration failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Rest of the thunks remain the same...
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resetPassword(email);
      return 'Password reset email sent successfully';
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return rejectWithValue('No authenticated user found');
      }

      const token = await currentUser.getIdToken(true);
      localStorage.setItem('authToken', token);

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile fetch error:', response.status, errorText);
        
        if (response.status === 401) {
          return rejectWithValue('User not found in backend. Please complete registration.');
        }
        
        return rejectWithValue(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { user: data.data.user, backendVerified: true };
    } catch (error: any) {
      console.error('Profile fetch network error:', error);
      return rejectWithValue(`Network error: ${error.message}`);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Enhanced slice with backend verification
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.backendVerified = false; // Will be set by backend calls
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.backendVerified = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearPasswordResetSent: (state) => {
      state.passwordResetSent = false;
    },
    clearEmailVerificationSent: (state) => {
      state.emailVerificationSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.backendVerified = action.payload.backendVerified;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.backendVerified = false;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.backendVerified = action.payload.backendVerified;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.backendVerified = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.backendVerified = action.payload.backendVerified;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.backendVerified = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.backendVerified = false;
        state.error = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.passwordResetSent = false;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.passwordResetSent = false;
        state.error = action.payload as string;
      })
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.backendVerified = action.payload.backendVerified;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.backendVerified = false;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  clearAuth,
  clearError,
  setLoading,
  clearPasswordResetSent,
  clearEmailVerificationSent,
} = authSlice.actions;

export default authSlice.reducer;

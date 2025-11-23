// src/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import apiClient from './apiClient';

// Align with App.tsx AppUser interface
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private pendingOperations: Map<string, Promise<any>> = new Map();

  // Helper to prevent duplicate operations
  private async dedupeOperation<T>(key: string, operation: () => Promise<T>): Promise<T> {
    if (this.pendingOperations.has(key)) {
      return this.pendingOperations.get(key);
    }

    const promise = operation().finally(() => {
      this.pendingOperations.delete(key);
    });

    this.pendingOperations.set(key, promise);
    return promise;
  }

  // Check backend connectivity
  async checkBackendHealth(): Promise<boolean> {
    try {
      return await apiClient.checkHealth();
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthUser> {
    return this.dedupeOperation(`register:${data.email}`, async () => {
      try {
        // Check backend connectivity first
        const isBackendHealthy = await this.checkBackendHealth();
        if (!isBackendHealthy) {
          throw new Error('Backend service is unavailable. Please try again later.');
        }

        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const firebaseUser = userCredential.user;

        // Update profile with display name
        await updateProfile(firebaseUser, {
          displayName: data.displayName || data.username,
        });

        // Get ID token
        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem('authToken', token);

        // Register user in Node.js backend
        const response = await apiClient.post('/api/auth/register', {
          email: data.email,
          username: data.username,
          firebaseUid: firebaseUser.uid,
          displayName: data.displayName,
        });

        if (!response.success) {
          // If backend registration fails, cleanup Firebase user
          await firebaseUser.delete();
          throw new Error(response.message || 'Backend registration failed');
        }

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
        };
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Cleanup Firebase user if registration fails
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.delete();
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase user:', cleanupError);
        }
        
        throw new Error(error.message || 'Registration failed');
      }
    });
  }

  // Login user
  async login(data: LoginData): Promise<AuthUser> {
    return this.dedupeOperation(`login:${data.email}`, async () => {
      try {
        // Check backend connectivity first
        const isBackendHealthy = await this.checkBackendHealth();
        if (!isBackendHealthy) {
          throw new Error('Backend service is unavailable. Please try again later.');
        }

        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const firebaseUser = userCredential.user;

        // Store ID token
        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem('authToken', token);

        // Verify user exists in backend
        try {
          const response = await apiClient.get('/api/auth/me');
          
          if (!response.success) {
            throw new Error('User verification failed');
          }
        } catch (error: any) {
          // If backend verification fails, logout from Firebase
          await this.logout();
          
          if (error.response?.status === 401) {
            throw new Error('User not found in system. Please register first.');
          } else if (error.response?.status === 403) {
            throw new Error('Account is disabled or inactive.');
          } else {
            throw new Error('Unable to verify user account. Please try again.');
          }
        }

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
        };
      } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed');
      }
    });
  }

  // Login with Google (FIXED)
  async loginWithGoogle(): Promise<AuthUser> {
    return this.dedupeOperation('google-login', async () => {
      try {
        // Check backend connectivity first
        const isBackendHealthy = await this.checkBackendHealth();
        if (!isBackendHealthy) {
          throw new Error('Backend service is unavailable. Please try again later.');
        }

        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const userCredential = await signInWithPopup(auth, provider);
        const firebaseUser = userCredential.user;

        // Store ID token
        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem('authToken', token);

        // STEP 1: Check if user exists in backend
        let userExists = false;
        try {
          const response = await apiClient.get('/api/auth/me');
          if (response.success) {
            userExists = true;
            console.log('Google user already exists in backend');
          }
        } catch (error: any) {
          console.log('Google user not found in backend, will auto-register');
        }

        // STEP 2: If user doesn't exist, auto-register them
        if (!userExists) {
          try {
            console.log('Auto-registering Google user in backend...');
            const registerResponse = await apiClient.post('/api/auth/register', {
              email: firebaseUser.email,
              username: firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.slice(0, 8)}`,
              firebaseUid: firebaseUser.uid,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            });

            if (!registerResponse.success) {
              console.error('Backend auto-registration failed:', registerResponse.message);
              throw new Error(registerResponse.message || 'Failed to register user in backend');
            }
            
            console.log('Google user successfully registered in backend');
          } catch (registerError: any) {
            console.error('Failed to auto-register Google user:', registerError);
            
            // Logout from Firebase if backend registration fails
            await this.logout();
            throw new Error('Failed to complete Google sign-in. Please try again or contact support.');
          }
        }

        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
        };
      } catch (error: any) {
        console.error('Google login error:', error);
        
        // Cleanup on error
        try {
          await this.logout();
        } catch (logoutError) {
          console.error('Failed to cleanup after Google login error:', logoutError);
        }
        
        throw new Error(error.message || 'Google login failed');
      }
    });
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('authToken');
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force cleanup even if logout fails
      localStorage.removeItem('authToken');
      throw new Error('Logout failed');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Update password
  async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  }

  // Get current user token
  async getCurrentUserToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    try {
      return await user.getIdToken(forceRefresh);
    } catch (error: any) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Refresh current user token
  async refreshCurrentUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      localStorage.removeItem('authToken');
      return null;
    }

    try {
      const token = await user.getIdToken(true); // Force refresh
      localStorage.setItem('authToken', token);
      return token;
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('authToken');
      throw error;
    }
  }

  // Validate current authentication state
  async validateAuthState(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      // Check if backend is accessible
      const isBackendHealthy = await this.checkBackendHealth();
      if (!isBackendHealthy) {
        return false;
      }

      // Verify with backend
      await user.getIdToken(true);
      const response = await apiClient.get('/api/auth/validate');
      
      return response.success;
    } catch (error) {
      console.error('Auth state validation failed:', error);
      return false;
    }
  }

  // Setup auth state listener
  setupAuthStateListener(callback?: (user: FirebaseUser | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(false); // Don't force refresh here
          localStorage.setItem('authToken', token);
        } catch (error: any) {
          console.error('Error getting token on auth state change:', error);
          localStorage.removeItem('authToken');
        }
      } else {
        localStorage.removeItem('authToken');
      }

      // Call optional callback
      if (callback) {
        callback(user);
      }
    });

    return unsubscribe; // Return unsubscribe function for cleanup
  }
}

export default new AuthService();

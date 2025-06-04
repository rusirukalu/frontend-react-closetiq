import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/config/firebase";
import authService from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  loginWithGoogle,
  registerUser,
  logoutUser,
  fetchUserProfile,
  setUser,
  clearAuth,
  clearError,
} from "@/store/slices/authSlice";
import type { User } from "@/store/slices/authSlice";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  backendConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map Firebase user to User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    username:
      firebaseUser.email?.split("@")[0] ||
      `user_${firebaseUser.uid.slice(0, 8)}`,
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    profile: {
      age: undefined,
      gender: undefined,
      stylePreferences: [],
      bodyType: undefined,
      location: undefined,
      profilePicture: firebaseUser.photoURL || undefined,
    },
    preferences: {
      favoriteColors: [],
      dislikedColors: [],
      stylePersonality: undefined,
      occasionPreferences: {
        work: false,
        casual: true,
        formal: false,
        party: false,
        sport: false,
      },
    },
    subscription: {
      plan: "free",
      startDate: undefined,
      endDate: undefined,
    },
    createdAt: new Date().toISOString(),
    isActive: true,
    isEmailVerified: firebaseUser.emailVerified,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Throttling refs
  const lastProfileFetchRef = useRef<number>(0);
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check backend connectivity
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/health", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error("Backend connection check failed:", error);
      return false;
    }
  };

  // Throttled profile fetch
  const throttledProfileFetch = (firebaseUser: FirebaseUser) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastProfileFetchRef.current;

    // Clear existing timeout
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current);
    }

    // If less than 2 seconds since last fetch, delay this one
    if (timeSinceLastFetch < 2000) {
      profileFetchTimeoutRef.current = setTimeout(() => {
        performProfileFetch(firebaseUser);
      }, 2000 - timeSinceLastFetch);
    } else {
      performProfileFetch(firebaseUser);
    }
  };

  const performProfileFetch = async (firebaseUser: FirebaseUser) => {
    lastProfileFetchRef.current = Date.now();

    try {
      const token = await firebaseUser.getIdToken(false); // Don't force refresh
      localStorage.setItem("authToken", token);

      const result = await dispatch(fetchUserProfile()).unwrap();
      console.log("Backend profile found, user fully authenticated");
    } catch (error: any) {
      console.log("Backend profile not found, using Firebase data only");

      // Only use Firebase data if no backend profile
      const userData = mapFirebaseUserToUser(firebaseUser);
      dispatch(setUser(userData));
    }
  };

  // Firebase auth state listener with throttling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      try {
        if (firebaseUser) {
          console.log("Firebase user authenticated:", firebaseUser.email);
          setFirebaseUser(firebaseUser);

          // Check backend connectivity
          const isBackendConnected = await checkBackendConnection();
          setBackendConnected(isBackendConnected);

          if (isBackendConnected) {
            // Throttled profile fetch to prevent rate limiting
            throttledProfileFetch(firebaseUser);
          } else {
            // Backend is down, logout user to prevent inconsistent state
            console.warn("Backend is not accessible, logging out user");
            await authService.logout();
            setFirebaseUser(null);
            dispatch(clearAuth());
          }
        } else {
          console.log("No Firebase user authenticated");
          setFirebaseUser(null);
          dispatch(clearAuth());
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setFirebaseUser(null);
        dispatch(clearAuth());
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      unsubscribe();
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
    };
  }, [dispatch]);

  // Check backend connectivity periodically (reduced frequency)
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendConnection();
      setBackendConnected(isConnected);

      // If backend goes down while user is authenticated, logout
      if (!isConnected && authState.isAuthenticated) {
        console.warn("Backend connection lost, logging out user");
        await logout();
      }
    };

    const interval = setInterval(checkConnection, 60000); // Check every 60 seconds (reduced from 30)
    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const isBackendConnected = await checkBackendConnection();
      if (!isBackendConnected) {
        throw new Error(
          "Backend service is unavailable. Please try again later."
        );
      }

      await dispatch(loginUser({ email, password })).unwrap();
    } catch (error: any) {
      throw new Error(error || "Login failed");
    }
  };

  const loginWithGoogleHandler = async () => {
    try {
      const isBackendConnected = await checkBackendConnection();
      if (!isBackendConnected) {
        throw new Error(
          "Backend service is unavailable. Please try again later."
        );
      }

      await dispatch(loginWithGoogle()).unwrap();
    } catch (error: any) {
      throw new Error(error || "Google login failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ) => {
    try {
      const isBackendConnected = await checkBackendConnection();
      if (!isBackendConnected) {
        throw new Error(
          "Backend service is unavailable. Please try again later."
        );
      }

      await dispatch(
        registerUser({ email, password, username, displayName })
      ).unwrap();
    } catch (error: any) {
      throw new Error(error || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setFirebaseUser(null);
    } catch (error: any) {
      // Force logout even if it fails
      setFirebaseUser(null);
      dispatch(clearAuth());
      throw new Error(error || "Logout failed");
    }
  };

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  const contextValue: AuthContextType = {
    firebaseUser,
    user: authState.user,
    isAuthenticated: authState.isAuthenticated && backendConnected,
    isLoading: isLoading || authState.isLoading || !authInitialized,
    error: authState.error,
    backendConnected,
    login,
    loginWithGoogle: loginWithGoogleHandler,
    register,
    logout,
    clearError: clearErrorHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

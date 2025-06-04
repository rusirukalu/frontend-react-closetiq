// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  modals: {
    addItem: boolean;
    editItem: boolean;
    deleteConfirm: boolean;
    settings: boolean;
    profile: boolean;
  };
  viewMode: {
    wardrobe: 'grid' | 'list';
    recommendations: 'card' | 'detailed';
  };
  preferences: {
    autoSave: boolean;
    showTutorials: boolean;
    compactMode: boolean;
    animationsEnabled: boolean;
  };
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system',
  sidebarOpen: window.innerWidth > 768,
  mobileMenuOpen: false,
  loading: {
    global: false,
    components: {},
  },
  notifications: [],
  modals: {
    addItem: false,
    editItem: false,
    deleteConfirm: false,
    settings: false,
    profile: false,
  },
  viewMode: {
    wardrobe: (localStorage.getItem('wardrobeViewMode') as 'grid' | 'list') || 'grid',
    recommendations: (localStorage.getItem('recommendationsViewMode') as 'card' | 'detailed') || 'card',
  },
  preferences: {
    autoSave: localStorage.getItem('autoSave') !== 'false',
    showTutorials: localStorage.getItem('showTutorials') !== 'false',
    compactMode: localStorage.getItem('compactMode') === 'true',
    animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
  },
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    // Navigation
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Loading States
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action: PayloadAction<{ component: string; loading: boolean }>) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },
    clearComponentLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.components[action.payload];
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      title: string;
      message: string;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // View Modes
    setWardrobeViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode.wardrobe = action.payload;
      localStorage.setItem('wardrobeViewMode', action.payload);
    },
    setRecommendationsViewMode: (state, action: PayloadAction<'card' | 'detailed'>) => {
      state.viewMode.recommendations = action.payload;
      localStorage.setItem('recommendationsViewMode', action.payload);
    },
    
    // Preferences
    setPreference: (state, action: PayloadAction<{
      key: keyof UIState['preferences'];
      value: boolean;
    }>) => {
      state.preferences[action.payload.key] = action.payload.value;
      localStorage.setItem(action.payload.key, action.payload.value.toString());
    },
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // Save to localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });
    },
    
    // Utility Actions
    resetUI: (state) => {
      state.sidebarOpen = window.innerWidth > 768;
      state.mobileMenuOpen = false;
      state.loading = { global: false, components: {} };
      state.modals = {
        addItem: false,
        editItem: false,
        deleteConfirm: false,
        settings: false,
        profile: false,
      };
    },
  },
});

export const {
  // Theme
  setTheme,
  
  // Navigation
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Loading
  setGlobalLoading,
  setComponentLoading,
  clearComponentLoading,
  
  // Notifications
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // View Modes
  setWardrobeViewMode,
  setRecommendationsViewMode,
  
  // Preferences
  setPreference,
  updatePreferences,
  
  // Utility
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

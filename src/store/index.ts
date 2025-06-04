// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import slices
import authSlice from '../store/slices/authSlice';
import wardrobeSlice from '../store/slices/wardrobeSlice';
import clothingSlice from '../store/slices/clothingSlice';
import recommendationSlice from '../store/slices/recommendationSlice';
import chatSlice from '../store/slices/chatSlice';
import uiSlice from '../store/slices/uiSlice';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    wardrobe: wardrobeSlice,
    clothing: clothingSlice,
    recommendations: recommendationSlice,
    chat: chatSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore Firebase user objects in serializable check
        ignoredPaths: ['auth.user', 'auth.firebaseUser'],
      },
    }),
  // Fix: Use import.meta.env instead of process.env for Vite
  devTools: import.meta.env.DEV,
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export individual slice actions for convenience
export { 
  loginUser, 
  loginWithGoogle,
  registerUser, 
  logoutUser, 
  fetchUserProfile, 
  updateUserProfile,
  setUser,
  clearAuth,
  clearError
} from '../store/slices/authSlice';

export { 
  fetchWardrobes, 
  createWardrobe, 
  updateWardrobe, 
  deleteWardrobe,
  setCurrentWardrobe 
} from '../store/slices/wardrobeSlice';

export { 
  fetchClothingItems, 
  createClothingItem, 
  updateClothingItem, 
  deleteClothingItem,
  classifyAndAddItem,
  toggleFavorite,
  setFilters,
  clearFilters 
} from '../store/slices/clothingSlice';

export { 
  generateOutfitRecommendations, 
  saveOutfit, 
  fetchSavedOutfits,
  getSimilarItems,
  checkStyleCompatibility 
} from '../store/slices/recommendationSlice';

export { 
  fetchChatSessions, 
  createChatSession, 
  sendMessage, 
  setCurrentSession 
} from '../store/slices/chatSlice';

export { 
  setTheme, 
  toggleSidebar, 
  addNotification, 
  openModal, 
  closeModal,
  setWardrobeViewMode 
} from '../store/slices/uiSlice';

export default store;

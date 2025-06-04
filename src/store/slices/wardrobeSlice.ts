// src/store/slices/wardrobeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Wardrobe {
  _id: string;  // Changed from id to _id for MongoDB compatibility
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  items: string[]; // Array of clothing item IDs
  createdAt: string;
  updatedAt: string;
}

export interface WardrobeState {
  wardrobes: Wardrobe[];
  currentWardrobe: Wardrobe | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WardrobeState = {
  wardrobes: [],
  currentWardrobe: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchWardrobes = createAsyncThunk(
  'wardrobe/fetchWardrobes',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/wardrobes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch wardrobes');
      }

      const data = await response.json();
      
      // Smart extraction logic to find wardrobes in various response structures
      let wardrobes: Wardrobe[] = [];
      
      if (Array.isArray(data.data?.wardrobes)) {
        wardrobes = data.data.wardrobes;
      } else if (Array.isArray(data.data?.data)) {
        wardrobes = data.data.data;
      } else if (Array.isArray(data.wardrobes)) {
        wardrobes = data.wardrobes;
      } else if (Array.isArray(data.data)) {
        wardrobes = data.data;
      } else if (Array.isArray(data)) {
        wardrobes = data;
      } else if (Array.isArray(data.data?.items)) {
        wardrobes = data.data.items;
      } else if (Array.isArray(data.items)) {
        wardrobes = data.items;
      } else if (Array.isArray(data.results)) {
        wardrobes = data.results;
      } else if (Array.isArray(data.data?.results)) {
        wardrobes = data.data.results;
      } else {
        wardrobes = [];
      }
      
      return wardrobes;
      
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const createWardrobe = createAsyncThunk(
  'wardrobe/createWardrobe',
  async (wardrobeData: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/wardrobes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wardrobeData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create wardrobe');
      }

      const data = await response.json();
      
      // Extract the created wardrobe from various possible response structures
      let wardrobe = null;
      if (data.data?.wardrobe) {
        wardrobe = data.data.wardrobe;
      } else if (data.data) {
        wardrobe = data.data;
      } else if (data.wardrobe) {
        wardrobe = data.wardrobe;
      } else {
        wardrobe = data;
      }
      
      return wardrobe;
      
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateWardrobe = createAsyncThunk(
  'wardrobe/updateWardrobe',
  async ({ _id, ...wardrobeData }: { _id: string; name?: string; description?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/wardrobes/${_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wardrobeData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update wardrobe');
      }

      const data = await response.json();
      const wardrobe = data.data?.wardrobe || data.data || data.wardrobe || data;
      
      return wardrobe;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const deleteWardrobe = createAsyncThunk(
  'wardrobe/deleteWardrobe',
  async (_id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/wardrobes/${_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete wardrobe');
      }

      return _id;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Slice
const wardrobeSlice = createSlice({
  name: 'wardrobe',
  initialState,
  reducers: {
    setCurrentWardrobe: (state, action: PayloadAction<Wardrobe | null>) => {
      state.currentWardrobe = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addItemToWardrobe: (state, action: PayloadAction<{ wardrobeId: string; itemId: string }>) => {
      if (!Array.isArray(state.wardrobes)) {
        state.wardrobes = [];
      }
      const wardrobe = state.wardrobes.find(w => w._id === action.payload.wardrobeId);
      if (wardrobe && !wardrobe.items.includes(action.payload.itemId)) {
        wardrobe.items.push(action.payload.itemId);
      }
    },
    removeItemFromWardrobe: (state, action: PayloadAction<{ wardrobeId: string; itemId: string }>) => {
      if (!Array.isArray(state.wardrobes)) {
        state.wardrobes = [];
      }
      const wardrobe = state.wardrobes.find(w => w._id === action.payload.wardrobeId);
      if (wardrobe) {
        wardrobe.items = wardrobe.items.filter(id => id !== action.payload.itemId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wardrobes
      .addCase(fetchWardrobes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWardrobes.fulfilled, (state, action) => {
        state.isLoading = false;
        const wardrobes = Array.isArray(action.payload) ? action.payload : [];
        state.wardrobes = wardrobes;
        
        // Set default wardrobe as current if none selected
        if (!state.currentWardrobe && wardrobes.length > 0) {
          const defaultWardrobe = wardrobes.find(w => w.isDefault) || wardrobes[0];
          state.currentWardrobe = defaultWardrobe;
        }
      })
      .addCase(fetchWardrobes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (!Array.isArray(state.wardrobes)) {
          state.wardrobes = [];
        }
      })
      // Create Wardrobe
      .addCase(createWardrobe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWardrobe.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.wardrobes)) {
          state.wardrobes = [];
        }
        
        if (action.payload && typeof action.payload === 'object' && action.payload._id) {
          state.wardrobes.push(action.payload as Wardrobe);
        }
      })
      .addCase(createWardrobe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Wardrobe
      .addCase(updateWardrobe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWardrobe.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.wardrobes)) {
          state.wardrobes = [];
        }
        
        const index = state.wardrobes.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.wardrobes[index] = action.payload;
        }
        
        if (state.currentWardrobe?._id === action.payload._id) {
          state.currentWardrobe = action.payload;
        }
      })
      .addCase(updateWardrobe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Wardrobe
      .addCase(deleteWardrobe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWardrobe.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.wardrobes)) {
          state.wardrobes = [];
        }
        
        state.wardrobes = state.wardrobes.filter(w => w._id !== action.payload);
        
        if (state.currentWardrobe?._id === action.payload) {
          const newCurrent = state.wardrobes.find(w => w.isDefault) || state.wardrobes[0] || null;
          state.currentWardrobe = newCurrent;
        }
      })
      .addCase(deleteWardrobe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setCurrentWardrobe, 
  clearError, 
  addItemToWardrobe, 
  removeItemFromWardrobe 
} = wardrobeSlice.actions;

export default wardrobeSlice.reducer;

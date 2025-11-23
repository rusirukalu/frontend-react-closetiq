import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import aiService from '@/services/aiService';

// Types
export interface ClothingItem {
  id: string;
  userId: string;
  wardrobeId: string;
  name: string;
  category: string;
  brand?: string;
  color: string;
  size?: string;
  price?: number;
  purchaseDate?: string;
  imageUrl?: string;
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWorn?: string;
  createdAt: string;
  updatedAt: string;
  confidence?: number;
  aiClassified?: boolean;
}

export interface ClothingFilters {
  category?: string;
  color?: string;
  brand?: string;
  tags?: string[];
  isFavorite?: boolean;
  searchTerm?: string;
}

export interface ClothingState {
  items: ClothingItem[];
  filteredItems: ClothingItem[];
  filters: ClothingFilters;
  isLoading: boolean;
  isClassifying: boolean;
  error: string | null;
  classificationResult: any | null;
  similarItems: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: ClothingState = {
  items: [],
  filteredItems: [],
  filters: {},
  isLoading: false,
  isClassifying: false,
  error: null,
  classificationResult: null,
  similarItems: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Async Thunks
export const fetchClothingItems = createAsyncThunk(
  'clothing/fetchClothingItems',
  async (params: { wardrobeId?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();
      
      if (params.wardrobeId) queryParams.append('wardrobeId', params.wardrobeId);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/clothing?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch clothing items');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const classifyAndAddItem = createAsyncThunk(
  'clothing/classifyAndAddItem',
  async ({ file, wardrobeId }: { file: File; wardrobeId: string }, { rejectWithValue, getState }) => {
    try {
      // Use external AI service
      const classificationResult = await aiService.classifyImage(file);
      
      // Extract classification data with fallbacks
      const classification = classificationResult.classification || classificationResult;
      const attributes = (classificationResult.attributes || {}) as any;

      
      // Prepare item data based on AI classification
      const itemData = {
        wardrobeId,
        name: `${(classification.predicted_class || 'Unknown Item').replace('_', ' ')} Item`,
        category: classification.predicted_class || 'general',
        confidence: classification.confidence || 0,
        color: attributes?.color || 'unknown',
        style: attributes?.style || 'casual',
        material: attributes?.material || 'unknown',
        tags: [
          'ai-classified', 
          `confidence-${Math.round((classification.confidence || 0) * 100)}`,
          ...(attributes?.tags || [])
        ],
        notes: `AI classified with ${((classification.confidence || 0) * 100).toFixed(1)}% confidence`,
        isFavorite: false,
        timesWorn: 0,
        aiClassified: true,
      };

      // Get auth token from state
      const state = getState() as any;
      const token = state.auth.token;

      // Add to wardrobe via Node.js backend
      const addResponse = await fetch('/api/clothing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });

      if (!addResponse.ok) {
        const error = await addResponse.json();
        return rejectWithValue(error.message || 'Failed to add item');
      }

      const addData = await addResponse.json();
      return {
        ...addData.data,
        classificationResult
      };
    } catch (error) {
      console.error('Classification error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Classification failed');
    }
  }
);

export const classifyImageOnly = createAsyncThunk(
  'clothing/classifyImageOnly',
  async (file: File, { rejectWithValue }) => {
    try {
      const result = await aiService.classifyImage(file);
      return result; // Rely on attributes included in classifyImage response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Classification failed');
    }
  }
);

export const findSimilarClothingItems = createAsyncThunk(
  'clothing/findSimilarItems',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const result = await aiService.findSimilarItems(itemId, 5);
      return result.results || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to find similar items');
    }
  }
);

export const createClothingItem = createAsyncThunk(
  'clothing/createClothingItem',
  async (itemData: Partial<ClothingItem> | FormData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const isFormData = itemData instanceof FormData;
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      // Only set Content-Type for JSON, let browser set it for FormData
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/clothing', {
        method: 'POST',
        headers,
        body: isFormData ? itemData : JSON.stringify(itemData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create item');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateClothingItem = createAsyncThunk(
  'clothing/updateClothingItem',
  async ({ id, ...itemData }: { id: string } & Partial<ClothingItem>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/clothing/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update item');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const deleteClothingItem = createAsyncThunk(
  'clothing/deleteClothingItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/clothing/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete item');
      }

      return id;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'clothing/toggleFavorite',
  async ({ id, isFavorite }: { id: string; isFavorite: boolean }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/clothing/${id}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorite }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update favorite');
      }

      return { id, isFavorite };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Helper function to filter items
const applyFilters = (items: ClothingItem[], filters: ClothingFilters): ClothingItem[] => {
  return items.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.color && item.color !== filters.color) return false;
    if (filters.brand && item.brand !== filters.brand) return false;
    if (filters.isFavorite !== undefined && item.isFavorite !== filters.isFavorite) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => item.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        item.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });
};

// Slice
const clothingSlice = createSlice({
  name: 'clothing',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ClothingFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredItems = applyFilters(state.items, state.filters);
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredItems = state.items;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearClassificationResult: (state) => {
      state.classificationResult = null;
      state.similarItems = [];
    },
    incrementTimesWorn: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload);
      if (item) {
        item.timesWorn += 1;
        item.lastWorn = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Items
      .addCase(fetchClothingItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClothingItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.items = action.payload.items;
        } else {
          state.items.push(...action.payload.items);
        }
        state.filteredItems = applyFilters(state.items, state.filters);
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchClothingItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Classify Image Only
      .addCase(classifyImageOnly.pending, (state) => {
        state.isClassifying = true;
        state.error = null;
        state.classificationResult = null;
      })
      .addCase(classifyImageOnly.fulfilled, (state, action) => {
        state.isClassifying = false;
        state.classificationResult = action.payload;
      })
      .addCase(classifyImageOnly.rejected, (state, action) => {
        state.isClassifying = false;
        state.error = action.payload as string;
      })
      // Classify and Add Item
      .addCase(classifyAndAddItem.pending, (state) => {
        state.isClassifying = true;
        state.error = null;
      })
      .addCase(classifyAndAddItem.fulfilled, (state, action) => {
        state.isClassifying = false;
        state.items.unshift(action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
        state.classificationResult = action.payload.classificationResult;
      })
      .addCase(classifyAndAddItem.rejected, (state, action) => {
        state.isClassifying = false;
        state.error = action.payload as string;
      })
      // Find Similar Items
      .addCase(findSimilarClothingItems.fulfilled, (state, action) => {
        state.similarItems = action.payload;
      })
      .addCase(findSimilarClothingItems.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Create Item
      .addCase(createClothingItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
      })
      .addCase(createClothingItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update Item
      .addCase(updateClothingItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.filteredItems = applyFilters(state.items, state.filters);
        }
      })
      .addCase(updateClothingItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete Item
      .addCase(deleteClothingItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.filteredItems = applyFilters(state.items, state.filters);
      })
      .addCase(deleteClothingItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const item = state.items.find(item => item.id === action.payload.id);
        if (item) {
          item.isFavorite = action.payload.isFavorite;
          state.filteredItems = applyFilters(state.items, state.filters);
        }
      });
  },
});

export const { 
  setFilters, 
  clearFilters, 
  clearError, 
  clearClassificationResult,
  incrementTimesWorn 
} = clothingSlice.actions;
export default clothingSlice.reducer;
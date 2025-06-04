// src/store/slices/recommendationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface OutfitRecommendation {
  id: string;
  name: string;
  items: string[]; // Array of clothing item IDs
  occasion: string;
  season: string;
  score: number;
  explanation: string[];
  tags: string[];
  weatherContext?: {
    temperature: number;
    condition: string;
  };
  createdAt: string;
}

export interface RecommendationState {
  outfits: OutfitRecommendation[];
  isGenerating: boolean;
  lastGeneratedFor: {
    occasion?: string;
    season?: string;
    timestamp?: string;
  };
  savedOutfits: OutfitRecommendation[];
  error: string | null;
}

const initialState: RecommendationState = {
  outfits: [],
  isGenerating: false,
  lastGeneratedFor: {},
  savedOutfits: [],
  error: null,
};

// Async Thunks
export const generateOutfitRecommendations = createAsyncThunk(
  'recommendations/generateOutfits',
  async (params: {
    occasion: string;
    season?: string;
    weatherContext?: any;
    wardrobeItems?: string[];
    count?: number;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          occasion: params.occasion,
          season: params.season || 'spring',
          weather_context: params.weatherContext,
          items: params.wardrobeItems || [],
          count: params.count || 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to generate recommendations');
      }

      const data = await response.json();
      return {
        outfits: data.recommendations.outfits,
        generatedFor: {
          occasion: params.occasion,
          season: params.season,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const getSimilarItems = createAsyncThunk(
  'recommendations/getSimilarItems',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/ai/similarity/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: itemId,
          top_k: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to find similar items');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const checkStyleCompatibility = createAsyncThunk(
  'recommendations/checkCompatibility',
  async ({ item1Id, item2Id, context }: { item1Id: string; item2Id: string; context?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/compatibility/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item1_id: item1Id,
          item2_id: item2Id,
          context: context || 'general',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to check compatibility');
      }

      const data = await response.json();
      return data.compatibility;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const saveOutfit = createAsyncThunk(
  'recommendations/saveOutfit',
  async (outfit: OutfitRecommendation, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: outfit.name,
          items: outfit.items,
          occasion: outfit.occasion,
          tags: outfit.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to save outfit');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchSavedOutfits = createAsyncThunk(
  'recommendations/fetchSavedOutfits',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/outfits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch saved outfits');
      }

      const data = await response.json();
      return data.data.outfits;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Slice
const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.outfits = [];
      state.lastGeneratedFor = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    updateOutfitRating: (state, action: PayloadAction<{ id: string; rating: number }>) => {
      const outfit = state.outfits.find(o => o.id === action.payload.id);
      if (outfit) {
        outfit.score = action.payload.rating;
      }
    },
    removeOutfit: (state, action: PayloadAction<string>) => {
      state.outfits = state.outfits.filter(o => o.id !== action.payload);
      state.savedOutfits = state.savedOutfits.filter(o => o.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Recommendations
      .addCase(generateOutfitRecommendations.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateOutfitRecommendations.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.outfits = action.payload.outfits;
        state.lastGeneratedFor = action.payload.generatedFor;
        state.error = null;
      })
      .addCase(generateOutfitRecommendations.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      })
      // Save Outfit
      .addCase(saveOutfit.fulfilled, (state, action) => {
        state.savedOutfits.push(action.payload);
      })
      .addCase(saveOutfit.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Saved Outfits
      .addCase(fetchSavedOutfits.fulfilled, (state, action) => {
        state.savedOutfits = action.payload;
      })
      .addCase(fetchSavedOutfits.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearRecommendations, 
  clearError, 
  updateOutfitRating, 
  removeOutfit 
} = recommendationSlice.actions;
export default recommendationSlice.reducer;

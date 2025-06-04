// src/store/slices/chatSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  sessionType: 'general' | 'style_advice' | 'outfit_help';
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: string;
  lastMessageAt: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isSendingMessage: boolean;
  error: string | null;
}

const initialState: ChatState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  isSendingMessage: false,
  error: null,
};

// Async Thunks
export const fetchChatSessions = createAsyncThunk(
  'chat/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch chat sessions');
      }

      const data = await response.json();
      return data.data.sessions;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const createChatSession = createAsyncThunk(
  'chat/createSession',
  async ({ title, sessionType }: { title?: string; sessionType?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || 'New Chat',
          sessionType: sessionType || 'general',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create chat session');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sessionId, content, sessionType }: { sessionId: string; content: string; sessionType?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          sessionType: sessionType || 'general',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to send message');
      }

      const data = await response.json();
      return {
        sessionId,
        userMessage: {
          id: Date.now().toString(),
          role: 'user' as const,
          content: data.data.userMessage,
          timestamp: new Date().toISOString(),
        },
        aiMessage: {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.data.aiResponse,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/sessions/${sessionId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch chat history');
      }

      const data = await response.json();
      return {
        sessionId,
        messages: data.data.messages,
      };
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete chat session');
      }

      return sessionId;
    } catch (error) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<ChatSession | null>) => {
      state.currentSession = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.messages.push(action.payload.message);
        session.lastMessageAt = action.payload.message.timestamp;
      }
      if (state.currentSession?.id === action.payload.sessionId) {
        state.currentSession.messages.push(action.payload.message);
        state.currentSession.lastMessageAt = action.payload.message.timestamp;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSessionTitle: (state, action: PayloadAction<{ sessionId: string; title: string }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.title = action.payload.title;
      }
      if (state.currentSession?.id === action.payload.sessionId) {
        state.currentSession.title = action.payload.title;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchChatSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Session
      .addCase(createChatSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
      })
      .addCase(createChatSession.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false;
        const { sessionId, userMessage, aiMessage } = action.payload;
        
        const session = state.sessions.find(s => s.id === sessionId);
        if (session) {
          session.messages.push(userMessage, aiMessage);
          session.lastMessageAt = aiMessage.timestamp;
        }
        
        if (state.currentSession?.id === sessionId) {
          state.currentSession.messages.push(userMessage, aiMessage);
          state.currentSession.lastMessageAt = aiMessage.timestamp;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload as string;
      })
      // Fetch History
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { sessionId, messages } = action.payload;
        const session = state.sessions.find(s => s.id === sessionId);
        if (session) {
          session.messages = messages;
        }
        if (state.currentSession?.id === sessionId) {
          state.currentSession.messages = messages;
        }
      })
      // Delete Session
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
        if (state.currentSession?.id === action.payload) {
          state.currentSession = null;
        }
      })
      .addCase(deleteChatSession.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  setCurrentSession, 
  addMessage, 
  clearError, 
  updateSessionTitle 
} = chatSlice.actions;
export default chatSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import { Message, InsertMessage } from '@shared/schema';

interface MessagesState {
  messages: Message[];
  currentMessage: Message | null;
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: [],
  currentMessage: null,
  loading: false,
  error: null,
};

export const fetchMessages = createAsyncThunk(
  'messages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/messages', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const createMessage = createAsyncThunk(
  'messages/create',
  async (message: InsertMessage, { rejectWithValue }) => {
    try {
      const response = await apiRequest('POST', '/api/messages', message);
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const updateMessage = createAsyncThunk(
  'messages/update',
  async ({ id, message }: { id: number; message: Partial<InsertMessage> }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('PATCH', `/api/messages/${id}`, message);
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiRequest('DELETE', `/api/messages/${id}`);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setCurrentMessage: (state, action: PayloadAction<Message | null>) => {
      state.currentMessage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.messages.push(action.payload);
        state.loading = false;
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        const index = state.messages.findIndex((message) => message.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action: PayloadAction<number>) => {
        state.messages = state.messages.filter((message) => message.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentMessage, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;

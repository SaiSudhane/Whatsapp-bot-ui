import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/queryClient';
import { User, Reply } from '@shared/schema';

interface UsersState {
  users: User[];
  selectedUsers: number[];
  userReplies: Reply[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUsers: [],
  userReplies: [],
  currentUser: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
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

export const fetchUserReplies = createAsyncThunk(
  'users/fetchReplies',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/replies`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user replies');
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

export const deleteUsers = createAsyncThunk(
  'users/delete',
  async (userIds: number[], { rejectWithValue }) => {
    try {
      await apiRequest('DELETE', '/api/users', { userIds });
      return userIds;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const sendPromo = createAsyncThunk(
  'users/sendPromo',
  async ({ userIds, contentId }: { userIds: number[]; contentId: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest('POST', '/api/send-promo', { userIds, contentId });
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

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<number>) => {
      if (!state.selectedUsers.includes(action.payload)) {
        state.selectedUsers.push(action.payload);
      }
    },
    deselectUser: (state, action: PayloadAction<number>) => {
      state.selectedUsers = state.selectedUsers.filter((id) => id !== action.payload);
    },
    setSelectedUsers: (state, action: PayloadAction<number[]>) => {
      state.selectedUsers = action.payload;
    },
    clearSelectedUsers: (state) => {
      state.selectedUsers = [];
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserReplies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReplies.fulfilled, (state, action: PayloadAction<Reply[]>) => {
        state.userReplies = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserReplies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUsers.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.users = state.users.filter((user) => !action.payload.includes(user.id));
        state.selectedUsers = state.selectedUsers.filter((id) => !action.payload.includes(id));
        state.loading = false;
      })
      .addCase(deleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPromo.fulfilled, (state) => {
        state.loading = false;
        state.selectedUsers = [];
      })
      .addCase(sendPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  selectUser,
  deselectUser,
  setSelectedUsers,
  clearSelectedUsers,
  setCurrentUser,
  clearError,
} = usersSlice.actions;

export default usersSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  username: string;
  email: string;
  google_avatar?: string;
  profile: {
    displayName: string;
    bio?: string;
    location?: string;
  };
  preferences: {
    defaultVisibility: 'public' | 'private' | 'friends-only';
    notifications: boolean;
  };
  trade_rating: {
    score: number;
    totalTrades: number;
    completedTrades: number;
  };
  subscription: {
    tier: 'free' | 'premium';
    expiresAt?: string;
  };
  created_at: string;
  last_active_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const API_BASE_URL = 'https://attic-pyhryhudn-will-regelmanns-projects.vercel.app';

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleToken: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ google_token: googleToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      if (data.success) {
        await AsyncStorage.setItem('attic_token', data.token);
        return { user: data.user, token: data.token };
      }

      return rejectWithValue('Login failed');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token || (await AsyncStorage.getItem('attic_token'));

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('attic_token');
        }
        return rejectWithValue(data.message || 'Failed to get user');
      }

      return { user: data.user, token };
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;

      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      await AsyncStorage.removeItem('attic_token');
      return null;
    } catch (error) {
      await AsyncStorage.removeItem('attic_token');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
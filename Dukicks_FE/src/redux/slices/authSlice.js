import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Errore durante il login');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || 'Errore durante la registrazione'
      );
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  // eslint-disable-next-line no-unused-vars
  async (_, { dispatch }) => {
    if (authService.isAuthenticated()) {
      try {
        const response = await authService.getProfile();
        return {
          user: response.data,
          token: localStorage.getItem('token'),
        };
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        authService.logout();
        return null;
      }
    }
    return null;
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled with:', action.payload);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || {};
        state.token = action.payload.token;

        // Debug
        console.log('Updated auth state:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          hasToken: !!state.token,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;

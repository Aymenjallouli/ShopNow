import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      // Retourner directement l'objet d'erreur pour un meilleur traitement
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Échec de connexion. Veuillez vérifier votre email et mot de passe.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
      // Retourner directement l'objet d'erreur pour un meilleur traitement dans le composant
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue('Échec de l\'inscription. Veuillez vérifier vos informations et réessayer.');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user data');
    }
  }
);

// Alias for fetchCurrentUser to maintain compatibility
export const getUserProfile = fetchCurrentUser;

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response;
    } catch (error) {
      // Handle detailed validation errors from DRF
      if (error.response?.data) {
        // If it's an object with field-specific errors
        if (typeof error.response.data === 'object') {
          const errorMessage = Object.entries(error.response.data)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          return rejectWithValue(errorMessage);
        }
        // If it's a string or has a detail field
        return rejectWithValue(error.response.data.detail || error.response.data);
      }
      return rejectWithValue('Failed to update profile. Please check your information and try again.');
    }
  }
);

// Alias for updateProfile to maintain compatibility
export const updateUserProfile = updateProfile;

// Check if user is already logged in (has token)
const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');

const initialState = {
  user: null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Remove tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    },
    sessionExpired: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = 'Your session has expired. Please login again.';
      // Remove tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        // Save tokens to localStorage
        localStorage.setItem('token', action.payload.access);
        localStorage.setItem('refreshToken', action.payload.refresh);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        // Don't authenticate user yet, they need to login after registration
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
  state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
        // If token is invalid, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;

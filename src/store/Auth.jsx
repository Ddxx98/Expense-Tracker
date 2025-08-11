// src/store/Auth.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY = "AIzaSyCN82e4ls26Z0UrYCNkCoV3bjgs1f_Xpj8";
const AUTH_BASE_URL = `https://identitytoolkit.googleapis.com/v1/accounts`;

// Get initial auth state from localStorage
const tokenStored = localStorage.getItem("token");
const userIdStored = localStorage.getItem("userId");
const isVerifiedStored = localStorage.getItem("isVerified") === "true";

const initialAuth = {
  isAuthenticated: !!tokenStored,
  userId: userIdStored,
  token: tokenStored,
  isVerified: isVerifiedStored,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 1. Login request
      const loginResponse = await axios.post(
        `${AUTH_BASE_URL}:signInWithPassword?key=${API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );
      
      // 2. Get verification status in the same flow
      const verifyResponse = await axios.post(
        `${AUTH_BASE_URL}:lookup?key=${API_KEY}`,
        { idToken: loginResponse.data.idToken }
      );
      
      const userData = verifyResponse.data.users?.[0];
      const isVerified = userData?.emailVerified || false;
      
      // Return both login data and verification status
      return {
        ...loginResponse.data,
        isVerified
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Login failed");
    }
  }
);

export const signupAsync = createAsyncThunk(
  "auth/signup",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}:signUp?key=${API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Signup failed");
    }
  }
);

export const sendPasswordResetEmailAsync = createAsyncThunk(
  "auth/sendPasswordResetEmail",
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(
        `${AUTH_BASE_URL}:sendOobCode?key=${API_KEY}`,
        {
          email,
          requestType: "PASSWORD_RESET"
        }
      );
      return "Password reset email sent";
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to send password reset email");
    }
  }
);

export const verifyEmailAsync = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}:lookup?key=${API_KEY}`,
        { idToken: token }
      );
      const userData = response.data.users?.[0];
      if (!userData) {
        throw new Error("No user data found");
      }
      return { isVerified: userData.emailVerified };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to verify email");
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async ({ displayName, photoURL, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${AUTH_BASE_URL}:update?key=${API_KEY}`,
        {
          idToken: token,
          displayName,
          photoUrl: photoURL,
          returnSecureToken: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to update profile");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuth,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.error = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.token = null;
      state.isVerified = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("isVerified");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userId = action.payload.localId;
        state.token = action.payload.idToken;
        state.isVerified = action.payload.isVerified;
        // Store in localStorage
        localStorage.setItem("token", action.payload.idToken);
        localStorage.setItem("userId", action.payload.localId);
        localStorage.setItem("isVerified", action.payload.isVerified.toString());
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.userId = action.payload.localId;
        state.token = action.payload.idToken;
        // Store in localStorage
        localStorage.setItem("token", action.payload.idToken);
        localStorage.setItem("userId", action.payload.localId);
        localStorage.setItem("isVerified", "false");
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Password reset
      .addCase(sendPasswordResetEmailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordResetEmailAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendPasswordResetEmailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Email verification
      .addCase(verifyEmailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = action.payload.isVerified;
        localStorage.setItem("isVerified", action.payload.isVerified.toString());
      })
      .addCase(verifyEmailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile update
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state) => {
        state.loading = false;
        // Update the user info in state if needed
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { login, logout, clearError } = authSlice.actions;

export default authSlice.reducer;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'player' | 'manager' | 'admin';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'player' | 'manager';
  }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        const { accessToken } = get();
        if (accessToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password
          });

          const { user, accessToken, refreshToken } = response.data.data;
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/register', userData);

          const { user, accessToken, refreshToken } = response.data.data;
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Update axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          });
        } catch (error) {
          get().logout();
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put('/api/users/profile', userData);
          const { user } = response.data.data;
          
          set({
            user,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Set up axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshAccessToken();
        const { accessToken } = useAuthStore.getState();
        
        if (accessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize axios header on app start
const { accessToken } = useAuthStore.getState();
if (accessToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}
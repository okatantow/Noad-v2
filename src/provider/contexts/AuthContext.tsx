
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AxiosError } from 'axios';
import { api } from '../../services/api';

// Define types for our authentication state with permissions
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  role_permissions?: string[]; // Add permissions array
  user_type?: string;
  status?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  permissions: string[]; // Add permissions to state
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean; // Add permission check method
  hasAnyPermission: (permissions: string[]) => boolean; // Check any of multiple permissions
  hasAllPermissions: (permissions: string[]) => boolean; // Check all permissions
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INITIALIZED' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PERMISSIONS'; payload: string[] }; // New action for permissions

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        error: null, 
        isAuthenticated: true,
        user: action.payload,
        permissions: action.payload.role_permissions || [], // Set permissions from user
        initialized: true,
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false,
        user: null,
        permissions: [], // Clear permissions on failure
        initialized: true,
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false,
        user: null,
        permissions: [], // Clear permissions on logout
        error: null,
        initialized: true,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'INITIALIZED':
      return { ...state, initialized: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  initialized: false,
  permissions: [], // Initialize permissions array
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authCheckAttempted = useRef(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (authCheckAttempted.current || state.initialized) return;
    
    authCheckAttempted.current = true;

    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await api.get('/user-profile'); 
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: response.data 
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ERR_NETWORK' || 
            (axiosError.response && axiosError.response.status === 0)) {
          dispatch({ type: 'SET_ERROR', payload: 'CORS error: Cannot connect to server' });
        } else if (axiosError.response?.status === 401) {
          // Not authenticated, which is fine
        } else {
          console.error('Auth check error:', error);
        }
        
        dispatch({ type: 'INITIALIZED' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, [state.initialized]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await api.post('/login', credentials);

      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: response.data.user 
      });
      
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => state.permissions.includes(permission));
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


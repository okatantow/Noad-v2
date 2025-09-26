// src/services/api.ts
import axios from 'axios';
import type { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { baseURL } from '../utils/env';
import { store } from '../provider/redux/store';
import { toggleToaster } from '../provider/features/helperSlice';

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: baseURL || 'http://localhost:8000',
    withCredentials: true,
  });

  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Don't handle 401 if we're already on the login page
      const isLoginPage = window.location.pathname === '/login';
      
      if (error.response?.status === 401 && !isLoginPage) {
        console.log('401 Unauthorized detected - redirecting to login');
        
        // Dispatch toaster notification
        store.dispatch(toggleToaster({
          isOpen: true,
          toasterData: { type: "error", msg: "Session Expired / Unauthorized" },
        }));
        
        // Redirect to login page after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/login';
        }, 4500);
      }
      
      // If it's a 401 on login page, just reject normally
      return Promise.reject(error);
    }
  );

  return api;
};

// Create and export the api instance
export const api = createApiInstance();
export const createApi = () => createApiInstance();
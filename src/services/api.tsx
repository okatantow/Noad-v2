// src/services/api.ts
import axios from 'axios';
import type { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { baseURL } from '../utils/env';

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: baseURL || 'http://localhost:8000',
    withCredentials: true,
  });

  // Request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // You can add auth tokens or other headers here if needed
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
      // Handle errors globally
      return Promise.reject(error);
    }
  );

  return api;
};

// Create and export the api instance
export const api = createApiInstance();

// Optional: Export a function to create new instances if needed
export const createApi = () => createApiInstance();
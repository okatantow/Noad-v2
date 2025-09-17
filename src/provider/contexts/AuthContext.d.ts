import { AxiosInstance } from 'axios';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  // Add other user properties as needed
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  api: AxiosInstance;
}

declare const AuthContext: React.Context<AuthContextType>;

export declare const AuthProvider: React.FC<{ children: React.ReactNode }>;
export declare const useAuth: () => AuthContextType;
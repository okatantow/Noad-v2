// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../provider/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useAuth();

  // Show loading state until auth check is complete
  if (loading || !initialized) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
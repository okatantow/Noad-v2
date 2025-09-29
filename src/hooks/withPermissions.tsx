
// hooks/withPermissions.tsx (updated version)
import React from 'react';
import { usePermissions, type Permission } from './usePermissions';
import { useAuth } from '../provider/contexts/AuthContext';
import PermissionDeniedPage from '../pages/PermissionDeniadPage';
import Spinner from "react-bootstrap/Spinner";

// Overload signatures for better DX
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[]
): React.ComponentType<P>;

export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  options: { requiredPermissions: Permission[]; requireAll?: boolean }
): React.ComponentType<P>;

// Implementation
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  optionsOrPermissions: Permission[] | { requiredPermissions: Permission[]; requireAll?: boolean }
) {
  const options = Array.isArray(optionsOrPermissions) 
    ? { requiredPermissions: optionsOrPermissions }
    : optionsOrPermissions;

  const { requiredPermissions = [], requireAll = false } = options;

  return (props: P) => {
    const { 
    //   hasPermission, 
      hasAnyPermission, 
      hasAllPermissions,
      role, 
      isLoaded,         
    //   isEmpty, 
      permissions 
    } = usePermissions();
    
    const { isAuthenticated, initialized } = useAuth();

    const hasAccess = isLoaded && isAuthenticated && (
      role === 'Admin' || 
      (requireAll 
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions))
    );

    if (!initialized || !isLoaded) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <Spinner animation="border" variant="warning" className="h-12 w-12" />
            <p className="mt-4">Checking permissions...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl mb-4">Authentication Required</h2>
            <p>Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <PermissionDeniedPage 
          requiredPermissions={requiredPermissions}
          userPermissions={permissions}
          userRole={role}
        />
      );
    }

    return <Component {...props} />;
  };
}
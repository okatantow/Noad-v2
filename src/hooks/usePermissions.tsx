// hooks/usePermissions.ts
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../provider/contexts/AuthContext';
import { api } from '../services/api';

// Global cache for all available permissions (singleton pattern)
let globalAllPermissions: string[] = [];
let globalPermissionsPromise: Promise<string[]> | null = null;
let isFetching = false;

export type Permission = string;

interface FunctionData {
    id: number;
    function_name: string;
    category_id?: number;
}

interface UsePermissionsReturn {
    permissions: Permission[];
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissionArray: Permission[]) => boolean;
    hasAllPermissions: (permissionArray: Permission[]) => boolean;
    role: string;
    isEmpty: boolean;
    isLoaded: boolean;
    isAdmin: boolean;
    allPermissions: Permission[]; // All available permissions from API
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const usePermissions = (): UsePermissionsReturn => {
    const { 
        user, 
        permissions: userPermissions, // User's assigned permissions from AuthContext
        hasPermission: authHasPermission, 
        hasAnyPermission: authHasAnyPermission, 
        hasAllPermissions: authHasAllPermissions,
        initialized: authInitialized 
    } = useAuth();

    const [allPermissions, setAllPermissions] = useState<Permission[]>(globalAllPermissions);
    const [loading, setLoading] = useState(!globalAllPermissions.length && !globalPermissionsPromise);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    // Fetch all available permissions from the API (singleton pattern)
    const fetchAllPermissions = async (): Promise<void> => {
        // If already fetched, return the cached result
        if (globalAllPermissions.length > 0) {
            if (isMounted.current) {
                setAllPermissions(globalAllPermissions);
                setLoading(false);
            }
            return;
        }

        // If currently fetching, wait for the existing promise
        if (globalPermissionsPromise) {
            try {
                if (isMounted.current) {
                    setLoading(true);
                }
                const permissions = await globalPermissionsPromise;
                if (isMounted.current) {
                    setAllPermissions(permissions);
                    setLoading(false);
                }
                return;
            } catch (err) {
                if (isMounted.current) {
                    setError('Failed to load permissions');
                    setLoading(false);
                }
                return;
            }
        }

        // Start new fetch
        if (isMounted.current) {
            setLoading(true);
            setError(null);
        }
        isFetching = true;

        globalPermissionsPromise = new Promise(async (resolve, reject) => {
            try {
                const res = await api.get("/functions");
                const functionsData: FunctionData[] = res.data.data || res.data;
                
                // Extract function_name fields as permissions
                const permissionsList = functionsData.map(func => func.function_name);
                
                // Update global cache
                globalAllPermissions = permissionsList;
                globalPermissionsPromise = null;
                isFetching = false;

                if (isMounted.current) {
                    setAllPermissions(permissionsList);
                    setLoading(false);
                }
                resolve(permissionsList);
            } catch (err) {
                console.error("Failed to fetch functions:", err);
                globalPermissionsPromise = null;
                isFetching = false;

                if (isMounted.current) {
                    setError('Failed to load permissions');
                    setLoading(false);
                }
                reject(err);
            }
        });

        await globalPermissionsPromise;
    };

    useEffect(() => {
        isMounted.current = true;

        // Only fetch if we haven't already loaded permissions and auth is initialized
        if (authInitialized && globalAllPermissions.length === 0 && !globalPermissionsPromise && !isFetching) {
            fetchAllPermissions();
        }

        return () => {
            isMounted.current = false;
        };
    }, [authInitialized]); // Re-run when auth becomes initialized

    // Get effective permissions (all if Admin, otherwise user's assigned permissions)
    const getEffectivePermissions = (): Permission[] => {
        const userRole = user?.role_name || '';
        // Admins get access to all available permissions
        return userRole === 'Admin' ? [...allPermissions] : userPermissions;
    };

    const effectivePermissions = getEffectivePermissions();
    const role = user?.role_name || '';
    const isLoaded = authInitialized && !loading;
    const isEmpty = effectivePermissions.length === 0 && isLoaded && role !== 'Admin';
    const isAdmin = role === 'Admin';

    // Permission check methods
    const hasPermission = (permission: Permission): boolean => {
        if (!isLoaded) return false;
        // Admin has all permissions that exist in the system
        if (isAdmin) {
            return allPermissions.includes(permission);
        }
        // Regular users only have their assigned permissions
        return authHasPermission(permission);
    };

    const hasAnyPermission = (permissionArray: Permission[]): boolean => {
        if (!isLoaded) return false;
        if (isAdmin) {
            return permissionArray.some(perm => allPermissions.includes(perm));
        }
        return authHasAnyPermission(permissionArray);
    };

    const hasAllPermissions = (permissionArray: Permission[]): boolean => {
        if (!isLoaded) return false;
        if (isAdmin) {
            return permissionArray.every(perm => allPermissions.includes(perm));
        }
        return authHasAllPermissions(permissionArray);
    };

    const refetch = async (): Promise<void> => {
        // Clear cache and refetch
        globalAllPermissions = [];
        globalPermissionsPromise = null;
        await fetchAllPermissions();
    };

    return { 
        permissions: effectivePermissions,
        hasPermission, 
        hasAnyPermission,
        hasAllPermissions,
        role,
        isEmpty,
        isLoaded,
        isAdmin,
        allPermissions,
        loading,
        error,
        refetch
    };
};

// Export additional hooks for specific permission needs
export const usePermission = (permission: string) => {
    const { hasPermission, isLoaded } = usePermissions();
    return isLoaded ? hasPermission(permission) : false;
};

export const usePermissionsList = () => {
    const { allPermissions, loading, error, refetch } = usePermissions();
    return { allPermissions, loading, error, refetch };
};
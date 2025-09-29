// components/PermissionDeniedPage.tsx
import React from "react";
import { type Permission } from "../hooks/usePermissions";

interface PermissionDeniedPageProps {
  requiredPermissions?: Permission[];
  userPermissions?: Permission[];
  userRole?: string;
}

const PermissionDeniedPage: React.FC<PermissionDeniedPageProps> = ({ 
  requiredPermissions = [], 
  userPermissions = [], 
  userRole = '' 
}) => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoToDashboard = () => {
    window.location.href = '/pages/dashboard';
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-gray-900 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Required Permissions Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Required Permissions</h2>
            {requiredPermissions.length === 0 ? (
              <p className="text-gray-300">No specific permissions required (general access)</p>
            ) : (
              <ul className="space-y-2">
                {requiredPermissions.map(perm => (
                  <li key={perm} className="flex items-center">
                    <span className="text-red-400 mr-2">✗</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-sm">{perm}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* User Permissions Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Your Current Permissions</h2>
            <p className="text-sm text-gray-400 mb-3">
              Role: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{userRole || 'None'}</span>
            </p>
            
            {userPermissions.length === 0 ? (
              <p className="text-gray-300">No permissions assigned</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {userPermissions.map(perm => (
                  <li key={perm} className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <code className="bg-gray-700 px-2 py-1 rounded text-sm">{perm}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleGoBack} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mr-4 transition-colors duration-200"
          >
            Go Back
          </button>
          <button 
            onClick={handleGoToDashboard} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Admin Note */}
        {userRole === 'Admin' && (
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Note:</strong> You're logged in as an admin but still don't have access. 
              This might be a configuration issue. Please contact support.
            </p>
          </div>
        )}

        {/* Debug Information (optional - remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-400">Debug Info</summary>
              <div className="mt-2 text-xs">
                <p>Required Count: {requiredPermissions.length}</p>
                <p>User Count: {userPermissions.length}</p>
                <p>User Role: {userRole}</p>
              </div>
            </details>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PermissionDeniedPage;
// Diagnostic component to debug permissions
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PermissionDebug = () => {
  const { user, permissions, hasPermission } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Permission Debugger</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            <p><strong>Name:</strong> {user?.full_name || user?.first_name || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Loaded Permissions</h2>
          <p className="mb-4"><strong>Total Count:</strong> {permissions?.length || 0}</p>
          
          {permissions && permissions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {permissions.map((perm, index) => (
                <div key={index} className="text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                  ✅ {perm}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-600">⚠️ No permissions loaded!</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Permission Tests</h2>
          <div className="space-y-2">
            {[
              'dashboard.view_stats',
              'deals.view_own',
              'deals.view_all',
              'contacts.view_own',
              'analytics.view_personal',
              'activities.view_own',
              'settings.view_profile'
            ].map(perm => (
              <div key={perm} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">{perm}</span>
                <span className={`px-3 py-1 rounded text-sm ${
                  hasPermission(perm) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {hasPermission(perm) ? '✅ Has Permission' : '❌ Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default PermissionDebug;

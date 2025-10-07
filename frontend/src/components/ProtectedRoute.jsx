
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { permissionsService } from '../services/permissionsService';
import Icon from './AppIcon';

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermission = null, requiredPermissions = [] }) => {
  const { user, loading, hasPermission, hasAnyPermission, permissions } = useAuth();

  console.log('🛡️ ProtectedRoute check:', {
    loading,
    user: user?.email,
    permissions,
    requiredPermission,
    requiredPermissions,
    requiredRoles
  });

  if (loading) {
    // Optionally render a loading spinner or skeleton here
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <Icon name="Lock" size={64} className="text-text-tertiary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary">You don't have permission to access this page.</p>
          <p className="text-text-tertiary text-sm mt-2">Required roles: {requiredRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  // Check specific single permission
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <Icon name="Shield" size={64} className="text-text-tertiary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Insufficient Permissions</h2>
            <p className="text-text-secondary">You don't have permission to perform this action.</p>
            <p className="text-text-tertiary text-sm mt-2">Required permission: {requiredPermission}</p>
          </div>
        </div>
      );
    }
  }

  // Check multiple permissions (user needs ANY of these)
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <Icon name="Shield" size={64} className="text-text-tertiary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Insufficient Permissions</h2>
            <p className="text-text-secondary">You don't have permission to access this page.</p>
            <p className="text-text-tertiary text-sm mt-2">Required one of: {requiredPermissions.join(', ')}</p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { permissionsService } from '../services/permissionsService';

const RoleBasedNavigation = ({ children, requiredRoles = [], requiredPermission = null, requiredPermissions = [], fallback = null }) => {
  const { user, hasPermission, hasAnyPermission } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return fallback;
  }

  // Check specific single permission
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return fallback;
    }
  }

  // Check multiple permissions (user needs ANY of these)
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) { 
      return fallback;
    }
  }

  return children;
};

export default RoleBasedNavigation;
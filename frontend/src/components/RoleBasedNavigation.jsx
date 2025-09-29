import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { permissionsService } from '../services/permissionsService';

const RoleBasedNavigation = ({ children, requiredRoles = [], requiredPermission = null, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return fallback;
  }

  // Check specific permission
  if (requiredPermission) {
    const [module, action] = requiredPermission.split('.');
    if (!permissionsService.hasPermission(user.role, module, action)) {
      return fallback;
    }
  }

  return children;
};

export default RoleBasedNavigation;
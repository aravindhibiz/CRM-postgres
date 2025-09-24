import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const routeMap = {
    '/sales-dashboard': { label: 'Dashboard', parent: null },
    '/deal-management': { label: 'Deal Management', parent: '/sales-dashboard' },
    '/contact-management': { label: 'Contact Management', parent: '/sales-dashboard' },
    '/pipeline-analytics': { label: 'Pipeline Analytics', parent: '/sales-dashboard' },
    '/activity-timeline': { label: 'Activity Timeline', parent: '/sales-dashboard' },
    '/settings-administration': { label: 'Settings & Administration', parent: '/sales-dashboard' },
    '/login': { label: 'Login', parent: null }
  };

  const generateBreadcrumbs = () => {
    const currentPath = location.pathname;
    const breadcrumbs = [];
    
    if (!routeMap?.[currentPath]) {
      return breadcrumbs;
    }

    let path = currentPath;
    while (path && routeMap?.[path]) {
      breadcrumbs?.unshift({
        label: routeMap?.[path]?.label,
        path: path,
        isActive: path === currentPath
      });
      path = routeMap?.[path]?.parent;
    }

    // Always include Home/Dashboard as root if not already present
    if (breadcrumbs?.length > 0 && breadcrumbs?.[0]?.path !== '/sales-dashboard' && currentPath !== '/sales-dashboard') {
      breadcrumbs?.unshift({
        label: 'Dashboard',
        path: '/sales-dashboard',
        isActive: false
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on login page or if only one item
  if (location.pathname === '/login' || breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <Icon name="Home" size={16} className="text-text-tertiary" />
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={14} className="text-text-tertiary" />
          )}
          
          {crumb?.isActive ? (
            <span className="text-text-primary font-medium" aria-current="page">
              {crumb?.label}
            </span>
          ) : (
            <Link
              to={crumb?.path}
              className="text-text-secondary hover:text-primary transition-colors duration-150 ease-smooth"
            >
              {crumb?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
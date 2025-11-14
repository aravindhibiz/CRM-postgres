import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { permissionsService } from '../../services/permissionsService';
import Icon from '../AppIcon';
import ThemeToggle from '../ThemeToggle';

const Header = () => {
  const { signOut, user, userProfile, hasPermission, refreshPermissions, permissions } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', path: '/sales-dashboard', icon: 'BarChart3', tooltip: 'Pipeline overview and metrics', requiredPermission: 'dashboard.view_stats' },
    { label: 'Campaigns', path: '/campaign-management', icon: 'Megaphone', tooltip: 'Marketing campaign management', requiredPermission: 'campaigns.view_own' },
    { label: 'Contacts', path: '/contact-management', icon: 'Users', tooltip: 'Customer relationship management', requiredPermission: 'contacts.view_own' },
    { label: 'Deals', path: '/deal-management', icon: 'Target', tooltip: 'Manage deal lifecycle and opportunities', requiredPermission: 'deals.view_own' },
    { label: 'Companies', path: '/company-management', icon: 'Building2', tooltip: 'Company management and relationships', requiredPermission: 'companies.view_own' },
    { label: 'Analytics', path: '/pipeline-analytics', icon: 'TrendingUp', tooltip: 'Performance insights and analysis', requiredPermission: 'analytics.view_personal' },
    { label: 'Activity', path: '/activity-timeline', icon: 'Clock', tooltip: 'Interaction timeline and history', requiredPermission: 'activities.view_own' }
  ];

  const userMenuItems = [
  { label: 'Settings', path: '/settings-administration', icon: 'Settings', requiredPermission: 'settings.view_profile' },
  { label: 'Logout', action: 'logout', icon: 'LogOut' }
  ];

  // Filter navigation items based on user permissions
  const allowedNavItems = navigationItems.filter(item => {
    if (!item.requiredPermission) return true;
    const hasAccess = hasPermission(item.requiredPermission);
    return hasAccess;
  });

  const allowedUserMenuItems = userMenuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);

      await signOut();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleMenuItemClick = (item) => {
    if (item.action === 'logout') {
      handleLogout();
    } else {
      handleNavigation();
    }
  };

  return (
    <>
  <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-1000">
        <div className="px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-1 xs:gap-2">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link to="/sales-dashboard" className="flex items-center space-x-1.5 xs:space-x-2 min-w-0" onClick={handleNavigation}>
                <div className="w-7 h-7 xs:w-8 xs:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" className="xs:w-5 xs:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13L12 4L21 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 21V13H15V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-base xs:text-lg font-semibold text-text-primary font-heading whitespace-nowrap hidden xs:inline">SalesForce Lite</span>
                <span className="text-base font-semibold text-text-primary font-heading whitespace-nowrap xs:hidden">SF</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {allowedNavItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={handleNavigation}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-smooth flex items-center space-x-2 ${
                    isActiveRoute(item?.path)
                      ? 'bg-primary-50 text-primary border border-primary-100' : 'text-text-secondary hover:text-primary'
                  }`}
                  title={item?.tooltip}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 xs:space-x-2 flex-shrink-0">
              {/* Theme Toggle */}
              <div className="hidden xs:block">
                <ThemeToggle />
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-1.5 xs:space-x-2 p-1.5 xs:p-2 rounded-lg hover:bg-surface-hover transition-colors duration-150 ease-smooth min-h-touch"
                >
                  <div className="w-8 h-8 xs:w-8 xs:h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={16} className="text-primary" />
                  </div>
                  <div className="hidden sm:block text-left max-w-[120px] md:max-w-[150px]">
                    <div className="text-xs sm:text-sm font-medium text-text-primary truncate">
                      {userProfile?.full_name || userProfile?.first_name || user?.email || 'User'}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {userProfile?.role === 'admin' ? 'Administrator' :
                       userProfile?.role === 'sales_manager' ? 'Sales Manager' :
                       userProfile?.role === 'sales_rep' ? 'Sales Rep' :
                       'User'}
                    </div>
                  </div>
                  <Icon name="ChevronDown" size={14} className="text-text-secondary flex-shrink-0 hidden xs:block" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-1100">
                    <div className="py-2">
                      {allowedUserMenuItems?.map((item) => {
                        if (item.action === 'logout') {
                          return (
                            <div
                              key={item.label}
                              onClick={handleLogout}
                              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-primary "
                            >
                              <Icon name={item?.icon} size={16} />
                              <span>{item?.label}</span>
                            </div>
                          );
                        } else {
                          return (
                            <Link
                              key={item?.path}
                              to={item?.path}
                              onClick={() => handleMenuItemClick(item)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-primary "
                            >
                              <Icon name={item?.icon} size={16} />
                              <span>{item?.label}</span>
                            </Link>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileMenuToggle}
                className="lg:hidden p-2 min-h-touch min-w-touch flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-150 ease-smooth"
                aria-label="Toggle mobile menu"
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-1200 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleMobileMenuToggle} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Escape' && handleMobileMenuToggle()} aria-label="Close menu"></div>
          <div className="fixed left-0 top-0 bottom-0 w-[280px] xs:w-80 max-w-[85vw] bg-surface shadow-xl overflow-y-auto">
            <div className="p-4 xs:p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13L12 4L21 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 21V13H15V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xl font-semibold text-text-primary font-heading">SalesForce Lite</span>
                </div>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 ease-smooth"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <nav className="space-y-1.5">
                {allowedNavItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={handleNavigation}
                    className={`flex items-center space-x-3 px-3 xs:px-4 py-3 min-h-touch rounded-lg text-sm xs:text-base font-medium transition-all duration-150 ease-smooth ${
                        isActiveRoute(item?.path)
                          ? 'bg-primary-50 text-primary border border-primary-100' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                  >
                    <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                    <span className="truncate">{item?.label}</span>
                  </Link>
                ))}
                
                <div className="border-t border-border my-4"></div>
                
                {allowedUserMenuItems?.map((item) => {
                  if (item.action === 'logout') {
                    return (
                      <button
                        key={item.label}
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 xs:px-4 py-3 min-h-touch rounded-lg text-sm xs:text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth"
                      >
                        <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                        <span className="truncate">{item?.label}</span>
                      </button>
                    );
                  } else {
                    return (
                      <Link
                        key={item?.path}
                        to={item?.path}
                        onClick={() => handleMenuItemClick(item)}
                        className="flex items-center space-x-3 px-3 xs:px-4 py-3 min-h-touch rounded-lg text-sm xs:text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-smooth"
                      >
                        <Icon name={item?.icon} size={20} className="flex-shrink-0" />
                        <span className="truncate">{item?.label}</span>
                      </Link>
                    );
                  }
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-1050"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
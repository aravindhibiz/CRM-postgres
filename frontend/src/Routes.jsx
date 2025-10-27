import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";

// Page imports
import Login from "pages/login";
import Register from "pages/register";
import SalesDashboard from "pages/sales-dashboard";
import DealManagement from "pages/deal-management";
import ContactManagement from "pages/contact-management";
import CompanyManagement from "pages/company-management";
import PipelineAnalytics from "pages/pipeline-analytics";
import ActivityTimeline from "pages/activity-timeline";
import SettingsAdministration from "pages/settings-administration";
import PermissionDebug from "pages/PermissionDebug";

// OAuth Callback Component
const OAuthCallback = () => {
  React.useEffect(() => {
    // Get current URL params and add section parameter
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('section', 'integrations');
    
    // Redirect to settings page with integrations section and OAuth params
    window.location.href = `/settings-administration?${currentParams.toString()}`;
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Processing OAuth callback...</p>
      </div>
    </div>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          
          {/* Debug Route - Remove in production */}
          <Route path="/debug-permissions" element={<PermissionDebug />} />
          
          {/* OAuth Callback Route */}
          <Route
            path="/integrations/oauth/callback"
            element={
              <ProtectedRoute requiredPermission="settings.integrations">
                <OAuthCallback />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/sales-dashboard"
            element={
              <ProtectedRoute requiredPermissions={["dashboard.view_stats", "dashboard.pipeline_view"]}>
                <SalesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deal-management"
            element={
              <ProtectedRoute requiredPermission="deals.view_own">
                <DealManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deal-management/new"
            element={
              <ProtectedRoute requiredPermission="deals.create">
                <DealManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deal-management/:dealId"
            element={
              <ProtectedRoute requiredPermission="deals.view_own">
                <DealManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-management"
            element={
              <ProtectedRoute requiredPermission="contacts.view_own">
                <ContactManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-management"
            element={
              <ProtectedRoute requiredPermission="companies.view_own">
                <CompanyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-management/:companyId"
            element={
              <ProtectedRoute requiredPermission="companies.view_own">
                <CompanyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline-analytics"
            element={
              <ProtectedRoute requiredPermission="analytics.view_personal">
                <PipelineAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-timeline"
            element={
              <ProtectedRoute requiredPermission="activities.view_own">
                <ActivityTimeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings-administration"
            element={
              <ProtectedRoute requiredPermission="settings.view_profile">
                <SettingsAdministration />
              </ProtectedRoute>
            }
          />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
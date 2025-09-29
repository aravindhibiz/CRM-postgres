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
import PipelineAnalytics from "pages/pipeline-analytics";
import ActivityTimeline from "pages/activity-timeline";
import SettingsAdministration from "pages/settings-administration";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/sales-dashboard"
            element={
              <ProtectedRoute requiredPermission="dashboard.view_personal">
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
              <ProtectedRoute requiredRoles={['admin', 'sales_manager']} requiredPermission="settings.view_own_profile">
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
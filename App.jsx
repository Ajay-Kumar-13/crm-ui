import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import LeadsPage from './pages/Leads';
import CompaniesPage from './pages/Companies';
import AIAgent from './pages/AIAgent';
import WhatsApp from './pages/WhatsApp';
import EmailPage from './pages/Email';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Trap from './pages/Trap';
import { LoadingScreen } from './components/ui';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, backendError, authLoading } = useApp();
  const location = useLocation();

  if (backendError) {
    return <Trap />;
  }

  if (authLoading) {
    return <LoadingScreen message="Loading your data..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.roles)) {
    return <div className="p-8 text-center text-red-500">Access Denied: You do not have permission to view this page.</div>;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { backendError } = useApp();

  if (backendError) return <Trap />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/trap" element={<Trap />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN', 'ROOT']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="leads"
          element={
            <ProtectedRoute>
              <LeadsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="companies"
          element={
            <ProtectedRoute roles={['ROOT']}>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="ai-agent"
          element={
            <ProtectedRoute>
              <AIAgent />
            </ProtectedRoute>
          }
        />

        <Route
          path="whatsapp"
          element={
            <ProtectedRoute>
              <WhatsApp />
            </ProtectedRoute>
          }
        />

        <Route
          path="email"
          element={
            <ProtectedRoute roles={['ADMIN', 'ROOT']}>
              <EmailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="billing"
          element={
            <ProtectedRoute roles={['ROOT']}>
              <Billing />
            </ProtectedRoute>
          }
        />

        <Route
          path="settings"
          element={
            <ProtectedRoute roles={['ROOT']}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter basename="/app">
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;

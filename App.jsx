import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import LeadsPage from './pages/Leads';
import CompaniesPage from './pages/Companies';
import Trap from './pages/Trap';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, backendError } = useApp();
  const location = useLocation();

  if (backendError) {
    return <Trap />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
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
            <ProtectedRoute roles={['ADMIN', 'SUPERUSER']}>
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
            <ProtectedRoute roles={['SUPERUSER']}>
              <CompaniesPage />
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
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Wallet from './pages/Wallet';
import Rescue from './pages/Rescue';
import PostDemand from './pages/PostDemand';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminWallet from './pages/admin/AdminWallet';
import AdminRescue from './pages/admin/AdminRescue';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Sync profile role with theme context on load/profile change
const RoleSync = () => {
  const { profile } = useAuth();
  const { setRole, role } = useTheme();

  useEffect(() => {
    if (profile?.role_active && profile.role_active !== role) {
      setRole(profile.role_active);
    }
  }, [profile?.role_active]);

  return null;
};

// Google Analytics
const GA_ID = 'G-XXXXXXXXXX';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag('config', GA_ID, {
        page_path: location.pathname,
      });
    }
  }, [location]);

  return null;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Public Layout Routes */}
      <Route
        element={
          <Layout>
            <PageTracker />
          </Layout>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Listings */}
        <Route path="/listings" element={
          <ProtectedRoute><MyOrders /></ProtectedRoute>
        } />
        <Route path="/browse" element={<Browse />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/listings/create" element={
          <ProtectedRoute><CreateListing /></ProtectedRoute>
        } />

        {/* Orders */}
        <Route path="/orders" element={
          <ProtectedRoute><MyOrders /></ProtectedRoute>
        } />
        <Route path="/order/:id" element={
          <ProtectedRoute><OrderDetail /></ProtectedRoute>
        } />

        {/* Wallet */}
        <Route path="/wallet" element={
          <ProtectedRoute><Wallet /></ProtectedRoute>
        } />

        {/* Rescue */}
        <Route path="/rescue" element={<Rescue />} />

        {/* Demand */}
        <Route path="/demand/post" element={
          <ProtectedRoute><PostDemand /></ProtectedRoute>
        } />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout>
              <PageTracker />
            </AdminLayout>
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/wallet" element={<AdminWallet />} />
        <Route path="/admin/rescue" element={<AdminRescue />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <Layout>
          <div className="page-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
            <h1>404 - Page Not Found</h1>
          </div>
        </Layout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <RoleSync />
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

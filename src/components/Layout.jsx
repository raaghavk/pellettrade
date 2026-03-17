import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { role, toggleRole } = useTheme();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  const shouldShowNav = !isLoginPage && !isAdminRoute;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">PelletTrade</span>
          </div>

          {isAuthenticated && (
            <div className="header-actions">
              <button
                className="role-toggle-btn"
                onClick={toggleRole}
                title={`Switch to ${role === 'seller' ? 'Buyer' : 'Seller'} mode`}
              >
                {role === 'seller' ? 'Buyer' : 'Seller'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

export default Layout;

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { role, toggleRole } = useTheme();

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/login';

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
      </main>

      {/* Bottom Navigation */}
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

export default Layout;

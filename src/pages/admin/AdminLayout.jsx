import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ShoppingCart, Wallet as WalletIcon, Zap, Home, LogOut } from 'lucide-react';
import { supabase, signOut } from '../../lib/supabase';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const adminNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/wallet', icon: WalletIcon, label: 'Wallet' },
    { path: '/admin/rescue', icon: Zap, label: 'Rescue' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>🌾</span>
          <span>PelletTrade Admin</span>
        </div>

        <nav className="admin-nav">
          {adminNavItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className="admin-logout-btn"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

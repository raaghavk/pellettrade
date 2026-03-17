'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, ShoppingCart, Wallet as WalletIcon, Zap, Home, LogOut } from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const adminNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/wallet', icon: WalletIcon, label: 'Wallet' },
    { path: '/admin/rescue', icon: Zap, label: 'Rescue' },
  ];

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="flex-center" style={{ minHeight: '100vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return null;
  }

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
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
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

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wallet, Zap, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isBuyerMode = localStorage.getItem('userRole') === 'buyer';

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
    },
    {
      path: isBuyerMode ? '/browse' : '/listings',
      icon: ShoppingBag,
      label: isBuyerMode ? 'Browse' : 'Listings',
    },
    {
      path: '/wallet',
      icon: Wallet,
      label: 'Wallet',
    },
    {
      path: '/rescue',
      icon: Zap,
      label: 'Rescue',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

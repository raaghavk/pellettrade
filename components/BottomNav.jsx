'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Wallet, Zap, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const BottomNav = () => {
  const pathname = usePathname();
  const { role } = useTheme();

  const isBuyerMode = role === 'buyer';

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
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
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

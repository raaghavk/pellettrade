'use client';

import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [role, setRoleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') || 'seller';
    }
    return 'seller';
  });

  useEffect(() => {
    applyTheme(role);
  }, [role]);

  const applyTheme = (newRole) => {
    const root = document.documentElement;

    if (newRole === 'seller') {
      root.style.setProperty('--primary', '#1B5E20');
      root.style.setProperty('--accent', '#4CAF50');
      root.style.setProperty('--primary-light', '#81C784');
      root.style.setProperty('--primary-dark', '#0D3817');
      root.style.setProperty('--background', '#F1F8E9');
    } else {
      root.style.setProperty('--primary', '#1565C0');
      root.style.setProperty('--accent', '#42A5F5');
      root.style.setProperty('--primary-light', '#64B5F6');
      root.style.setProperty('--primary-dark', '#0D47A1');
      root.style.setProperty('--background', '#E3F2FD');
    }

    root.style.setProperty('--text-primary', '#212121');
    root.style.setProperty('--text-secondary', '#666666');
    root.style.setProperty('--border-color', '#E0E0E0');
    root.style.setProperty('--success', '#4CAF50');
    root.style.setProperty('--warning', '#FF9800');
    root.style.setProperty('--error', '#F44336');
    root.style.setProperty('--info', '#2196F3');
  };

  const setRole = (newRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', newRole);
    }
  };

  const toggleRole = () => {
    const newRole = role === 'seller' ? 'buyer' : 'seller';
    setRole(newRole);
  };

  return (
    <ThemeContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

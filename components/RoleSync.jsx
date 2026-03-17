'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function RoleSync() {
  const { profile } = useAuth();
  const { setRole } = useTheme();

  useEffect(() => {
    if (profile?.role_active) {
      setRole(profile.role_active);
    }
  }, [profile?.role_active, setRole]);

  return null;
}

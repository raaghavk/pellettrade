import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, getUserProfile, createUserProfile } from '../lib/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    try {
      let profileData = await getUserProfile(userId);
      if (!profileData) {
        const phone = user?.phone;
        profileData = await createUserProfile(userId, phone, 'seller');
      }
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    }
  }, [user?.phone]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = {
    user,
    profile,
    loading,
    error,
    setProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

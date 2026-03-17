import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cawowquolsqgbsouwhsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Email Magic Link auth
export const sendMagicLink = async (email) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Magic link error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Demo login for development (uses email/password auth)
export const demoLogin = async (role = 'seller') => {
  const email = role === 'seller'
    ? 'demo-seller@pellettrade.app'
    : role === 'buyer'
    ? 'demo-buyer@pellettrade.app'
    : 'demo-admin@pellettrade.app';
  const password = 'demo123456';

  try {
    // Try to sign in first
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && error.message.includes('Invalid login')) {
      // Account doesn't exist, create it
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, is_demo: true }
        }
      });

      if (signUpResult.error) throw signUpResult.error;
      data = signUpResult.data;

      // Create user profile
      if (data.user) {
        const demoProfiles = {
          seller: { name: 'Demo Seller', phone: '+919876500001', business_name: 'Demo Pellet Co.', location_state: 'Haryana', location_city: 'Panipat', role_active: 'seller' },
          buyer: { name: 'Demo Buyer', phone: '+919876500002', business_name: 'Demo Industries', location_state: 'Uttar Pradesh', location_city: 'Lucknow', role_active: 'buyer' },
          admin: { name: 'Demo Admin', phone: '+919876500003', business_name: 'PelletTrade HQ', location_state: 'Haryana', location_city: 'Gurgaon', role_active: 'seller', is_admin: true },
        };

        const profileData = demoProfiles[role];
        await supabase.from('users').upsert([{
          id: data.user.id,
          ...profileData,
          is_admin: profileData.is_admin || false,
          kyc_status: 'verified',
          rating: 4.5,
          total_trades: 12,
        }]);
      }
    } else if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Demo login error:', error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

export const createUserProfile = async (userId, phoneNumber, role = 'seller') => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        phone: phoneNumber,
        role_active: role,
        is_admin: false,
        kyc_status: 'pending',
        rating: 0,
        total_trades: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create profile error:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    return null;
  }
};

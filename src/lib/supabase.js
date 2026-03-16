import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cawowquolsqgbsouwhsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const sendOTP = async (phoneNumber) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OTP send error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (phoneNumber, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OTP verify error:', error);
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
        role,
        is_admin: false,
        kyc_verified: false,
        rating: 0,
        total_ratings: 0,
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

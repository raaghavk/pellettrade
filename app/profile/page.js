'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, signOut } from '@/lib/supabase';
import { INDIAN_STATES } from '@/lib/constants';
import { LogOut, Edit2, CheckCircle, Clock } from 'lucide-react';

const Profile = () => {
  const router = useRouter();
  const { user, profile, setProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    business_name: profile?.business_name || '',
    phone: profile?.phone || '',
    location_city: profile?.location_city || '',
    location_state: profile?.location_state || '',
    location_pincode: profile?.location_pincode || '',
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveProfile = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          business_name: formData.business_name,
          phone: formData.phone,
          location_city: formData.location_city,
          location_state: formData.location_state,
          location_pincode: formData.location_pincode,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        name: formData.name,
        business_name: formData.business_name,
        phone: formData.phone,
        location_city: formData.location_city,
        location_state: formData.location_state,
        location_pincode: formData.location_pincode,
      }));

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOut();
    if (result.success) {
      router.push('/login');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="empty-state">
            <h2>Not Signed In</h2>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      {/* User Info Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {profile?.name
              ? profile.name.charAt(0).toUpperCase()
              : user?.phone?.slice(-2)}
          </div>
          <div className="profile-title">
            <h2>{profile?.name || 'User'}</h2>
            <p className="phone-number">{profile?.phone || user?.phone}</p>
          </div>
          {!isEditing && (
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={20} />
            </button>
          )}
        </div>

        {isEditing && (
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="business_name">Business Name</label>
              <input
                id="business_name"
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Your business name (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location_city">City</label>
              <input
                id="location_city"
                type="text"
                name="location_city"
                value={formData.location_city}
                onChange={handleChange}
                placeholder="Your city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location_state">State</label>
              <select
                id="location_state"
                name="location_state"
                value={formData.location_state}
                onChange={handleChange}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location_pincode">Pincode</label>
              <input
                id="location_pincode"
                type="text"
                name="location_pincode"
                value={formData.location_pincode}
                onChange={handleChange}
                placeholder="Your pincode"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button
                className="btn btn-primary btn-block"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: profile?.name || '',
                    business_name: profile?.business_name || '',
                    phone: profile?.phone || '',
                    location_city: profile?.location_city || '',
                    location_state: profile?.location_state || '',
                    location_pincode: profile?.location_pincode || '',
                  });
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KYC Status */}
      <div className="section-card">
        <h2>KYC Status</h2>
        <div className="kyc-status">
          {profile?.kyc_status === 'verified' ? (
            <>
              <CheckCircle size={24} color="#4CAF50" />
              <div>
                <p className="status-label">Verified</p>
                <p className="status-detail">Your KYC has been verified</p>
              </div>
            </>
          ) : (
            <>
              <Clock size={24} color="#FF9800" />
              <div>
                <p className="status-label">{profile?.kyc_status === 'rejected' ? 'Rejected' : 'Pending Verification'}</p>
                <p className="status-detail">{profile?.kyc_status === 'rejected' ? 'Your KYC was rejected' : 'KYC verification in progress'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="section-card">
        <h2>Your Rating</h2>
        <div className="rating-section">
          <div className="rating-display">
            <span className="big-number">
              {profile?.rating?.toFixed(1) || 'N/A'}
            </span>
            <span className="rating-count">
              / 5 ({profile?.total_trades || 0} trades)
            </span>
          </div>
          <div className="rating-info">
            <p>Your average rating across all completed transactions</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section-card profile-stats">
        <h2>Account Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{profile?.total_trades || 0}</span>
            <span className="stat-label">Total Trades</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')}</span>
            <span className="stat-label">Wallet Balance</span>
          </div>
        </div>
      </div>

      {/* User Info Details */}
      <div className="section-card">
        <h2>Location Information</h2>
        <div className="info-list">
          <div className="info-item">
            <span className="label">City:</span>
            <span className="value">{profile?.location_city || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">State:</span>
            <span className="value">{profile?.location_state || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <span className="label">Pincode:</span>
            <span className="value">{profile?.location_pincode || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="section-card danger">
        <h2>Account Actions</h2>
        <button
          className="btn btn-danger btn-block btn-large"
          onClick={handleSignOut}
          disabled={loading}
        >
          <LogOut size={20} />
          {loading ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {/* About */}
      <div className="about-section">
        <h3>About PelletTrade</h3>
        <p>
          PelletTrade connects biomass pellet buyers and sellers across India
          with a secure, transparent platform for trading.
        </p>
        <p className="version">v1.0.0</p>
      </div>
    </div>
  );
};

export default Profile;

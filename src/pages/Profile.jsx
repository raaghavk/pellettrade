import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, signOut } from '../lib/supabase';
import { LogOut, Edit2, CheckCircle, Clock } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, setProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    company_name: profile?.company_name || '',
    business_type: profile?.business_type || '',
    notifications_enabled: profile?.notifications_enabled !== false,
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
          full_name: formData.full_name,
          company_name: formData.company_name,
          business_type: formData.business_type,
          notifications_enabled: formData.notifications_enabled,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        full_name: formData.full_name,
        company_name: formData.company_name,
        business_type: formData.business_type,
        notifications_enabled: formData.notifications_enabled,
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
      navigate('/login');
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
              onClick={() => navigate('/login')}
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
            {profile?.full_name
              ? profile.full_name.charAt(0).toUpperCase()
              : user?.phone?.slice(-2)}
          </div>
          <div className="profile-title">
            <h2>{profile?.full_name || 'User'}</h2>
            <p className="phone-number">{user?.phone}</p>
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
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company_name">Company Name</label>
              <input
                id="company_name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Your company name (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="business_type">Business Type</label>
              <select
                id="business_type"
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
              >
                <option value="">Select business type</option>
                <option value="individual">Individual Seller</option>
                <option value="small_business">Small Business</option>
                <option value="large_business">Large Business</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <input
                id="notifications"
                type="checkbox"
                name="notifications_enabled"
                checked={formData.notifications_enabled}
                onChange={handleChange}
              />
              <label htmlFor="notifications">Enable notifications</label>
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
                    full_name: profile?.full_name || '',
                    company_name: profile?.company_name || '',
                    business_type: profile?.business_type || '',
                    notifications_enabled: profile?.notifications_enabled !== false,
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
          {profile?.kyc_verified ? (
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
                <p className="status-label">Pending Verification</p>
                <p className="status-detail">KYC verification in progress</p>
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
              / 5 ({profile?.total_ratings || 0} ratings)
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
            <span className="stat-value">{profile?.total_orders || 0}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')}</span>
            <span className="stat-label">Wallet Balance</span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="section-card">
        <h2>Settings</h2>
        <div className="settings-list">
          <div className="setting-item">
            <span>Notifications</span>
            <span className="setting-value">
              {formData.notifications_enabled ? '✓ Enabled' : '✗ Disabled'}
            </span>
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

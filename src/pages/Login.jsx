import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMagicLink, demoLogin } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, Users, ShoppingCart, Shield, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setRole } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const result = await sendMagicLink(email);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Failed to send login link');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="logo-icon-large">🌾</span>
          <h1>PelletTrade</h1>
          <p>India's B2B Biomass Pellet Market</p>
        </div>

        {sent ? (
          <div className="login-form">
            <div className="magic-link-sent">
              <CheckCircle size={48} color="#4CAF50" />
              <h2>Check your email</h2>
              <p className="sent-email">{email}</p>
              <p className="login-info">
                We've sent you a magic login link. Click the link in your email to sign in.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                  setError('');
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <h2>Get Started</h2>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                className="email-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-large"
              disabled={loading || !email}
            >
              {loading ? (
                <span className="loading-text">Sending link...</span>
              ) : (
                <>
                  <Mail size={20} />
                  Send Magic Link
                </>
              )}
            </button>

            <p className="login-info">
              We'll email you a magic link to sign in instantly — no password needed
            </p>
          </form>
        )}

        <div className="demo-section">
          <div className="demo-divider">
            <span>or try demo</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn demo-seller"
              onClick={async () => {
                setLoading(true);
                setError('');
                const result = await demoLogin('seller');
                if (result.success) { setRole('seller'); navigate('/'); }
                else setError(result.error || 'Demo login failed');
                setLoading(false);
              }}
              disabled={loading}
            >
              <Users size={18} />
              <span>Seller Demo</span>
            </button>
            <button
              type="button"
              className="demo-btn demo-buyer"
              onClick={async () => {
                setLoading(true);
                setError('');
                const result = await demoLogin('buyer');
                if (result.success) { setRole('buyer'); navigate('/'); }
                else setError(result.error || 'Demo login failed');
                setLoading(false);
              }}
              disabled={loading}
            >
              <ShoppingCart size={18} />
              <span>Buyer Demo</span>
            </button>
          </div>
          <button
            type="button"
            className="demo-btn demo-admin"
            onClick={async () => {
              setLoading(true);
              setError('');
              const result = await demoLogin('admin');
              if (result.success) { setRole('seller'); navigate('/admin'); }
              else setError(result.error || 'Demo login failed');
              setLoading(false);
            }}
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            <Shield size={18} />
            <span>Admin Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

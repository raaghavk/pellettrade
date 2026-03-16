import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, createUserProfile } from '../lib/supabase';
import { Phone, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone, otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhoneInput = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 10) return cleaned;
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneInput(e.target.value));
    setError('');
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    const fullPhone = `+91${phone}`;
    const result = await sendOTP(fullPhone);

    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }

    setLoading(false);
  };

  const handleOtpChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    setError('');
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    const fullPhone = `+91${phone}`;
    const result = await verifyOTP(fullPhone, otp);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to verify OTP');
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

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="login-form">
            <h2>Get Started</h2>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="phone-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  maxLength="10"
                  inputMode="numeric"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-large"
              disabled={loading || phone.length !== 10}
            >
              {loading ? (
                <span className="loading-text">Sending OTP...</span>
              ) : (
                <>
                  <Phone size={20} />
                  Send OTP
                </>
              )}
            </button>

            <p className="login-info">
              We'll send a one-time password to your phone number
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <h2>Enter OTP</h2>
            <p className="phone-display">
              Sent to +91{phone.replace(/(\d{5})(\d{5})/, '$1 $2')}
            </p>

            <div className="form-group">
              <label htmlFor="otp">One-Time Password</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                disabled={loading}
                maxLength="6"
                inputMode="numeric"
                className="otp-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-large"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <span className="loading-text">Verifying...</span>
              ) : (
                <>
                  <Lock size={20} />
                  Verify OTP
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              disabled={loading}
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

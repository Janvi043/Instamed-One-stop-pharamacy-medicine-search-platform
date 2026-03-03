import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import './PharmacyLogin.css';

const PharmacyLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Uncomment below for test bypass
    /*
    setAuthToken('test-token');
    setUser({ pharmacyName: 'Test Pharmacy', userId: formData.userId });
    navigate('/pharmacy-home');
    */
    
    // Real authentication
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.pharmacyLogin(formData);
      setAuthToken(response.data.token);
      setUser(response.data);
      navigate('/pharmacy-home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pharmacy-login-page">
      <div className="login-container">
        <div className="back-button" onClick={() => navigate('/')}>
          ← Back
        </div>

        <div className="login-card card">
          <div className="login-header">
            <div className="login-icon">🏪</div>
            <h2>Pharmacy Owner Login</h2>
            <p>Manage your pharmacy inventory and details</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Enter your user ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-success submit-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="forgot-password">
              <span className="text-link">Forgot password?</span>
            </div>

            <div className="register-link">
              <p>Don't have an account? <a href="/pharmacy-register">Register your pharmacy</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;


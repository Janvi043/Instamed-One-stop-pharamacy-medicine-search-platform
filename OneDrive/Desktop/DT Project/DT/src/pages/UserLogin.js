import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import './UserLogin.css';

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
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
    setUser({ name: 'Test User', userId: formData.username });
    navigate('/user-home');
    */
    
    // Real authentication
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.userLogin(formData);
      setAuthToken(response.data.token);
      setUser(response.data);
      navigate('/user-home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    console.log('Guest login');
    navigate('/user-home-guest');
  };

  return (
    <div className="user-login-page">
      <div className="login-container">
        <div className="back-button" onClick={() => navigate('/')}>
          ← Back
        </div>

        <div className="login-card card">
          <div className="login-header">
            <div className="login-icon">👤</div>
            <h2>User Login</h2>
            <p>Find medicines and nearby pharmacies</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
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
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button 
            onClick={handleGuestLogin} 
            className="btn btn-secondary guest-btn"
          >
            Continue Without Login
          </button>

          <div className="register-link">
            <span>Don't have an account? </span>
            <span className="text-link" onClick={() => navigate('/user-registration')}>
              Register Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;


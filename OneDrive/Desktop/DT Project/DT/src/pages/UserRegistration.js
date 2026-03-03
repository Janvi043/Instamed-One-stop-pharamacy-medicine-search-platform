import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { setAuthToken, setUser } from '../utils/auth';
import './UserRegistration.css';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    userId: '',
    password: '',
    confirmPassword: ''
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
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    // Uncomment below for test bypass
    /*
    setAuthToken('test-token');
    setUser({ 
      name: formData.name, 
      userId: formData.userId,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    });
    alert('Registration successful!');
    navigate('/user-home');
    */
    
    // Real authentication
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.userRegister(formData);
      setAuthToken(response.data.token);
      setUser(response.data);
      alert('Registration successful!');
      navigate('/user-home');
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 
                      err.response?.data?.message || 
                      'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-page">
      <div className="registration-container">
        <div className="back-button" onClick={() => navigate('/user-login')}>
          ← Back to Login
        </div>

        <div className="registration-card card">
          <div className="registration-header">
            <div className="registration-icon">📝</div>
            <h2>Create New Account</h2>
            <p>Join us to find medicines near you</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="userId">Create User ID *</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="Choose a unique user ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Create Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                minLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="login-link">
              <span>Already have an account? </span>
              <span className="text-link" onClick={() => navigate('/user-login')}>
                Login Here
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;


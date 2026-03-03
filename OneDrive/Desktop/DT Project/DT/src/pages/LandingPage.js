import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-header">
        <Logo size="large" />
        <p className="app-subtitle">One Stop Pharmacy Medicine Search Platform</p>
      </div>

      <div className="landing-content">
        <h2 className="selection-title">How would you like to continue?</h2>
        
        <div className="user-type-cards">
          <div className="user-type-card" onClick={() => navigate('/user-login')}>
            <div className="card-icon user-icon">👤</div>
            <h3>I'm a User</h3>
            <p>Search for medicines and find nearby pharmacies</p>
            <button className="btn btn-primary">Continue as User</button>
          </div>

          <div className="user-type-card" onClick={() => navigate('/pharmacy-login')}>
            <div className="card-icon pharmacy-icon">🏪</div>
            <h3>I'm a Pharmacy Owner</h3>
            <p>Manage your pharmacy inventory and details</p>
            <button className="btn btn-success">Continue as Owner</button>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>© 2025 PharmaMed. Find your medicine, anytime, anywhere.</p>
      </footer>
    </div>
  );
};

export default LandingPage;


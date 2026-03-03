import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`instamed-logo ${size}`}>
      <div className="logo-icon">
        <span className="pill-icon">💊</span>
        <span className="plus-icon">+</span>
      </div>
      <span className="logo-text">InstaMed</span>
    </div>
  );
};

export default Logo;


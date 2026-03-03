import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/user-login" replace />;
  }
  return children;
};

export default ProtectedRoute;


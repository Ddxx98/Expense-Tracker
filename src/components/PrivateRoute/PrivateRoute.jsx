import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requireVerification = true }) => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const isVerified = useSelector(state => state.auth.isVerified);

  // Check if user is authenticated
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // If verification is required and user is not verified
  if (requireVerification && !isVerified) {
    return <Navigate to="/verify" replace />;
  }

  // If user is authenticated and verification status meets requirements
  return children;
};

export default PrivateRoute;
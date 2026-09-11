import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login with state to remember where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading, token, fetchUser } = useAuth();
  const location = useLocation();

  // Debugging logs
  useEffect(() => {
    console.log('ProtectedRoute - Current auth state:', { 
      user, 
      isLoading, 
      token: token ? 'exists' : 'missing',
      path: location.pathname 
    });
  }, [user, isLoading, token, location]);

  // If we're still loading, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If there's a token but no user, try to fetch user data
  if (token && !user) {
    console.log('Token exists but no user - attempting to fetch user');
    fetchUser();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user and no token, redirect to login
  if (!user && !token) {
    console.log('No user or token - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a user, render the protected content
  console.log('User authenticated - rendering protected content');
  return children;
};

export default ProtectedRoute;
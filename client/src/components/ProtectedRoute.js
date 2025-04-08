import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn, userType, allowedUserType }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />; // Redirect to home if not logged in
  }

  if (userType !== allowedUserType) {
    return <Navigate to="/" replace />; // Redirect to home if userType doesn't match
  }

  return <Outlet />; // Render the protected route
};

export default ProtectedRoute;
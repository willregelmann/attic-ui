import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated = true }) => {
  if (!isAuthenticated) {
    return null; // This will be handled by the main app's redirect logic
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
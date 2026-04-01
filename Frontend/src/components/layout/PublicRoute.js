import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
 
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname;  
    if (from && from !== '/') {
      return <Navigate to={from} replace />;
    }
    const dashboardRoutes = {
      patient: '/app/patient/dashboard',
      doctor: '/app/doctor/dashboard'
    };
    const redirectPath = dashboardRoutes[user.role] || '/app/patient/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};
 
export default PublicRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  // Check if authenticated
  if (!token || !userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user = null;
  try {
    user = JSON.parse(userString);
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Normalize user role and allowed roles
  const userRole = user.role ? user.role.toLowerCase() : '';
  const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => r.toLowerCase()) : [];

  // Check if role is allowed
  if (allowedRoles && !normalizedAllowedRoles.includes(userRole)) {
    // Redirect to proper role dashboard
    let targetPath = '/login';
    if (userRole === 'admin') targetPath = '/admin-dashboard';
    else if (userRole === 'doctor') targetPath = '/doctor-dashboard';
    else if (userRole === 'midwife') targetPath = '/midwife-dashboard';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '450px',
          width: '100%'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
            Access Denied
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
            Your account role (<strong>{userRole.toUpperCase()}</strong>) does not have permission to access this portal page.
          </p>
          <a
            href={targetPath}
            style={{
              display: 'inline-block',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
          >
            Go to My Dashboard →
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

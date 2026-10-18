import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import MidwifeDashboard from './MidwifeDashboard';
import DoctorDashboard from './DoctorDashboard';
import ChildProfile from './ChildProfile';
import Welcome from './Welcome';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Welcome Screen */}
          <Route path="/" element={<Welcome />} />
          
          {/* Login Screen */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Dashboard - Accessible by Admin only */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Midwife Dashboard - Accessible by Midwife and Admin */}
          <Route 
            path="/midwife-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['midwife', 'admin']}>
                <MidwifeDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Doctor Dashboard - Accessible by Doctor and Admin */}
          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Child Health Profile - Accessible by Staff (Admin, Doctor, Midwife) */}
          <Route 
            path="/child-profile/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'midwife']}>
                <ChildProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

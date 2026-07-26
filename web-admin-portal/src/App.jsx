import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import MidwifeDashboard from './MidwifeDashboard';
import DoctorDashboard from './DoctorDashboard';
import ChildProfile from './ChildProfile';
import Welcome from './Welcome';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Welcome Screen */}
          <Route path="/" element={<Welcome />} />
          
          {/* Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/midwife-dashboard" element={<MidwifeDashboard />} />
          
          {/* Doctor Dashboard */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

          {/* Child Health Profile */}
          <Route path="/child-profile/:id" element={<ChildProfile />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import MidwifeDashboard from './MidwifeDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/midwife-dashboard" element={<MidwifeDashboard />} />

          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

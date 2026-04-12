import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Login Function 
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier,
        password,
        role: selectedRole.toLowerCase()
      });

      // Save token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      alert(`Welcome ${response.data.user.name}!`);
      
      const userRole = response.data.user.role;

      // Navigate based on role
      if (userRole === 'admin') {
        navigate('/dashboard');
      } else if (userRole === 'midwife') {
        navigate('/midwife-dashboard'); 
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">⚡</div>
        <h2>Digital Child Healthcare Monitoring System</h2>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="info-side">
        <div className="logo-text">🤍 Digital Child Healthcare</div>
        <h1>Empowering Healthcare Professionals</h1>
        <p>Secure access to comprehensive child health records, growth monitoring, and clinic management tools.</p>
      </div>

      <div className="form-side">
        <div className="login-card">
          <h2>Staff Portal Access</h2>
          <p className="subtitle">Sign in to access the healthcare monitoring system</p>
          
          <div className="role-tabs">
            {['Admin', 'Doctor', 'Midwife'].map(role => (
              <button 
                key={role} 
                type="button" 
                className={selectedRole === role ? 'active' : ''} 
                onClick={() => setSelectedRole(role)}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Email or Employee ID" 
              className="input-field" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn">Login →</button>
          </form>

          <div className="auth-footer-note">
            <div className="auth-status">⚠️ Authorized Personnel Only</div>
            Contact System Administrator to create your account.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
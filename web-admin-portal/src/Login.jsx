import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailFormatError, setEmailFormatError] = useState('');

  const navigate = useNavigate();

  // Auto-redirect if session active
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        const userRole = user.role ? user.role.toLowerCase() : '';
        if (userRole === 'admin') navigate('/admin-dashboard');
        else if (userRole === 'doctor') navigate('/doctor-dashboard');
        else if (userRole === 'midwife') navigate('/midwife-dashboard');
      } catch (e) {
        localStorage.clear();
      }
    }

    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Email format validation helper
  const validateEmailFormat = (val) => {
    if (!val) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address (e.g. name@clinic.com).';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailFormatError) {
      setEmailFormatError(validateEmailFormat(val));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleEmailBlur = () => {
    if (email) {
      setEmailFormatError(validateEmailFormat(email));
    }
  };

  // Form submission & Role-Based Redirection Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate email format
    const formatErr = validateEmailFormat(email);
    if (formatErr) {
      setEmailFormatError(formatErr);
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. API authentication call
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: email.trim(),
        password: password
      });

      const token = response.data?.token;
      const user = response.data?.user;

      if (!user || !user.role) {
        throw new Error('Invalid user profile response from server.');
      }

      // 2. Store session details in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // 3. Role-Based Redirection Logic (CRITICAL)
      const userRole = user.role.toLowerCase().trim();

      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (userRole === 'midwife') {
        navigate('/midwife-dashboard');
      } else {
        setErrorMessage('Unauthorized role assignment. Access denied for this role.');
        localStorage.clear();
      }

    } catch (err) {
      console.error('Authentication Error:', err);
      
      // Fallback for demo testing if backend is temporarily unreachable or user does not exist yet
      const msg = err.response?.data?.msg || err.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
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
        <div className="logo-text">🤍 MediKid </div>
        <h1>Empowering Healthcare Professionals</h1>
        <p>Secure access to comprehensive child health records, growth monitoring, and clinic management tools.</p>
        
        <ul className="feature-list">
          <li className="feature-item">✓ Single Unified Portal for Staff & Admin</li>
          <li className="feature-item">✓ Role-Based Dynamic Routing & Access Control</li>
          <li className="feature-item">✓ Real-time Child Health & Vaccination Records</li>
        </ul>
      </div>

      <div className="form-side">
        <div className="login-card">
          <h2>Sign In to Portal</h2>
          <p className="subtitle">Enter your staff credentials to access your dashboard</p>

          {/* Red Alert Banner for Error Messages */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '13.5px',
              lineHeight: '1.4',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <AlertCircle size={18} style={{ minWidth: 18, marginTop: 2, color: '#dc2626' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Single Common Login Form */}
          <form onSubmit={handleLogin} noValidate>
            
            {/* Email Address Input */}
            <div style={{ marginBottom: emailFormatError ? '8px' : '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} 
                />
                <input 
                  type="email" 
                  placeholder="e.g. doctor@clinic.com" 
                  className="input-field"
                  style={{ 
                    paddingLeft: 42, 
                    marginBottom: 0,
                    borderColor: emailFormatError ? '#ef4444' : undefined 
                  }} 
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
                />
              </div>
              {emailFormatError && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', marginLeft: '4px' }}>
                  {emailFormatError}
                </div>
              )}
            </div>

            {/* Password Input with Lock & Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} 
                />
                <input 
                  type={passwordVisible ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42, marginBottom: 0 }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(v => !v)}
                  style={{ 
                    position: 'absolute', 
                    right: 12, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer', 
                    color: '#6b7280', 
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '22px',
              fontSize: '13px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0052FF', cursor: 'pointer' }}
                />
                <span>Remember Me</span>
              </label>
              <a 
                href="#forgot-password" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("To reset your password, please contact the System Administrator.");
                }}
                style={{ color: '#0052FF', textDecoration: 'none', fontWeight: '600' }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button with Spinner */}
            <button 
              type="submit" 
              className="login-btn" 
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Portal →</span>
              )}
            </button>
          </form>


          <div className="auth-footer-note">
            <div className="auth-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <ShieldCheck size={14} color="#d97706" /> Authorized Personnel Only
            </div>
            Role-Based Access Control automatically redirects based on user role credentials.
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  UserCheck, 
  Baby, 
  Stethoscope, 
  Heart, 
  ClipboardList, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  CalendarDays,
  Utensils
} from 'lucide-react';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  const handlePortalAccess = (role) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="welcome-container">
      {/* Dynamic Background Elements */}
      <div className="bg-bubble bubble-1"></div>
      <div className="bg-bubble bubble-2"></div>

      {/* Navigation Header */}
      <header className="welcome-header">
        <div className="brand-logo">
          <span className="heart-icon">🤍</span>
          <h1>MediKid</h1>
        </div>
        <nav className="header-nav">
          <a href="#features">Features</a>
          <a href="#portals">Staff Gateways</a>
          <button onClick={() => handlePortalAccess('doctor')} className="quick-access-btn">
            Quick Log In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <Sparkles size={12} className="text-blue-500" />
            <span>Smart MOH Health System</span>
          </div>
          <h1>Transforming Pediatric Care & Growth Monitoring</h1>
          <p>
            Welcome to the national child health portal. MediKid coordinates clinics, WHO growth monitoring, immunization records, and pediatrician consults under a single digital MOH umbrella.
          </p>
          <div className="hero-actions">
            <a href="#portals" className="cta-primary">
              <span>Access Portals</span>
              <ArrowRight size={16} />
            </a>
            <a href="#features" className="cta-secondary">Learn Features</a>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="features-section">
        <div className="section-title">
          <h2>Core System Capabilities</h2>
          <p>Standardized tools designed for medical practitioners and district health midwives.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper color-1">
              <TrendingUp size={24} />
            </div>
            <h3>WHO growth charts</h3>
            <p>Plot height-for-age, weight-for-age, and BMI logs automatically to audit risk trends.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper color-2">
              <CalendarDays size={24} />
            </div>
            <h3>Immunization Cards</h3>
            <p>Plan vaccinations, log completed vaccine entries, and receive schedules alert warnings.</p>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper color-3">
              <Utensils size={24} />
            </div>
            <h3>Nutrition & Supplements</h3>
            <p>Disburse Thriposha packages, monitor batch numbers, and audit food distribution schedules.</p>
          </div>
        </div>
      </section>

      {/* Portal Gateway Section */}
      <section id="portals" className="portals-section">
        <div className="section-title">
          <h2>Platform Portal Gateways</h2>
          <p>Select your authorized workspace below to sign in and begin.</p>
        </div>

        <div className="portals-grid">
          {/* Admin / MOH Card */}
          <div className="portal-card">
            <div className="portal-badge badge-admin">MOH Admin</div>
            <div className="portal-icon">
              <ShieldAlert size={36} />
            </div>
            <h3>District Registry Control</h3>
            <p>Register clinic centers, allocate doctors/midwives, and audit master reports.</p>
            <button onClick={() => handlePortalAccess('admin')} className="portal-btn btn-admin">
              <span>Admin Portal Login</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Doctor Card */}
          <div className="portal-card">
            <div className="portal-badge badge-doctor">Pediatric Doctor</div>
            <div className="portal-icon">
              <Stethoscope size={36} />
            </div>
            <h3>Clinical Assessments</h3>
            <p>Record medical diagnostics, file specialist transfers, and print referral letters.</p>
            <button onClick={() => handlePortalAccess('doctor')} className="portal-btn btn-doctor">
              <span>Pediatric Portal Login</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Midwife Card */}
          <div className="portal-card">
            <div className="portal-badge badge-midwife">Midwife</div>
            <div className="portal-icon">
              <ClipboardList size={36} />
            </div>
            <h3>Home & Clinic Care</h3>
            <p>Log growth logs, disburse Thriposha bags, and record clinic-visit logs.</p>
            <button onClick={() => handlePortalAccess('midwife')} className="portal-btn btn-midwife">
              <span>Midwife Portal Login</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <p>© 2026 MediKid Child Healthcare System. Authorized Medical Personnel Only.</p>
        <p className="sub-footer">Ministry of Health Services • Digital Infrastructure Division</p>
      </footer>
    </div>
  );
};

export default Welcome;

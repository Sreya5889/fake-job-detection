import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, User, LogOut, LayoutDashboard, History as HistoryIcon, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    addToast('You have been logged out successfully.', 'info');
    navigate('/login');
  };

  const handleSectionClick = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" aria-label="FakeJobDetect Home">
          <div className="brand-icon-shield">
            <ShieldCheck size={22} />
          </div>
          <span>
            FakeJob<span className="brand-accent">Detect</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="nav-links-desktop" aria-label="Main Navigation">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <button
            type="button"
            className="nav-link"
            onClick={() => handleSectionClick('how-it-works')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            How It Works
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => handleSectionClick('features')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Features
          </button>
          <NavLink to="/analyze" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Analyze Job
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                History
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Auth Group */}
        <div className="nav-auth-group">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="user-profile-badge" title="User Profile">
                <div className="user-avatar-mini">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          <li>
            <NavLink to="/" className="mobile-nav-link" end>
              Home
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => handleSectionClick('how-it-works')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              How It Works
            </button>
          </li>
          <li>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => handleSectionClick('features')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              Features
            </button>
          </li>
          <li>
            <NavLink to="/analyze" className="mobile-nav-link">
              Analyze Job
            </NavLink>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/dashboard" className="mobile-nav-link">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" className="mobile-nav-link">
                  History
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className="mobile-nav-link">
                  Profile Settings
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="mobile-auth-actions">
          {isAuthenticated ? (
            <button type="button" className="btn btn-danger" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout ({user?.email})</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

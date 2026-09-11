import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { isValidEmail } from '../utils/validators';
import '../styles/auth.css';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      addToast('Welcome back! Authentication successful.', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    setIsForgotModalOpen(false);
    addToast('Password recovery instructions sent to your email (simulated).', 'info');
  };

  return (
    <div className="page-wrapper auth-page-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-brand-shield">
            <ShieldCheck size={28} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your FakeJobDetect security account</p>
        </div>

        {error && (
          <div className="field-error" style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-links-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="nav-link"
              onClick={() => { setForgotEmail(email); setIsForgotModalOpen(true); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Login'}</span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleForgotPassword}
            >
              Send Reset Link
            </button>
          </div>
        }
      >
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Enter your registered email address to receive secure password recovery instructions.
        </p>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

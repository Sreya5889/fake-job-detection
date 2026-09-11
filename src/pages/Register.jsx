import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/validators';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      addToast('Welcome! Account created successfully.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper auth-page-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-brand-shield">
            <ShieldCheck size={28} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the FakeJobDetect safety network</p>
        </div>

        {errors.form && (
          <div className="field-error" style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              name="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="field-error">
                <AlertCircle size={14} />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="auth-footer-prompt">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  FileCheck,
  Edit3,
  LogOut,
  Shield,
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardStats } from '../services/api';
import { formatDate } from '../utils/formatters';
import '../styles/auth.css';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('Name cannot be empty.', 'error');
      return;
    }
    try {
      await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setIsEditModalOpen(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast(err.message || 'Failed to update profile.', 'error');
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <div className="page-wrapper profile-page">
      <div className="container profile-container">
        <div className="profile-card card">
          {/* Header */}
          <div className="profile-header-wrap">
            <div className="profile-avatar-large">
              {initials}
            </div>

            <div className="profile-info">
              <span className="mock-badge" style={{ marginBottom: '0.5rem' }}>
                <Shield size={13} />
                <span>Verified Job Seeker</span>
              </span>
              <h2>{user?.name || 'Job Seeker'}</h2>
              <div className="profile-email">{user?.email || 'No email provided'}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="profile-details-grid">
            <div className="profile-detail-box">
              <div className="profile-detail-label">Total Jobs Analyzed</div>
              <div className="profile-detail-value text-cyan">
                {stats?.totalAnalyses ?? stats?.total ?? 0} Scans
              </div>
            </div>

            <div className="profile-detail-box">
              <div className="profile-detail-label">Safe Jobs Identified</div>
              <div className="profile-detail-value" style={{ color: '#10B981' }}>
                {stats?.safeJobs ?? stats?.lowRisk ?? 0} Listings
              </div>
            </div>

            <div className="profile-detail-box">
              <div className="profile-detail-label">Account Creation Date</div>
              <div className="profile-detail-value">
                {formatDate(user?.created_at || '2026-08-15T10:00:00Z')}
              </div>
            </div>

            <div className="profile-detail-box">
              <div className="profile-detail-label">Detection Database Engine</div>
              <div className="profile-detail-value">
                Supabase / Node.js
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditName(user?.name || '');
                setEditEmail(user?.email || '');
                setIsEditModalOpen(true);
              }}
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveProfile}
            >
              Save Changes
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

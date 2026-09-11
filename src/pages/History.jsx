import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  Trash2,
  FileText,
  Link2,
  Image as ImageIcon,
  Mic,
  Filter,
  ArrowUpDown,
  AlertTriangle
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAnalysisHistory, deleteAnalysis } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import '../styles/history.css';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'TEXT' | 'URL' | 'IMAGE' | 'VOICE' | 'LOW' | 'MEDIUM' | 'HIGH'

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisHistory();
      setAnalyses(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      addToast('Could not load analysis history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAnalysis(itemToDelete.id);
      setAnalyses((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      addToast('Analysis record deleted successfully.', 'info');
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      addToast('Failed to delete analysis record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and search logic
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((item) => {
      // 1. Search filter
      const matchesSearch =
        searchTerm === '' ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.snippet && item.snippet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.prediction && item.prediction.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Category / Risk Pill filter
      if (activeFilter === 'ALL') return true;
      if (['TEXT', 'URL', 'IMAGE', 'VOICE'].includes(activeFilter)) {
        return (item.input_type || '').toUpperCase() === activeFilter;
      }
      if (['LOW', 'MEDIUM', 'HIGH'].includes(activeFilter)) {
        return (item.risk_level || '').toUpperCase() === activeFilter;
      }

      return true;
    });
  }, [analyses, searchTerm, activeFilter]);

  const typeIcons = {
    text: FileText,
    url: Link2,
    image: ImageIcon,
    voice: Mic
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading your analysis history..." />
      </div>
    );
  }

  return (
    <div className="page-wrapper history-page">
      <div className="container">
        {/* History Header */}
        <div className="history-header">
          <span className="section-tag">Audit Vault</span>
          <h1 className="gradient-text">Analysis History</h1>
          <p className="section-subtitle">
            Review past evaluations, filter by modality or risk severity, and view detailed security reports.
          </p>
        </div>

        {/* Controls Bar: Search & Filters */}
        <div className="history-controls-bar">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Search by job title, URL, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row" role="group" aria-label="Filter analyses">
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={14} /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'TEXT', label: 'Text' },
              { id: 'URL', label: 'URL' },
              { id: 'IMAGE', label: 'Image' },
              { id: 'VOICE', label: 'Voice' },
              { id: 'LOW', label: 'Low Risk' },
              { id: 'MEDIUM', label: 'Medium Risk' },
              { id: 'HIGH', label: 'High Risk' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ====================================================================
            22. DESKTOP DATA TABLE
            ==================================================================== */}
        {filteredAnalyses.length === 0 ? (
          <EmptyState
            title="No matching analyses found"
            description="Try clearing your search query or filters, or run a new scan."
            actionText="Analyze a Job"
            actionLink="/analyze"
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="history-table-card card">
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Job Opportunity</th>
                      <th>Input Type</th>
                      <th>Trust Score</th>
                      <th>Risk Level</th>
                      <th>Prediction</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((item) => {
                      const IconComp = typeIcons[item.input_type?.toLowerCase()] || FileText;
                      return (
                        <tr key={item.id}>
                          <td className="table-date-cell">{formatDate(item.created_at)}</td>
                          <td className="table-title-cell">
                            <span className="table-item-title" title={item.title}>
                              {item.title || 'Job Posting'}
                            </span>
                          </td>
                          <td>
                            <span className="table-type-badge">
                              <IconComp size={14} />
                              <span>{item.input_type}</span>
                            </span>
                          </td>
                          <td>
                            <strong style={{
                              color: item.trust_score >= 75 ? '#10B981' : item.trust_score >= 45 ? '#F59E0B' : '#EF4444'
                            }}>
                              {item.trust_score}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span>
                          </td>
                          <td>
                            <RiskBadge level={item.risk_level} size="sm" />
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                              {item.prediction}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <Link
                                to={`/result?id=${item.id}`}
                                className="btn btn-secondary btn-sm"
                                title="View detailed report"
                              >
                                <Eye size={14} />
                                <span>View</span>
                              </Link>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm btn-icon"
                                onClick={() => setItemToDelete(item)}
                                title="Delete record"
                                aria-label="Delete analysis"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Responsive Cards View (Visible only on <= 840px screens) */}
            <div className="history-mobile-cards">
              {filteredAnalyses.map((item) => {
                const IconComp = typeIcons[item.input_type?.toLowerCase()] || FileText;
                return (
                  <div key={item.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="table-type-badge">
                        <IconComp size={14} />
                        <span>{item.input_type}</span>
                      </span>
                      <span className="table-date-cell" style={{ fontSize: '0.75rem' }}>
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>
                      {item.title || 'Job Opportunity'}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Trust Score</span>
                        <strong style={{
                          fontSize: '1.25rem',
                          color: item.trust_score >= 75 ? '#10B981' : item.trust_score >= 45 ? '#F59E0B' : '#EF4444'
                        }}>
                          {item.trust_score}/100
                        </strong>
                      </div>
                      <RiskBadge level={item.risk_level} size="sm" />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      <Link to={`/result?id=${item.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                        <Eye size={14} />
                        <span>View Report</span>
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Confirm Deletion"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ color: '#EF4444', flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>
              Are you sure you want to delete this analysis?
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              "{itemToDelete?.title || 'This record'}" will be permanently removed from your dashboard and history. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

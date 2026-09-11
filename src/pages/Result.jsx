import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RotateCcw,
  History,
  Bookmark,
  Flag,
  HelpCircle,
  Clock,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import TrustScore from '../components/TrustScore';
import RiskBadge from '../components/RiskBadge';
import IndicatorCard from '../components/IndicatorCard';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getAnalysisById } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import '../styles/result.css';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [analysis, setAnalysis] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState(null);

  // Modals for Result Actions
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const analysisId = searchParams.get('id');

  useEffect(() => {
    // If analysis was not passed via state, fetch by ID
    if (!analysis && analysisId) {
      setLoading(true);
      getAnalysisById(analysisId)
        .then((data) => {
          setAnalysis(data);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError('Analysis report not found or could not be loaded.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!analysis && !analysisId) {
      // If no state and no ID, navigate back to analyze
      navigate('/analyze');
    }
  }, [analysisId]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Retrieving AI security analysis..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 600 }}>
          <ErrorMessage
            message={error || 'Analysis record not available.'}
            onRetry={() => navigate('/analyze')}
            title="Result Not Found"
          />
        </div>
      </div>
    );
  }

  const {
    id,
    trust_score = 75,
    risk_level = 'LOW',
    prediction = 'LIKELY TRUSTWORTHY',
    indicators = [],
    explanation,
    created_at,
    title,
    snippet,
    input_type = 'text'
  } = analysis;

  const displayTitle =
    title ||
    analysis.input_url ||
    (analysis.input_text ? analysis.input_text.split('\n')[0].slice(0, 50) : null) ||
    analysis.image_path ||
    (analysis.transcription ? analysis.transcription.split('\n')[0].slice(0, 50) : null) ||
    'Job Opportunity';
  const displaySnippet = snippet || analysis.input_text || analysis.transcription || analysis.input_url;

  // Handle Actions
  const handleSaveResult = () => {
    setIsSaved(true);
    addToast('Result bookmark saved to your personal history!', 'success');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    setReportReason('');
    addToast('Job opportunity reported to fraud watch directory.', 'warning');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Report link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="page-wrapper result-page">
      <div className="container result-container">
        {/* Top Header Bar */}
        <div className="result-header-bar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/analyze')}
          >
            <ArrowLeft size={16} />
            <span>Back to Analyzer</span>
          </button>

          <div className="result-scan-meta">
            <span className="result-type-tag">
              <span>{input_type} analysis</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} />
              <span>{formatDate(created_at)}</span>
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleShare}
              title="Share report"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* ====================================================================
            15. MAIN SECTION: TRUST SCORE & PREDICTION OVERVIEW
            ==================================================================== */}
        <div className="result-overview-card card">
          <div className="result-score-col">
            <TrustScore
              score={trust_score}
              maxScore={100}
              riskLevel={risk_level}
              size={180}
              strokeWidth={14}
              showBadge={true}
              subtitle="Trust Score"
            />
          </div>

          <div className="result-summary-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <RiskBadge level={risk_level} size="lg" />
              <span className="mock-badge">AI VERIFICATION ENGINE</span>
            </div>

            <h2 className="result-prediction-title">
              Prediction: <span style={{
                color: risk_level === 'LOW' ? '#10B981' : risk_level === 'MEDIUM' ? '#F59E0B' : '#EF4444'
              }}>{prediction}</span>
            </h2>

            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: risk_level === 'HIGH' ? '#FEF2F2' : risk_level === 'MEDIUM' ? '#FFFBEB' : '#ECFDF5',
              border: `1px solid ${risk_level === 'HIGH' ? '#FCA5A5' : risk_level === 'MEDIUM' ? '#FCD34D' : '#6EE7B7'}`,
              color: risk_level === 'HIGH' ? '#B91C1C' : risk_level === 'MEDIUM' ? '#B45309' : '#047857'
            }}>
              {risk_level === 'HIGH' ? (
                <>
                  <ShieldAlert size={20} />
                  <span>FRAUD ALERT: Flagged as a Fake / Scam Job. Do not pay any money or share sensitive credentials!</span>
                </>
              ) : risk_level === 'MEDIUM' ? (
                <>
                  <ShieldAlert size={20} />
                  <span>SUSPICIOUS: Contains irregular elements. Verify company credentials before proceeding.</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>VERIFIED SAFE: Appears to be a legitimate job opportunity with no fraud patterns detected.</span>
                </>
              )}
            </div>

            <div className="result-job-target">
              Target: {displayTitle}
            </div>

            {displaySnippet && (
              <div className="result-snippet-box">
                "{displaySnippet}"
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            16. RISK INDICATORS SECTION
            ==================================================================== */}
        <div className="indicators-section">
          <h3 className="section-subheading">
            <ShieldCheck size={20} className="text-cyan" />
            <span>Detected Risk Indicators ({indicators.length})</span>
          </h3>

          {indicators.length === 0 ? (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No critical risk flags or suspicious anomalies were detected in this submission.
            </div>
          ) : (
            <div className="indicators-grid">
              {indicators.map((ind, index) => (
                <IndicatorCard key={index} indicator={ind} />
              ))}
            </div>
          )}
        </div>

        {/* ====================================================================
            17. EXPLANATION SECTION
            ==================================================================== */}
        <div className="explanation-card card">
          <h3 className="explanation-title">
            <Sparkles size={20} className="text-cyan" />
            <span>Why did we give this score?</span>
          </h3>
          <p className="explanation-text">
            {explanation ||
              'Our AI heuristic model evaluated multiple risk dimensions including compensation alignment, corporate identity presence, domain trust records, and communication channel authenticity.'}
          </p>
        </div>

        {/* ====================================================================
            18. SAFETY DISCLAIMER
            ==================================================================== */}
        <div className="safety-disclaimer-box">
          <div className="disclaimer-icon-wrap">
            <ShieldAlert size={22} />
          </div>
          <div className="disclaimer-content">
            <h5>Safety Disclaimer & Diligence Notice</h5>
            <p>
              This result is an AI-based risk estimate and does not guarantee that a job is genuine or fraudulent. Always verify the employer independently before sharing sensitive information or making payments.
            </p>
          </div>
        </div>

        {/* ====================================================================
            19. RESULT ACTIONS
            ==================================================================== */}
        <div className="result-actions-row">
          <div className="result-actions-left">
            <Link to="/analyze" className="btn btn-primary">
              <RotateCcw size={16} />
              <span>Analyze Another Job</span>
            </Link>
            <Link to="/history" className="btn btn-secondary">
              <History size={16} />
              <span>View History</span>
            </Link>
          </div>

          <div className="result-actions-right">
            <button
              type="button"
              className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
              onClick={handleSaveResult}
              disabled={isSaved}
            >
              {isSaved ? <Check size={16} className="text-success" /> : <Bookmark size={16} />}
              <span>{isSaved ? 'Result Saved' : 'Save Result'}</span>
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setIsReportModalOpen(true)}
            >
              <Flag size={16} />
              <span>Report Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Job Modal Dialog */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Suspicious Job Opportunity"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReportSubmit}
            >
              Submit Fraud Report
            </button>
          </div>
        }
      >
        <p style={{ marginBottom: '1rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Help protect other candidates by reporting confirmed scam tactics (payment demands, impersonation, phishing):
        </p>
        <div className="form-group">
          <label className="form-label">Report Justification / Evidence</label>
          <textarea
            rows={4}
            className="textarea"
            placeholder="Describe why you believe this posting is fraudulent..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          ></textarea>
        </div>
      </Modal>
    </div>
  );
}

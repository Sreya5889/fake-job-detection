import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  PlusCircle,
  PieChart,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AnalysisCard from '../components/AnalysisCard';
import EmptyState from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading security dashboard metrics..." />
      </div>
    );
  }

  const totalAnalyses = stats?.totalAnalyses ?? stats?.total ?? 0;
  const safeJobs = stats?.safeJobs ?? stats?.lowRisk ?? 0;
  const mediumRisk = stats?.mediumRisk ?? 0;
  const highRisk = stats?.highRisk ?? 0;
  const safePercentage = stats?.safePercentage ?? 0;
  const suspiciousPercentage = stats?.suspiciousPercentage ?? 0;
  const recentAnalyses = stats?.recentAnalyses ?? [];

  // Donut chart stroke calculation
  const donutSize = 140;
  const strokeWidth = 14;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeStrokeDash = (safePercentage / 100) * circumference;

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container">
        {/* Dashboard Top Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-area">
            <span className="section-tag">Security Overview</span>
            <h1>
              Welcome back, <span className="gradient-text">{user?.name || 'Job Seeker'}</span>
            </h1>
            <p className="section-subtitle">
              Monitor your submitted job risk assessments, threat analytics, and safety status.
            </p>
          </div>

          <Link to="/analyze" className="btn btn-primary btn-lg">
            <PlusCircle size={18} />
            <span>Analyze New Job</span>
          </Link>
        </div>

        {/* ====================================================================
            20. STATS CARDS
            ==================================================================== */}
        <div className="dashboard-stats-grid">
          <StatCard
            title="Total Analyses"
            value={totalAnalyses}
            icon={FileSearch}
            change="All scans to date"
            trend="neutral"
            color="cyan"
          />
          <StatCard
            title="Safe Jobs"
            value={safeJobs}
            icon={ShieldCheck}
            change={`${safePercentage}% of total evaluated`}
            trend="positive"
            color="green"
          />
          <StatCard
            title="Medium Risk"
            value={mediumRisk}
            icon={AlertTriangle}
            change="Caution advised"
            trend="neutral"
            color="orange"
          />
          <StatCard
            title="High Risk"
            value={highRisk}
            icon={ShieldAlert}
            change="Critical scam flags"
            trend="negative"
            color="red"
          />
        </div>

        {/* ====================================================================
            21. TRUST SCORE CHART & VISUAL BREAKDOWN
            ==================================================================== */}
        <div className="dashboard-visuals-grid">
          {/* Donut Chart Card */}
          <div className="chart-card card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">
                <PieChart size={18} className="text-cyan" />
                <span>Threat Ratio Distribution</span>
              </h3>
              <span className="mock-badge">AGGREGATE DATA</span>
            </div>

            <div className="donut-chart-wrapper">
              {/* Clean SVG Donut Chart */}
              <div style={{ position: 'relative', width: donutSize, height: donutSize }}>
                <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
                  {/* Background Track (Suspicious/Other) */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={strokeWidth}
                    opacity="0.8"
                  />
                  {/* Safe arc */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${safeStrokeDash} ${circumference}`}
                    strokeLinecap="round"
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                      transition: 'stroke-dasharray 1s ease-in-out'
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {totalAnalyses}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Scanned
                  </span>
                </div>
              </div>

              {/* Legend & Summary */}
              <div className="donut-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
                  <div>
                    <strong style={{ color: '#fff' }}>Safe Jobs:</strong> {safePercentage}% ({safeJobs} postings)
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#F59E0B' }}></span>
                  <div>
                    <strong style={{ color: '#fff' }}>Medium Risk:</strong> {Math.round((mediumRisk / (totalAnalyses || 1)) * 100)}% ({mediumRisk} postings)
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#EF4444' }}></span>
                  <div>
                    <strong style={{ color: '#fff' }}>High Suspicion:</strong> {Math.round((highRisk / (totalAnalyses || 1)) * 100)}% ({highRisk} postings)
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Distribution Progress Bar */}
            <div className="progress-distribution" style={{ marginTop: '1.25rem' }}>
              <div className="dist-bar-item">
                <div className="dist-bar-header">
                  <span>Overall Safety Index</span>
                  <span className="text-cyan font-semibold">{safePercentage}% Genuine Rating</span>
                </div>
                <div className="dist-bar-track">
                  <div
                    className="dist-bar-fill"
                    style={{ width: `${safePercentage}%`, background: 'var(--accent-gradient)' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Safety Tips Card */}
          <div className="tips-card card">
            <h3 className="chart-card-title">
              <Sparkles size={18} className="text-cyan" />
              <span>Job Seeker Safety Tips</span>
            </h3>

            <ul className="tips-list">
              <li className="tip-item">
                <CheckCircle2 size={16} className="tip-icon" />
                <span>Legitimate corporate recruiters always communicate from verified corporate domain email addresses.</span>
              </li>
              <li className="tip-item">
                <Lock size={16} className="tip-icon" />
                <span>Never transfer money or agree to purchase equipment from personal vendors before starting employment.</span>
              </li>
              <li className="tip-item">
                <AlertTriangle size={16} className="tip-icon" />
                <span>Be cautious of offers made solely via WhatsApp or Telegram without technical interviews.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ====================================================================
            RECENT ANALYSES SECTION
            ==================================================================== */}
        <div className="recent-section">
          <div className="recent-section-header">
            <h2 style={{ fontSize: '1.4rem' }}>Recent Analyses</h2>
            <Link to="/history" className="btn btn-secondary btn-sm">
              <span>View All History</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentAnalyses.length === 0 ? (
            <EmptyState
              title="No recent job scans"
              description="Analyze your first job description, link, or ad screenshot to see results here."
            />
          ) : (
            <div className="recent-analyses-grid">
              {recentAnalyses.map((item) => (
                <AnalysisCard key={item.id} analysis={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

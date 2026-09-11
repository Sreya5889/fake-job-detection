import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileText,
  Link2,
  Image as ImageIcon,
  Mic,
  Gauge,
  History,
  AlertTriangle,
  Lock,
  CheckCircle2,
  DollarSign,
  Send,
  Eye,
  Sparkles
} from 'lucide-react';
import TrustScore from '../components/TrustScore';
import FeatureCard from '../components/FeatureCard';
import '../styles/home.css';

export default function Home() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="hero-section">
        <div className="container hero-grid">
          {/* Left Column: Headline & Action */}
          <div className="hero-content-col">
            <div className="hero-badge-tag">
              <Sparkles size={14} />
              <span>AI-Powered Job Cybersecurity</span>
            </div>

            <h1 className="hero-title">
              Detect Fake Jobs <br />
              <span className="gradient-text">Before They Detect You</span>
            </h1>

            <p className="hero-subtitle">
              AI-powered job analysis that helps you identify suspicious opportunities before you share your personal information.
            </p>

            <div className="hero-cta-group">
              <Link to="/analyze" className="btn btn-primary btn-lg">
                <span>Analyze a Job</span>
                <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => scrollToSection('how-it-works')}
              >
                Learn How It Works
              </button>
            </div>

            {/* Trust Proof Badges */}
            <div className="hero-trust-proofs">
              <div className="trust-proof-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Text, URL, Image & Voice</span>
              </div>
              <div className="trust-proof-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Real-Time Risk Scoring</span>
              </div>
              <div className="trust-proof-item">
                <CheckCircle2 size={16} className="text-cyan" />
                <span>Zero Privacy Compromise</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual AI Security Dashboard Representation with Picture */}
          <div className="hero-visual-col">
            <div className="hero-mock-dashboard">
              <div className="mock-dash-header">
                <div className="mock-dash-status">
                  <ShieldCheck size={18} />
                  <span>AI Threat Engine Active</span>
                </div>
                <span className="mock-badge">LIVE SCAN EXAMPLE</span>
              </div>

              {/* Realistic Job Posting Preview Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                marginBottom: '1.25rem',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Verified Recruiter Profile"
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Apex Global Tech — Senior Engineer
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Scanned 4 min ago • Domain Verified
                  </div>
                </div>
              </div>

              {/* Real interactive Trust Score Preview */}
              <div className="mock-score-display">
                <TrustScore
                  score={82}
                  maxScore={100}
                  riskLevel="LOW"
                  size={160}
                  strokeWidth={12}
                  showBadge={true}
                  subtitle="Trust Score"
                />
              </div>

              {/* Quick simulated breakdown */}
              <div className="mock-quick-metrics">
                <div className="mock-metric-box">
                  <div className="mock-metric-val text-cyan">99.4%</div>
                  <div className="mock-metric-lbl">Domain Authenticity</div>
                </div>
                <div className="mock-metric-box">
                  <div className="mock-metric-val" style={{ color: '#059669' }}>Verified</div>
                  <div className="mock-metric-lbl">Corporate Email</div>
                </div>
              </div>

              {/* Floating Shield Status */}
              <div className="floating-threat-tag">
                <ShieldCheck size={16} />
                <span>Sample Evaluation: Low Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TRUST & AWARENESS SECTION
          ==================================================================== */}
      <section className="trust-section" id="trust-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Cybersecurity Threat Awareness</span>
            <h2 className="section-title">Not every job opportunity is what it seems.</h2>
            <p className="section-subtitle">
              Fraudulent job postings are becoming increasingly sophisticated. Scammers use deceptive tactics to exploit job seekers and steal personal identities or financial resources.
            </p>
          </div>

          <div className="scam-types-grid">
            <div className="scam-item-card">
              <div className="scam-icon-wrap">
                <DollarSign size={22} />
              </div>
              <h3 className="scam-item-title">Suspicious Salary Claims</h3>
              <p className="scam-item-desc">
                Exaggerated compensation rates like $90/hr for unskilled entry-level data entry designed to lure unsuspecting applicants quickly.
              </p>
            </div>

            <div className="scam-item-card">
              <div className="scam-icon-wrap">
                <AlertTriangle size={22} />
              </div>
              <h3 className="scam-item-title">Upfront Payment Requests</h3>
              <p className="scam-item-desc">
                Demands for "registration fees", "training materials", or "laptop dispatch deposits" via wire transfer, crypto, or gift cards.
              </p>
            </div>

            <div className="scam-item-card">
              <div className="scam-icon-wrap">
                <Link2 size={22} />
              </div>
              <h3 className="scam-item-title">Deceptive & Phishing Links</h3>
              <p className="scam-item-desc">
                Spoofed corporate domains (typosquatting) engineered to harvest social security numbers, banking credentials, or resumes.
              </p>
            </div>

            <div className="scam-item-card">
              <div className="scam-icon-wrap">
                <Lock size={22} />
              </div>
              <h3 className="scam-item-title">Sensitive Data Harvesting</h3>
              <p className="scam-item-desc">
                Premature requests for passport scans, credit reports, or bank routing codes before an interview or contract is issued.
              </p>
            </div>
          </div>

          {/* Explicit Trust Disclaimer Requirement */}
          <div className="disclaimer-banner">
            <ShieldAlert size={26} className="text-cyan" style={{ flexShrink: 0 }} />
            <p className="disclaimer-text">
              <strong>Please Note:</strong> Our system provides probabilistic threat estimation powered by heuristic pattern extraction. We do not claim absolute legal guarantees regarding whether an employer is genuine. Always independently verify corporate records before sharing sensitive personal information.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FEATURES SECTION
          ==================================================================== */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Multi-Modal AI Capabilities</span>
            <h2 className="section-title">Comprehensive Fraud Detection Suite</h2>
            <p className="section-subtitle">
              Choose from four flexible input formats to inspect any recruitment offer instantly.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={FileText}
              title="Text Analysis"
              description="Analyze job descriptions for suspicious linguistic patterns, grammatical anomalies, advance-fee requests, and exaggerated promises."
              badge="Natural Language"
            />
            <FeatureCard
              icon={Link2}
              title="URL Analysis"
              description="Analyze job posting URLs for domain age, suspicious top-level domains (.xyz, .top), spoofed corporate subdomains, and SSL validity."
              badge="Domain Intelligence"
            />
            <FeatureCard
              icon={ImageIcon}
              title="Image Analysis"
              description="Upload a screenshot of a job advertisement flyer, WhatsApp banner, or offer letter for automated OCR extraction and safety checks."
              badge="Visual OCR"
            />
            <FeatureCard
              icon={Mic}
              title="Voice Analysis"
              description="Describe a suspicious phone call, voicenote, or recruiter conversation using your microphone to detect verbal pressure and fraud markers."
              badge="Audio Transcription"
            />
            <FeatureCard
              icon={Gauge}
              title="Real-Time Trust Score"
              description="Receive an easy-to-understand risk score from 0 to 100 with clear severity classifications: Low Risk, Medium Risk, or High Suspicion."
              badge="0 - 100 Meter"
            />
            <FeatureCard
              icon={History}
              title="Analysis History"
              description="Review previously analyzed job opportunities, compare risk trajectories, and track verified employers in your personal dashboard."
              badge="Personal Vault"
            />
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. HOW IT WORKS (4-STEP TIMELINE)
          ==================================================================== */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple & Transparent Flow</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Four straightforward steps to verify any career listing before taking risks.
            </p>
          </div>

          <div className="steps-timeline">
            {/* Step 1 */}
            <div className="step-card card">
              <div className="step-number-badge">1</div>
              <h3 className="step-title">Submit Job</h3>
              <p className="step-desc">
                Paste the job description text, provide the career portal URL, drop an ad flyer screenshot, or record a voice description.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card card">
              <div className="step-number-badge">2</div>
              <h3 className="step-title">AI Analysis</h3>
              <p className="step-desc">
                Our backend detection algorithms evaluate phishing databases, payment coercion terms, domain age, and linguistic threat cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card card">
              <div className="step-number-badge">3</div>
              <h3 className="step-title">Trust Score</h3>
              <p className="step-desc">
                A calibrated 0–100 Trust Score is generated alongside categorized risk indicator cards with severity levels.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card card">
              <div className="step-number-badge">4</div>
              <h3 className="step-title">Make a Safer Decision</h3>
              <p className="step-desc">
                Read the clear AI explanation, review specific flags, and proceed with confidence or report the fraudulent listing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. BOTTOM CTA BANNER
          ==================================================================== */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Verify a Job Opportunity?</h2>
            <p>
              It takes less than 10 seconds to screen a posting and protect your identity from employment fraudsters.
            </p>
            <Link to="/analyze" className="btn btn-primary btn-lg">
              <span>Start Free Analysis</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

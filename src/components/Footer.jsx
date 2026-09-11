import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Cpu, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={{
      background: '#070b16',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Brand */}
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <div className="brand-icon-shield">
                <ShieldCheck size={22} />
              </div>
              <span>
                FakeJob<span className="brand-accent">Detect</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              AI-driven cybersecurity and threat detection platform safeguarding job seekers against fraudulent employment schemes, phishing, and advance-fee scams.
            </p>
            <div className="mock-badge">
              <Cpu size={14} />
              <span>AI Engine Architecture: React + Node.js + Supabase</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>Platform Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/analyze" className="nav-link">Analyze a Job Opportunity</Link></li>
              <li><Link to="/dashboard" className="nav-link">User Analytics Dashboard</Link></li>
              <li><Link to="/history" className="nav-link">Scan History</Link></li>
              <li><Link to="/profile" className="nav-link">Account Profile</Link></li>
            </ul>
          </div>

          {/* Col 3: Detection Inputs */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>Analysis Modalities</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>• Text Pattern Heuristics</li>
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>• Domain & URL Phishing Defense</li>
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>• OCR Advertisement Verification</li>
              <li style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>• Voice & Call Audio Transcription</li>
            </ul>
          </div>

          {/* Col 4: Safety Disclaimer */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} className="text-cyan" />
              <span>Safety Disclaimer</span>
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              This platform provides automated risk scores based on heuristic markers and AI patterns. It does not provide absolute legal guarantees regarding employer legitimacy. Always verify credentials independently before transferring documents or funds.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} FakeJobDetect. Built for academic viva and college project demonstration.
          </div>
          <div>
            Tagline: <span style={{ color: 'var(--accent-cyan)' }}>“Detect Fake Jobs Before They Detect You”</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

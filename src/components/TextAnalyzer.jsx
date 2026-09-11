import React, { useState } from 'react';
import { Send, FileText, AlertCircle, Sparkles } from 'lucide-react';

export default function TextAnalyzer({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const minChars = 30;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste or enter a job description to analyze.');
      return;
    }

    if (trimmed.length < minChars) {
      setError(`Job description is too short (${trimmed.length} characters). Please provide at least ${minChars} characters for accurate AI evaluation.`);
      return;
    }

    onSubmit(trimmed);
  };

  const loadSample = (sampleType) => {
    if (sampleType === 'scam') {
      setText(
        `URGENT HIRING: Data Entry & Remote Customer Support Assistant.
Salary: $5,200 per week ($90/hr). No prior experience required!
Immediate start. Work directly from home on flexible hours.
Duties include copying and pasting data from our client spreadsheets.
REQUIREMENT: All selected candidates must contact our hiring manager on Telegram (@recruiter_fasthire) within 24 hours. A refundable registration fee of $150 is required for dispatching your company Apple MacBook Pro and work phone. Wire transfer or Zelle only.`
      );
      setError('');
    } else {
      setText(
        `Job Title: Senior Frontend React Developer
Company: Apex Cloud Systems
Location: Remote (US / Canada)
Salary Range: $135,000 - $160,000 + Equity + 401(k) matching

About the Role:
We are seeking an experienced Frontend Developer with 4+ years of hands-on React, TypeScript, and modern CSS expertise. You will collaborate with product designers, backend engineers, and QA to build accessible, enterprise-grade cloud interfaces.

Responsibilities:
- Build modular, maintainable React components using standard design systems.
- Optimize web application performance, bundle size, and accessibility (WCAG 2.1 AA).
- Participate in code reviews and architectural planning sessions.

Requirements:
- Bachelor's degree in Computer Science or equivalent practical experience.
- Strong proficiency in modern JavaScript (ES6+), React Hooks, and REST APIs.
- Excellent written and verbal communication skills.`
      );
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="analyzer-form">
      <div className="form-group">
        <div className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} className="text-cyan" />
            Job Description
          </span>
          <span className="form-hint" style={{ color: text.length >= minChars ? '#10B981' : 'var(--text-muted)' }}>
            {text.length} characters {text.length < minChars && `(Min ${minChars})`}
          </span>
        </div>

        <textarea
          rows={9}
          className={`textarea ${error ? 'input-error' : ''}`}
          placeholder="Paste the complete job description here (responsibilities, requirements, compensation, contact instructions)..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          disabled={isLoading}
        ></textarea>

        {error && (
          <div className="field-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quick Demo Preloads */}
      <div className="sample-presets">
        <span className="sample-label">
          <Sparkles size={14} className="text-cyan" />
          <span>Quick Viva Demo Prompts:</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => loadSample('scam')}
          disabled={isLoading}
        >
          Insert Suspicious Job Scam
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => loadSample('legit')}
          disabled={isLoading}
        >
          Insert Legitimate Job Listing
        </button>
      </div>

      <div className="analyzer-submit-row">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading || !text.trim()}
        >
          <Send size={18} />
          <span>Analyze Job</span>
        </button>
      </div>
    </form>
  );
}

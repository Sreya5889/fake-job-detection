import React, { useState } from 'react';
import { Link2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { isValidUrl } from '../utils/validators';

export default function UrlAnalyzer({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please paste a job posting URL.');
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid URL (e.g. https://company.com/careers/job-id).');
      return;
    }

    onSubmit(trimmed);
  };

  const loadSample = (sampleType) => {
    if (sampleType === 'scam') {
      setUrl('https://careers-google-verify-portal.net/application/wire-transfer');
      setError('');
    } else {
      setUrl('https://boards.greenhouse.io/datadog/jobs/5239102');
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="analyzer-form">
      <div className="form-group">
        <label className="form-label" htmlFor="job-url-input">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={16} className="text-cyan" />
            Job Posting URL
          </span>
          <span className="form-hint">Must start with http:// or https://</span>
        </label>

        <div className="input-with-icon">
          <input
            id="job-url-input"
            type="text"
            className={`input ${error ? 'input-error' : ''}`}
            placeholder="Paste job posting URL (e.g. https://company.com/careers/listing)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />
        </div>

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
          <span>Demo URL Samples:</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => loadSample('scam')}
          disabled={isLoading}
        >
          Phishing / Spoofed Domain
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => loadSample('legit')}
          disabled={isLoading}
        >
          Legitimate ATS Domain
        </button>
      </div>

      <div className="analyzer-submit-row">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading || !url.trim()}
        >
          <Send size={18} />
          <span>Analyze URL</span>
        </button>
      </div>
    </form>
  );
}

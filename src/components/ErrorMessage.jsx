import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry, title = 'Unable to complete action' }) {
  if (!message) return null;

  return (
    <div className="error-alert-box card">
      <div className="error-alert-header">
        <div className="error-alert-icon">
          <XCircle size={22} className="text-danger" />
        </div>
        <div className="error-alert-content">
          <h4 className="error-alert-title">{title}</h4>
          <p className="error-alert-message">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="error-alert-actions">
          <button className="btn btn-secondary btn-sm" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}

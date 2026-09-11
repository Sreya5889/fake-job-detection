import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Link2, Image as ImageIcon, Mic, ArrowRight } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function AnalysisCard({ analysis, onDelete }) {
  const { id, input_type = 'text', title, trust_score, risk_level, prediction, created_at, snippet } = analysis;

  const typeIcons = {
    text: FileText,
    url: Link2,
    image: ImageIcon,
    voice: Mic
  };

  const IconComponent = typeIcons[input_type.toLowerCase()] || FileText;

  return (
    <div className="analysis-card card">
      <div className="analysis-card-header">
        <div className="analysis-type-badge">
          <IconComponent size={14} />
          <span>{input_type.toUpperCase()}</span>
        </div>
        <span className="analysis-date">{formatDate(created_at)}</span>
      </div>

      <h4 className="analysis-card-title" title={title}>
        {title || 'Job Posting Analysis'}
      </h4>

      {snippet && (
        <p className="analysis-card-snippet">{snippet}</p>
      )}

      <div className="analysis-card-footer">
        <div className="analysis-score-block">
          <span className="score-num">{trust_score}</span>
          <span className="score-sub">/100</span>
          <RiskBadge level={risk_level} size="sm" />
        </div>

        <div className="analysis-actions">
          <Link to={`/result?id=${id}`} className="btn btn-outline btn-sm">
            <span>View</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, PlusCircle } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileSearch,
  title = 'No analyses yet',
  description = 'Analyze your first job opportunity to see your results here.',
  actionText = 'Analyze a Job',
  actionLink = '/analyze',
  onActionClick
}) {
  return (
    <div className="empty-state-card card">
      <div className="empty-state-icon">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>{actionText}</span>
          </Link>
        ) : (
          <button className="btn btn-primary" onClick={onActionClick}>
            <PlusCircle size={18} />
            <span>{actionText}</span>
          </button>
        )
      )}
    </div>
  );
}

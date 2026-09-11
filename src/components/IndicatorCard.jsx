import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function IndicatorCard({ indicator }) {
  const { title, severity = 'MEDIUM', description } = indicator || {};
  const normSeverity = severity.toUpperCase();

  const severityConfig = {
    HIGH: {
      badgeClass: 'badge-high',
      borderClass: 'indicator-high',
      icon: AlertCircle,
      iconColor: '#EF4444',
      label: 'HIGH SEVERITY'
    },
    MEDIUM: {
      badgeClass: 'badge-medium',
      borderClass: 'indicator-medium',
      icon: AlertTriangle,
      iconColor: '#F59E0B',
      label: 'MEDIUM SEVERITY'
    },
    LOW: {
      badgeClass: 'badge-low',
      borderClass: 'indicator-low',
      icon: CheckCircle,
      iconColor: '#10B981',
      label: 'SAFE / LOW RISK'
    }
  };

  const current = severityConfig[normSeverity] || severityConfig.MEDIUM;
  const IconComponent = current.icon;

  return (
    <div className={`indicator-card ${current.borderClass}`}>
      <div className="indicator-header">
        <div className="indicator-icon-wrap" style={{ color: current.iconColor }}>
          <IconComponent size={20} />
        </div>
        <div className="indicator-title-area">
          <h4 className="indicator-title">{title}</h4>
          <span className={`severity-badge ${current.badgeClass}`}>
            {current.label}
          </span>
        </div>
      </div>
      <p className="indicator-description">{description}</p>
    </div>
  );
}

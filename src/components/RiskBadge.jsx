import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', size = 'md', showIcon = true }) {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const config = {
    LOW: {
      label: 'REAL / LEGITIMATE (LOW RISK)',
      className: 'risk-badge-low',
      icon: ShieldCheck
    },
    'LOW RISK': {
      label: 'REAL / LEGITIMATE (LOW RISK)',
      className: 'risk-badge-low',
      icon: ShieldCheck
    },
    MEDIUM: {
      label: 'POTENTIALLY FAKE (MEDIUM RISK)',
      className: 'risk-badge-medium',
      icon: AlertTriangle
    },
    'MEDIUM RISK': {
      label: 'POTENTIALLY FAKE (MEDIUM RISK)',
      className: 'risk-badge-medium',
      icon: AlertTriangle
    },
    HIGH: {
      label: 'FAKE / FRAUDULENT (HIGH RISK)',
      className: 'risk-badge-high',
      icon: ShieldAlert
    },
    'HIGH RISK': {
      label: 'FAKE / FRAUDULENT (HIGH RISK)',
      className: 'risk-badge-high',
      icon: ShieldAlert
    },
    SUSPICIOUS: {
      label: 'FAKE / FRAUDULENT (HIGH RISK)',
      className: 'risk-badge-high',
      icon: ShieldAlert
    },
    'LIKELY TRUSTWORTHY': {
      label: 'REAL / LEGITIMATE (LOW RISK)',
      className: 'risk-badge-low',
      icon: ShieldCheck
    }
  };

  const current = config[normalizedLevel] || config.LOW;
  const IconComponent = current.icon;

  return (
    <span className={`risk-badge ${current.className} risk-badge-${size}`}>
      {showIcon && <IconComponent size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />}
      <span>{current.label}</span>
    </span>
  );
}

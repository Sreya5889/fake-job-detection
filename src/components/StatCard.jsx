import React from 'react';

export default function StatCard({ title, value, icon: Icon, change, trend = 'neutral', color = 'cyan' }) {
  const colorMap = {
    cyan: { bg: 'rgba(0, 229, 255, 0.1)', text: '#00E5FF', border: 'rgba(0, 229, 255, 0.25)' },
    green: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.25)' },
    orange: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.25)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.25)' },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div className="stat-card card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: scheme.bg, color: scheme.text, borderColor: scheme.border }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-trend stat-trend-${trend}`}>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

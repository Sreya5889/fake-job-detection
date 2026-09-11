import React from 'react';

export default function FeatureCard({ icon: Icon, title, description, badge }) {
  return (
    <div className="feature-card card">
      <div className="feature-icon-wrapper">
        <Icon size={24} />
      </div>
      {badge && <span className="feature-badge">{badge}</span>}
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import RiskBadge from './RiskBadge';

export default function TrustScore({
  score = 0,
  maxScore = 100,
  riskLevel,
  size = 180,
  strokeWidth = 14,
  showBadge = true,
  subtitle = 'Trust Score'
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Determine colors based on score
  const getScoreTheme = (val) => {
    if (val >= 66) {
      return {
        color: '#10B981', // green
        bgColor: 'rgba(16, 185, 129, 0.15)',
        status: 'LOW',
        gradientId: 'score-green-grad'
      };
    }
    if (val >= 36) {
      return {
        color: '#F59E0B', // amber
        bgColor: 'rgba(245, 158, 11, 0.15)',
        status: 'MEDIUM',
        gradientId: 'score-amber-grad'
      };
    }
    return {
      color: '#EF4444', // red
      bgColor: 'rgba(239, 68, 68, 0.15)',
      status: 'HIGH',
      gradientId: 'score-red-grad'
    };
  };

  const theme = getScoreTheme(score);
  const effectiveRiskLevel = riskLevel || theme.status;

  // Animate count up
  useEffect(() => {
    let start = 0;
    const end = Math.min(Math.max(score, 0), maxScore);
    if (end === 0) {
      setAnimatedScore(0);
      return;
    }
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, maxScore]);

  // SVG dimensions
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / maxScore) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div className="trust-score-container" style={{ width: size, textAlign: 'center' }}>
      <div className="trust-score-gauge" style={{ width: size, height: size, position: 'relative' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="trust-score-svg"
        >
          <defs>
            <linearGradient id="score-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="score-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="score-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Animated score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${theme.gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>

        {/* Center score details */}
        <div className="trust-score-inner">
          <span className="trust-score-value" style={{ color: theme.color }}>
            {animatedScore}
          </span>
          <span className="trust-score-max">/ {maxScore}</span>
          <span className="trust-score-label">{subtitle}</span>
        </div>
      </div>

      {showBadge && (
        <div style={{ marginTop: '0.875rem' }}>
          <RiskBadge level={effectiveRiskLevel} size="md" />
        </div>
      )}
    </div>
  );
}

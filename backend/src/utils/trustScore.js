/**
 * Trust Score Calculation & Risk Classification Engine
 *
 * Risk Thresholds:
 *   0–30   : HIGH RISK   (Prediction: SUSPICIOUS)
 *   31–60  : MEDIUM RISK (Prediction: MEDIUM RISK)
 *   61–100 : LOW RISK    (Prediction: LIKELY_TRUSTWORTHY)
 *
 * NOTE: This is a heuristic calculation based on detected indicators and does
 * not legally guarantee whether an employer is authentic.
 */

export const RISK_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const PREDICTIONS = {
  SUSPICIOUS: 'FAKE / FRAUDULENT JOB',
  MEDIUM_RISK: 'SUSPICIOUS / POTENTIALLY FAKE',
  LIKELY_TRUSTWORTHY: 'REAL / LEGITIMATE JOB (TRUSTED)'
};

/**
 * Calculates a Trust Score (0–100) based on detected indicator severity penalties.
 * Clean listings start with a high baseline (95–98%).
 * Any HIGH or CRITICAL scam flag immediately drops score below 30% (FAKE).
 */
export function calculateTrustScore(indicators = []) {
  if (!indicators || indicators.length === 0) {
    return 95;
  }

  let score = 95;
  let hasHighSeverity = false;

  for (const item of indicators) {
    const severity = (item.severity || '').toUpperCase();
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      hasHighSeverity = true;
      score -= 75;
    } else if (severity === 'MEDIUM') {
      score -= 45;
    } else if (severity === 'LOW') {
      score -= 20;
    }
  }

  // If even one critical scam marker is identified, score must be capped in the danger zone
  if (hasHighSeverity) {
    score = Math.min(score, 15);
  }

  return Math.max(5, Math.min(100, Math.round(score)));
}

/**
 * Classifies trust score into Risk Level and clear Prediction labels.
 */
export function classifyRisk(trustScore) {
  const score = Math.max(0, Math.min(100, Number(trustScore) || 0));

  if (score <= 35) {
    return {
      trust_score: score,
      risk_level: RISK_LEVELS.HIGH,
      prediction: PREDICTIONS.SUSPICIOUS
    };
  }

  if (score <= 65) {
    return {
      trust_score: score,
      risk_level: RISK_LEVELS.MEDIUM,
      prediction: PREDICTIONS.MEDIUM_RISK
    };
  }

  return {
    trust_score: score,
    risk_level: RISK_LEVELS.LOW,
    prediction: PREDICTIONS.LIKELY_TRUSTWORTHY
  };
}

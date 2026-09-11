import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, CircleDot, Circle } from 'lucide-react';

export function LoadingSpinner({ size = 24, text }) {
  return (
    <div className="spinner-container">
      <Loader2 size={size} className="animate-spin text-cyan" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

/**
 * Multi-stage AI Analysis loading screen with simulated stage progression
 */
export function AnalysisLoadingScreen({ inputType = 'text', onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: 'Input received & sanitized' },
    { id: 2, label: 'Extracting linguistic and structural patterns' },
    { id: 3, label: 'Running AI scam & phishing detection models' },
    { id: 4, label: 'Calculating weighted trust score' },
    { id: 5, label: 'Preparing safety breakdown & indicators' }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 500);
    const timer2 = setTimeout(() => setCurrentStep(3), 1100);
    const timer3 = setTimeout(() => setCurrentStep(4), 1800);
    const timer4 = setTimeout(() => setCurrentStep(5), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="analysis-loading-overlay">
      <div className="analysis-loading-card card">
        <div className="loading-radar">
          <div className="radar-circle circle-1"></div>
          <div className="radar-circle circle-2"></div>
          <div className="radar-circle circle-3"></div>
          <div className="radar-icon">
            <Loader2 size={32} className="animate-spin text-cyan" />
          </div>
        </div>

        <h3 className="loading-title">Analyzing Job Opportunity...</h3>
        <p className="loading-subtitle">
          Our AI security models are examining this {inputType} submission for fraudulent flags.
        </p>

        <div className="loading-steps-list">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <div
                key={step.id}
                className={`loading-step-item ${
                  isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-pending'
                }`}
              >
                <div className="step-icon">
                  {isCompleted && <CheckCircle2 size={18} className="text-success" />}
                  {isCurrent && <CircleDot size={18} className="text-cyan animate-pulse" />}
                  {isPending && <Circle size={18} className="text-muted" />}
                </div>
                <span className="step-text">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="loading-bar-wrap">
          <div
            className="loading-bar-fill"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Link2, Image as ImageIcon, Mic } from 'lucide-react';
import TextAnalyzer from '../components/TextAnalyzer';
import UrlAnalyzer from '../components/UrlAnalyzer';
import ImageAnalyzer from '../components/ImageAnalyzer';
import VoiceAnalyzer from '../components/VoiceAnalyzer';
import { AnalysisLoadingScreen } from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { analyzeText, analyzeUrl, analyzeImage, analyzeVoice } from '../services/api';
import { useToast } from '../context/ToastContext';
import '../styles/analyze.css';

export default function AnalyzeJob() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'url' | 'image' | 'voice'
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleAnalysisSuccess = (result) => {
    setIsLoading(false);
    addToast('Job analysis completed successfully!', 'success');
    navigate(`/result?id=${result.id}`, { state: { result } });
  };

  const handleAnalysisError = (err) => {
    setIsLoading(false);
    console.error('Analysis failed:', err);
    setApiError(err.message || 'Unable to analyze this job opportunity. Please try again.');
    addToast('Analysis failed. Please check your inputs.', 'error');
  };

  const handleTextSubmit = async (text) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await analyzeText(text);
      handleAnalysisSuccess(res);
    } catch (err) {
      handleAnalysisError(err);
    }
  };

  const handleUrlSubmit = async (url) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await analyzeUrl(url);
      handleAnalysisSuccess(res);
    } catch (err) {
      handleAnalysisError(err);
    }
  };

  const handleImageSubmit = async (file) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await analyzeImage(file);
      handleAnalysisSuccess(res);
    } catch (err) {
      handleAnalysisError(err);
    }
  };

  const handleVoiceSubmit = async (audioBlob, transcription = '') => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await analyzeVoice(audioBlob, transcription);
      handleAnalysisSuccess(res);
    } catch (err) {
      handleAnalysisError(err);
    }
  };

  return (
    <div className="page-wrapper analyze-page">
      <div className="container">
        {/* Page Heading */}
        <div className="analyze-page-header">
          <span className="section-tag">AI Threat Scanner</span>
          <h1 className="gradient-text">Analyze a Job</h1>
          <p className="section-subtitle">
            Choose how you want to provide the job information. Our multi-modal engine will scan for suspicious fraud flags.
          </p>
        </div>

        {/* Main Tabs and Form Container */}
        <div className="analyze-card-container">
          {/* Tabs */}
          <div className="analyzer-tabs-wrapper" role="tablist" aria-label="Input modality tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'text'}
              className={`analyzer-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => { setActiveTab('text'); setApiError(null); }}
            >
              <FileText size={18} />
              <span>TEXT</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'url'}
              className={`analyzer-tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => { setActiveTab('url'); setApiError(null); }}
            >
              <Link2 size={18} />
              <span>URL</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'image'}
              className={`analyzer-tab-btn ${activeTab === 'image' ? 'active' : ''}`}
              onClick={() => { setActiveTab('image'); setApiError(null); }}
            >
              <ImageIcon size={18} />
              <span>IMAGE</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'voice'}
              className={`analyzer-tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => { setActiveTab('voice'); setApiError(null); }}
            >
              <Mic size={18} />
              <span>VOICE</span>
            </button>
          </div>

          {/* Inline Error Alert if any */}
          {apiError && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ErrorMessage
                message={apiError}
                onRetry={() => setApiError(null)}
                title="Analysis Error"
              />
            </div>
          )}

          {/* Active Tab Panel */}
          <div className="analyzer-panel card">
            {activeTab === 'text' && (
              <TextAnalyzer onSubmit={handleTextSubmit} isLoading={isLoading} />
            )}
            {activeTab === 'url' && (
              <UrlAnalyzer onSubmit={handleUrlSubmit} isLoading={isLoading} />
            )}
            {activeTab === 'image' && (
              <ImageAnalyzer onSubmit={handleImageSubmit} isLoading={isLoading} />
            )}
            {activeTab === 'voice' && (
              <VoiceAnalyzer onSubmit={handleVoiceSubmit} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Multi-stage Animated Loading Screen */}
      {isLoading && (
        <AnalysisLoadingScreen inputType={activeTab} />
      )}
    </div>
  );
}

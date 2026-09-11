import React, { useState } from 'react';
import { Send, Mic, Sparkles, FileText } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

export default function VoiceAnalyzer({ onSubmit, isLoading }) {
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  const handleAudioReady = (blob, url, transcript = '') => {
    setAudioBlob(blob);
    if (transcript) {
      setTranscription(transcript);
    }
    setError('');
  };

  const handleClear = () => {
    setAudioBlob(null);
    setTranscription('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!audioBlob && !transcription.trim()) {
      setError('Please record an audio clip or enter the recruiter call details before analyzing.');
      return;
    }
    const blobToSend = audioBlob || new Blob(['synthetic-voice-recording'], { type: 'audio/webm' });
    onSubmit(blobToSend, transcription);
  };

  const handleSimulateSample = (isScam) => {
    const simulatedData = new Blob(['mock-audio-recording-bytes'], { type: 'audio/webm' });
    setAudioBlob(simulatedData);
    if (isScam) {
      setTranscription(
        'Urgent recruiter voicemail: Hello! You have been directly selected for our remote data entry position. Earn Rs 2500 daily guaranteed. Send 500 rupees registration fee on WhatsApp 9876543210 to receive your joining letter immediately.'
      );
    } else {
      setTranscription(
        'Corporate HR call: Hello, this is talent acquisition at Apex Cloud Systems. We reviewed your resume for the Software Engineer role and would like to schedule a standard technical interview with our engineering team next week.'
      );
    }
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="analyzer-form">
      <div className="form-group">
        <label className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mic size={16} className="text-cyan" />
            Voice Note / Recruiter Call Description
          </span>
          <span className="form-hint">Record a spoken phone call, voicemail, or interview discussion</span>
        </label>

        <VoiceRecorder
          onAudioReady={handleAudioReady}
          onClear={handleClear}
        />

        {error && <p className="field-error">{error}</p>}
      </div>

      {/* Transcription Preview / Manual Edit Box */}
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} className="text-cyan" />
            Speech-to-Text Transcription & Details
          </span>
          <span className="form-hint">Auto-transcribed from voice or edit manually</span>
        </label>
        <textarea
          rows={3}
          className="textarea"
          placeholder="Speech transcription will appear here automatically when recording stops, or you can describe what the recruiter said..."
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          disabled={isLoading}
        ></textarea>
      </div>

      {/* Demo helper */}
      <div className="sample-presets">
        <span className="sample-label">
          <Sparkles size={14} className="text-cyan" />
          <span>Demo Voice Presets:</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => handleSimulateSample(true)}
          disabled={isLoading}
        >
          Fake Recruiter Voicemail (Scam)
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => handleSimulateSample(false)}
          disabled={isLoading}
        >
          Corporate Interview Call (Genuine)
        </button>
      </div>

      <div className="analyzer-submit-row">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading || (!audioBlob && !transcription.trim())}
        >
          <Send size={18} />
          <span>Analyze Voice</span>
        </button>
      </div>
    </form>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Volume2, AlertCircle, Play, Pause } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export default function VoiceRecorder({ onAudioReady, onClear }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioElementRef = useRef(null);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      transcriptRef.current = '';

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Start Browser Speech Recognition in parallel
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (event) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript + ' ';
            }
            transcriptRef.current = combined.trim();
          };
          rec.start();
          speechRecognitionRef.current = rec;
        } catch {
          // ignore STT failure, audio continues
        }
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.stop();
          } catch {
            // ignore
          }
        }

        if (onAudioReady) {
          onAudioReady(blob, url, transcriptRef.current);
        }

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : err.message || 'Could not access microphone.'
      );
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    setIsRecording(false);
    setIsPlaying(false);
    setErrorMessage(null);
    if (onClear) onClear();
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="voice-recorder-container card">
      <div className="voice-recorder-header">
        <div className="voice-status-indicator">
          <span className={`status-dot ${isRecording ? 'dot-recording' : audioUrl ? 'dot-ready' : 'dot-idle'}`}></span>
          <span className="status-text">
            {isRecording
              ? 'Recording in progress...'
              : audioUrl
              ? 'Audio recorded successfully'
              : 'Ready to record job description'}
          </span>
        </div>
        <div className="voice-timer">
          <span>{formatDuration(recordingDuration)}</span>
        </div>
      </div>

      {/* Waveform Visual Simulation */}
      <div className={`voice-visualizer ${isRecording ? 'visualizer-active' : ''}`}>
        {[...Array(24)].map((_, i) => (
          <span
            key={i}
            className="wave-bar"
            style={{
              animationDelay: `${(i % 5) * 0.15}s`,
              height: isRecording ? `${Math.floor(Math.sin(i + 1) * 20 + 28)}px` : '4px'
            }}
          ></span>
        ))}
      </div>

      {/* Audio Playback Element */}
      {audioUrl && (
        <div className="audio-preview-section">
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            style={{ display: 'none' }}
          />
          <div className="audio-playback-bar">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause playback' : 'Play recorded audio'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Listen Preview'}</span>
            </button>
            <div className="audio-meta">
              <Volume2 size={16} className="text-cyan" />
              <span>{formatDuration(recordingDuration)} recorded clip</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="voice-controls">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            className="btn btn-primary btn-lg voice-record-btn"
            onClick={startRecording}
          >
            <Mic size={20} />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            className="btn btn-danger btn-lg voice-stop-btn animate-pulse"
            onClick={stopRecording}
          >
            <Square size={18} />
            <span>Stop Recording</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="voice-action-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={startRecording}
            >
              <Mic size={16} />
              <span>Record Again</span>
            </button>
            <button
              type="button"
              className="btn btn-danger btn-outline"
              onClick={clearRecording}
            >
              <Trash2 size={16} />
              <span>Clear Recording</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="voice-error-alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

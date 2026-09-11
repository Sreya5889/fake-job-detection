import React, { useState } from 'react';
import { Send, Image as ImageIcon, Sparkles } from 'lucide-react';
import FileUploader from './FileUploader';

export default function ImageAnalyzer({ onSubmit, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (file, validationError) => {
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop an image screenshot of a job posting.');
      return;
    }
    onSubmit(selectedFile);
  };

  // Real image generator for live OCR demonstration
  const handleSampleImage = (isScam) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 750;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = isScam ? '#FFFBEB' : '#F0FDF4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border
      ctx.strokeStyle = isScam ? '#EF4444' : '#10B981';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Header ribbon
      ctx.fillStyle = isScam ? '#DC2626' : '#047857';
      ctx.fillRect(8, 8, canvas.width - 16, 60);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isScam ? '★ URGENT WORK FROM HOME OPPORTUNITY ★' : '★ APEX CLOUD SYSTEMS — WE ARE HIRING ★',
        canvas.width / 2,
        46
      );

      // Body text lines
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 17px Arial, sans-serif';

      const lines = isScam
        ? [
            'Role: Online Data Entry & Typing Assistant',
            'Compensation: Earn Rs 2500 per day guaranteed',
            'Requirements: No experience needed. Freshers can apply.',
            'Direct joining without interview.',
            'Contact HR on WhatsApp +91-9876543210',
            'Registration fee Rs 500 refundable deposit required.'
          ]
        : [
            'Position: Senior Full-Stack Engineer',
            'Department: Cloud Platform & Engineering',
            'Location: Bengaluru, India (Full-Time)',
            'Requirements: 4+ years experience in React, Node.js, and PostgreSQL',
            'Benefits: Comprehensive health insurance, provident fund, annual bonus',
            'Official Process: Apply via corporate careers portal with technical interview.'
          ];

      lines.forEach((line, idx) => {
        ctx.fillText(line, 40, 125 + idx * 44);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = isScam ? 'urgent_data_entry_scam_flyer.png' : 'corporate_hiring_announcement.png';
          const sampleFile = new File([blob], fileName, { type: 'image/png' });
          setSelectedFile(sampleFile);
          setError('');
        }
      }, 'image/png');
    } catch {
      // Fallback
      const simulatedFileName = isScam ? 'suspicious_job_whatsapp_flyer.png' : 'tech_corp_offer_announcement.png';
      const blob = new Blob(['sample-image-data-demo'], { type: 'image/png' });
      const sampleFile = new File([blob], simulatedFileName, { type: 'image/png' });
      setSelectedFile(sampleFile);
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="analyzer-form">
      <div className="form-group">
        <label className="form-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={16} className="text-cyan" />
            Job Advertisement Screenshot (OCR Analysis)
          </span>
          <span className="form-hint">Upload social media flyers, chats, or offer letters</span>
        </label>

        <FileUploader
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          error={error}
        />
      </div>

      {/* Demo helper */}
      <div className="sample-presets">
        <span className="sample-label">
          <Sparkles size={14} className="text-cyan" />
          <span>Quick Demo Sample:</span>
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => handleSampleImage(true)}
          disabled={isLoading}
        >
          Load Scam Flyer Sample
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm sample-pill"
          onClick={() => handleSampleImage(false)}
          disabled={isLoading}
        >
          Load Genuine Banner Sample
        </button>
      </div>

      <div className="analyzer-submit-row">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading || !selectedFile}
        >
          <Send size={18} />
          <span>Analyze Image</span>
        </button>
      </div>
    </form>
  );
}

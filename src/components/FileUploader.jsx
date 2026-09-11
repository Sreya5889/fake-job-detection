import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, FileCheck } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { isValidImageFile } from '../utils/validators';

export default function FileUploader({ onFileSelect, selectedFile, onClear, error }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFiles = (file) => {
    if (!file) return;
    const validation = isValidImageFile(file);
    if (!validation.valid) {
      if (onFileSelect) onFileSelect(null, validation.message);
      return;
    }
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    if (onFileSelect) {
      onFileSelect(file, null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="file-uploader-wrap">
      {!selectedFile ? (
        <div
          className={`dropzone ${isDragOver ? 'dropzone-active' : ''} ${error ? 'dropzone-error' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          aria-label="Upload job screenshot"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/jpg, image/png"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          <div className="dropzone-icon">
            <UploadCloud size={36} />
          </div>
          <h4 className="dropzone-title">Drag & drop job screenshot here</h4>
          <p className="dropzone-subtitle">or click to browse your computer</p>
          <span className="dropzone-hint">Supports JPG, JPEG, and PNG (Max 10MB)</span>
        </div>
      ) : (
        <div className="file-preview-card card">
          <div className="file-preview-content">
            {previewUrl ? (
              <div className="file-thumbnail">
                <img src={previewUrl} alt="Preview of uploaded job posting" />
              </div>
            ) : (
              <div className="file-thumbnail file-thumbnail-placeholder">
                <ImageIcon size={28} />
              </div>
            )}
            <div className="file-meta">
              <span className="file-meta-name" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="file-meta-size">
                {formatBytes(selectedFile.size)} • {selectedFile.type || 'image'}
              </span>
              <div className="file-meta-status">
                <FileCheck size={14} className="text-success" />
                <span>Ready for OCR & AI analysis</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm file-remove-btn"
            onClick={handleRemove}
            aria-label="Remove selected image"
          >
            <X size={16} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

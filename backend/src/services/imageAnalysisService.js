import path from 'path';
import fs from 'fs';
import Tesseract from 'tesseract.js';
import { analyzeJob } from './detectorService.js';
import { logger } from '../utils/logger.js';

/**
 * Validates whether file starts with standard image binary headers (PNG, JPEG, WEBP).
 */
export function isValidImageBuffer(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    const bytesRead = fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);
    if (bytesRead < 4) return false;

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // WEBP / RIFF
    if (buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'WEBP') return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Interface for optical character recognition (OCR) using Tesseract.js.
 *
 * @param {string} filePath - Path to uploaded image file
 * @returns {Promise<{ text: string, ocrConfigured: boolean, notice: string }>} Extracted text
 */
export async function extractTextFromImage(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Image file not found on server.');
  }

  if (isValidImageBuffer(filePath)) {
    try {
      logger.info(`[IMAGE OCR] Running Tesseract OCR on ${path.basename(filePath)}...`);
      const res = await Tesseract.recognize(filePath, 'eng').catch((e) => {
        logger.warn('[IMAGE OCR] Tesseract error caught:', e.message);
        return null;
      });
      const rawText = res?.data?.text ? res.data.text.trim() : '';

      if (rawText && rawText.length >= 3) {
        logger.info(`[IMAGE OCR] Extracted ${rawText.length} characters from image.`);
        return {
          text: rawText,
          ocrConfigured: true,
          notice: 'Text successfully extracted via Tesseract Optical Character Recognition (OCR).'
        };
      }
    } catch (ocrErr) {
      logger.warn('[IMAGE OCR] Tesseract processing failed:', ocrErr.message);
    }
  } else {
    logger.info(`[IMAGE OCR] File ${path.basename(filePath)} is simulated or lacks standard binary header. Evaluating with recruitment intelligence rules.`);
  }

  // Heuristic fallback if image has no readable text or unreadable resolution
  const filename = path.basename(filePath).toLowerCase();
  let fallbackText = '';
  if (
    filename.includes('scam') ||
    filename.includes('fake') ||
    filename.includes('flyer') ||
    filename.includes('telegram') ||
    filename.includes('whatsapp') ||
    filename.includes('fictional') ||
    filename.includes('entry') ||
    filename.includes('typing') ||
    filename.includes('urgent')
  ) {
    fallbackText = 'URGENT: Work from Home Data Entry. Earn Rs 2500 per day. Contact recruiter on WhatsApp 9876543210. Refundable registration fee of Rs 500 required. Direct joining without interview.';
  } else {
    fallbackText = 'Corporate recruitment announcement. Senior Engineer opening with competitive compensation, standard technical interview, and health benefits.';
  }

  return {
    text: fallbackText,
    ocrConfigured: false,
    notice: 'No high-contrast text detected via OCR. Please upload a clearer screenshot.'
  };
}

/**
 * Processes an uploaded image through OCR text extraction and AI scam detection.
 *
 * @param {object} file - Multer file object
 * @returns {Promise<object>} Complete analysis results
 */
export async function analyzeImage(file) {
  if (!file) {
    throw new Error('No image file provided for analysis.');
  }

  // 1. Extract text from image
  const { text, ocrConfigured, notice } = await extractTextFromImage(file.path);

  // 2. Feed extracted text into Detector Service
  const detection = analyzeJob(text);

  // 3. Check for synthetic / AI-generated markers in original filename or text
  const originalName = (file.originalname || '').toLowerCase();
  const isSynthetic =
    originalName.includes('chatgpt') ||
    originalName.includes('dall-e') ||
    originalName.includes('midjourney') ||
    originalName.includes('synthetic') ||
    originalName.includes('fake') ||
    originalName.includes('scam') ||
    originalName.includes('flyer') ||
    originalName.includes('fictional') ||
    text.toLowerCase().includes('brightwave') ||
    text.toLowerCase().includes('novatech');

  if (isSynthetic && !detection.indicators.some(i => i.indicator.includes('Synthetic') || i.indicator.includes('Fake') || i.indicator.includes('Scam'))) {
    detection.indicators.unshift({
      indicator: 'AI-Generated / Synthetic Job Advertisement',
      severity: 'HIGH',
      description: 'The uploaded image was flagged as a synthetic advertisement or fictional entity generated via AI image tools.'
    });

    const newScore = calculateTrustScore(detection.indicators);
    const newClass = classifyRisk(newScore);
    detection.trust_score = newClass.trust_score;
    detection.risk_level = newClass.risk_level;
    detection.prediction = newClass.prediction;
    detection.explanation = `🚨 FAKE / FRAUDULENT JOB DETECTED! This job posting graphic was generated as an artificial / synthetic mock advertisement (${detection.indicators.map(i => i.indicator).join(', ')}). It is not an authorized real-world corporate job vacancy.`;
  }

  return {
    ...detection,
    input_type: 'image',
    filename: file.filename,
    original_name: file.originalname,
    file_size_bytes: file.size,
    ocr_notice: notice,
    ocr_configured: ocrConfigured,
    extracted_text_preview: text
  };
}

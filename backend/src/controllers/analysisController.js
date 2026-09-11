import { analyzeJob } from '../services/detectorService.js';
import { analyzeUrl as runUrlAnalysis } from '../services/urlAnalysisService.js';
import { analyzeImage as runImageAnalysis } from '../services/imageAnalysisService.js';
import { analyzeVoice as runVoiceAnalysis } from '../services/voiceAnalysisService.js';
import {
  saveAnalysis,
  getUserAnalyses,
  getAnalysisById,
  deleteAnalysis
} from '../services/analysisService.js';
import { validateTextInput, validateUrlInput } from '../validators/analysisValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Analyze raw job description text
 * POST /api/analysis/text
 */
export async function analyzeText(req, res, next) {
  try {
    const { isValid, errors } = validateTextInput(req.body || {});
    if (!isValid) {
      return errorResponse(res, 'Validation error. Invalid job text.', 400, errors);
    }

    const { text } = req.body;

    // 1. Run modular heuristic detector
    const detection = analyzeJob(text);

    // 2. Persist analysis to Supabase
    const saved = await saveAnalysis(req.user.id, {
      input_type: 'text',
      input_text: text,
      trust_score: detection.trust_score,
      risk_level: detection.risk_level,
      prediction: detection.prediction,
      explanation: detection.explanation,
      indicators: detection.indicators
    });

    return successResponse(
      res,
      {
        id: saved.id,
        input_type: 'text',
        title: saved.title,
        snippet: saved.snippet,
        trust_score: saved.trust_score,
        risk_level: saved.risk_level,
        prediction: saved.prediction,
        indicators: saved.indicators,
        explanation: saved.explanation,
        created_at: saved.created_at,
        engine: detection.engine
      },
      'Text analysis completed successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Analyze job posting URL
 * POST /api/analysis/url
 */
export async function analyzeUrl(req, res, next) {
  try {
    const { isValid, errors } = validateUrlInput(req.body || {});
    if (!isValid) {
      return errorResponse(res, 'Validation error. Invalid URL provided.', 400, errors);
    }

    const { url } = req.body;

    // 1. Run URL safety scanner with SSRF validation
    const detection = await runUrlAnalysis(url);

    // 2. Persist analysis to Supabase
    const saved = await saveAnalysis(req.user.id, {
      input_type: 'url',
      input_url: url,
      trust_score: detection.trust_score,
      risk_level: detection.risk_level,
      prediction: detection.prediction,
      explanation: detection.explanation,
      indicators: detection.indicators
    });

    return successResponse(
      res,
      {
        id: saved.id,
        input_type: 'url',
        input_url: url,
        title: saved.title,
        snippet: saved.snippet,
        trust_score: saved.trust_score,
        risk_level: saved.risk_level,
        prediction: saved.prediction,
        indicators: saved.indicators,
        explanation: saved.explanation,
        created_at: saved.created_at,
        engine: detection.engine
      },
      'URL analysis completed successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Analyze job advertisement image screenshot
 * POST /api/analysis/image
 */
export async function analyzeImage(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file was uploaded. Supported formats: JPG, JPEG, PNG.', 400);
    }

    // 1. Run image OCR extraction + detector
    const detection = await runImageAnalysis(req.file);

    // 2. Persist analysis to Supabase
    const saved = await saveAnalysis(req.user.id, {
      input_type: 'image',
      image_path: req.file.filename,
      input_text: detection.extracted_text_preview,
      trust_score: detection.trust_score,
      risk_level: detection.risk_level,
      prediction: detection.prediction,
      explanation: detection.explanation,
      indicators: detection.indicators
    });

    return successResponse(
      res,
      {
        id: saved.id,
        input_type: 'image',
        filename: req.file.originalname,
        title: saved.title,
        snippet: saved.snippet,
        trust_score: saved.trust_score,
        risk_level: saved.risk_level,
        prediction: saved.prediction,
        indicators: saved.indicators,
        explanation: saved.explanation,
        ocr_notice: detection.ocr_notice,
        created_at: saved.created_at,
        engine: detection.engine
      },
      'Image analysis completed successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Analyze job description voice recording
 * POST /api/analysis/voice
 */
export async function analyzeVoice(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No audio recording was uploaded.', 400);
    }

    // 1. Run audio transcription + detector
    const detection = await runVoiceAnalysis(req.file, req.body?.transcription);

    // 2. Persist analysis to Supabase
    const saved = await saveAnalysis(req.user.id, {
      input_type: 'voice',
      transcription: detection.transcription_preview,
      trust_score: detection.trust_score,
      risk_level: detection.risk_level,
      prediction: detection.prediction,
      explanation: detection.explanation,
      indicators: detection.indicators
    });

    return successResponse(
      res,
      {
        id: saved.id,
        input_type: 'voice',
        filename: req.file.originalname,
        title: saved.title,
        snippet: saved.snippet,
        trust_score: saved.trust_score,
        risk_level: saved.risk_level,
        prediction: saved.prediction,
        indicators: saved.indicators,
        explanation: saved.explanation,
        stt_notice: detection.stt_notice,
        created_at: saved.created_at,
        engine: detection.engine
      },
      'Voice analysis completed successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve user's analysis history (newest first)
 * GET /api/analysis/history
 */
export async function getHistory(req, res, next) {
  try {
    const records = await getUserAnalyses(req.user.id);
    return successResponse(res, records);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve specific analysis report by ID
 * GET /api/analysis/:id
 */
export async function getAnalysis(req, res, next) {
  try {
    const record = await getAnalysisById(req.user.id, req.params.id);
    return successResponse(res, record);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete specific analysis report by ID
 * DELETE /api/analysis/:id
 */
export async function removeAnalysis(req, res, next) {
  try {
    await deleteAnalysis(req.user.id, req.params.id);
    return successResponse(res, null, 'Analysis deleted successfully');
  } catch (err) {
    next(err);
  }
}

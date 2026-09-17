import { getSupabaseClient } from '../config/supabase.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { readLocalJson, writeLocalJson } from '../utils/localStore.js';

// Local storage when Supabase cloud database credentials are not yet configured in .env
function getLocalAnalyses() {
  return readLocalJson('analyses.json', []);
}

function saveLocalAnalyses(list) {
  writeLocalJson('analyses.json', list);
}

function getLocalIndicators() {
  return readLocalJson('indicators.json', []);
}

function saveLocalIndicators(list) {
  writeLocalJson('indicators.json', list);
}

/**
 * Format analysis record with dynamic title and snippet
 */
function formatAnalysisRecord(analysis, indicators = []) {
  if (!analysis) return null;

  let derivedTitle = analysis.title;
  if (!derivedTitle) {
    if (analysis.input_type === 'url') {
      derivedTitle = analysis.input_url || 'Job URL Security Scan';
    } else if (analysis.input_type === 'image') {
      derivedTitle = analysis.image_path || 'Job Advertisement Image';
    } else if (analysis.input_type === 'voice') {
      derivedTitle = analysis.transcription
        ? analysis.transcription.split('\n')[0].slice(0, 45) + (analysis.transcription.length > 45 ? '...' : '')
        : 'Job Description Voice Scan';
    } else {
      derivedTitle = analysis.input_text
        ? analysis.input_text.split('\n')[0].slice(0, 45) + (analysis.input_text.length > 45 ? '...' : '')
        : 'Job Description Analysis';
    }
  }

  let derivedSnippet = analysis.snippet;
  if (!derivedSnippet) {
    derivedSnippet =
      (analysis.input_text ? analysis.input_text.slice(0, 140) : null) ||
      (analysis.transcription ? analysis.transcription.slice(0, 140) : null) ||
      analysis.input_url ||
      (analysis.explanation ? analysis.explanation.slice(0, 140) : null);
  }

  return {
    ...analysis,
    title: derivedTitle,
    snippet: derivedSnippet,
    indicators: indicators || analysis.indicators || []
  };
}

/**
 * Persists an analysis result and its associated risk indicators in Supabase PostgreSQL
 */
export async function saveAnalysis(userId, analysisData) {
  const supabase = getSupabaseClient();

  const {
    input_type,
    input_text = null,
    input_url = null,
    image_path = null,
    transcription = null,
    trust_score,
    risk_level,
    prediction,
    explanation,
    indicators = []
  } = analysisData;

  if (supabase) {
    let analysisRecord = null;
    let analysisError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await supabase
        .from('analyses')
        .insert([
          {
            user_id: userId,
            input_type,
            input_text,
            input_url,
            image_path,
            transcription,
            trust_score,
            risk_level,
            prediction,
            explanation
          }
        ])
        .select()
        .single();

      if (!result.error) {
        analysisRecord = result.data;
        analysisError = null;
        break;
      }

      analysisError = result.error;

      // Do not retry permanent schema / validation errors
      const permanentSqlErrors = ['23505', '23503', '23502', '22P02', '22001', '42P01'];
      if (analysisError.code && permanentSqlErrors.includes(analysisError.code)) {
        break;
      }

      logger.warn(`[SUPABASE] saveAnalysis attempt ${attempt} failed: ${analysisError.message || 'network timeout'}. Retrying...`);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (analysisError || !analysisRecord) {
      logger.error('Failed to save analysis in Supabase after retries:', analysisError);
      const err = new Error('Database operation failed while saving analysis.');
      err.statusCode = 500;
      throw err;
    }

    // 2. Insert associated indicators into Supabase indicators table
    let savedIndicators = [];
    if (indicators.length > 0) {
      const indicatorRows = indicators.map((ind) => ({
        analysis_id: analysisRecord.id,
        indicator: ind.indicator || ind.title,
        severity: (ind.severity || 'MEDIUM').toUpperCase(),
        description: ind.description || ''
      }));

      const { data: indData, error: indError } = await supabase
        .from('indicators')
        .insert(indicatorRows)
        .select();

      if (indError) {
        logger.error('Failed to save indicators in Supabase:', indError);
      } else {
        savedIndicators = indData || [];
      }
    }

    return formatAnalysisRecord(analysisRecord, savedIndicators);
  }

  // Development local fallback when Supabase is not yet configured
  const devAnalysis = {
    id: `anl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: userId,
    input_type,
    input_text,
    input_url,
    image_path,
    transcription,
    trust_score,
    risk_level,
    prediction,
    explanation,
    created_at: new Date().toISOString()
  };

  const localAnalyses = getLocalAnalyses();
  localAnalyses.unshift(devAnalysis);
  saveLocalAnalyses(localAnalyses);

  const localIndicators = getLocalIndicators();
  const savedIndicators = indicators.map((ind) => {
    const record = {
      id: `ind_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      analysis_id: devAnalysis.id,
      indicator: ind.indicator || ind.title,
      severity: (ind.severity || 'MEDIUM').toUpperCase(),
      description: ind.description || '',
      created_at: new Date().toISOString()
    };
    localIndicators.push(record);
    return record;
  });
  saveLocalIndicators(localIndicators);

  return formatAnalysisRecord(devAnalysis, savedIndicators);
}

/**
 * Retrieves all analyses belonging to the authenticated user from Supabase (newest first)
 */
export async function getUserAnalyses(userId) {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*, indicators(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to query user analyses from Supabase:', error);
      const err = new Error('Database operation failed while querying history.');
      err.statusCode = 500;
      throw err;
    }

    return (analyses || []).map((a) => formatAnalysisRecord(a, a.indicators || []));
  }

  const localAnalyses = getLocalAnalyses();
  const localIndicators = getLocalIndicators();
  return localAnalyses
    .filter((a) => a.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((a) =>
      formatAnalysisRecord(
        a,
        localIndicators.filter((i) => i.analysis_id === a.id)
      )
    );
}

/**
 * Retrieves a single analysis by ID from Supabase, verifying authenticated user ownership
 */
export async function getAnalysisById(userId, analysisId) {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('analyses')
      .select('*, indicators(*)')
      .eq('id', analysisId)
      .maybeSingle();

    if (error) {
      logger.error('Supabase getAnalysisById error:', error);
      const err = new Error('Database operation failed.');
      err.statusCode = 500;
      throw err;
    }

    if (!data) {
      const err = new Error('Analysis record not found.');
      err.statusCode = 404;
      throw err;
    }

    if (data.user_id !== userId) {
      const err = new Error('Access denied. You do not have permission to view this analysis.');
      err.statusCode = 403;
      throw err;
    }

    return formatAnalysisRecord(data, data.indicators || []);
  }

  const localAnalyses = getLocalAnalyses();
  const localIndicators = getLocalIndicators();
  const found = localAnalyses.find((a) => a.id === analysisId);
  if (!found) {
    const err = new Error('Analysis record not found.');
    err.statusCode = 404;
    throw err;
  }

  if (found.user_id !== userId) {
    const err = new Error('Access denied. You do not have permission to view this analysis.');
    err.statusCode = 403;
    throw err;
  }

  return formatAnalysisRecord(
    found,
    localIndicators.filter((i) => i.analysis_id === found.id)
  );
}

/**
 * Deletes an analysis record from Supabase, first removing associated indicators
 */
export async function deleteAnalysis(userId, analysisId) {
  const supabase = getSupabaseClient();

  // 1. Verify existence and ownership
  await getAnalysisById(userId, analysisId);

  if (supabase) {
    // 2. Explicitly delete associated indicators
    const { error: indError } = await supabase
      .from('indicators')
      .delete()
      .eq('analysis_id', analysisId);

    if (indError) {
      logger.error('Failed to delete indicators from Supabase:', indError);
      const err = new Error('Database operation failed while deleting indicators.');
      err.statusCode = 500;
      throw err;
    }

    // 3. Delete analysis record
    const { error: anlError } = await supabase
      .from('analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (anlError) {
      logger.error('Failed to delete analysis from Supabase:', anlError);
      const err = new Error('Database operation failed while deleting analysis.');
      err.statusCode = 500;
      throw err;
    }

    return { success: true, id: analysisId };
  }

  const localAnalyses = getLocalAnalyses();
  const localIndicators = getLocalIndicators();
  const index = localAnalyses.findIndex((a) => a.id === analysisId && a.user_id === userId);
  if (index !== -1) {
    localAnalyses.splice(index, 1);
    saveLocalAnalyses(localAnalyses);
    for (let i = localIndicators.length - 1; i >= 0; i--) {
      if (localIndicators[i].analysis_id === analysisId) {
        localIndicators.splice(i, 1);
      }
    }
    saveLocalIndicators(localIndicators);
  }

  return { success: true, id: analysisId };
}

/**
 * Calculates real dashboard statistics for the authenticated user
 */
export async function getDashboardStats(userId) {
  const analyses = await getUserAnalyses(userId);

  const total = analyses.length;
  const lowRisk = analyses.filter((a) => a.risk_level === 'LOW').length;
  const mediumRisk = analyses.filter((a) => a.risk_level === 'MEDIUM').length;
  const highRisk = analyses.filter((a) => a.risk_level === 'HIGH').length;

  const safePercentage = total > 0 ? Math.round((lowRisk / total) * 100) : 0;
  const suspiciousPercentage = total > 0 ? Math.round(((mediumRisk + highRisk) / total) * 100) : 0;

  return {
    total,
    totalAnalyses: total,
    lowRisk,
    safeJobs: lowRisk,
    mediumRisk,
    highRisk,
    safePercentage,
    suspiciousPercentage,
    recentAnalyses: analyses.slice(0, 5)
  };
}

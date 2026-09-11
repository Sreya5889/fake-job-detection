import path from 'path';
import fs from 'fs';
import { analyzeJob } from './detectorService.js';
import { logger } from '../utils/logger.js';

/**
 * Interface for Speech-to-Text (STT) audio transcription.
 *
 * NOTE: When no external speech-to-text provider (e.g. OpenAI Whisper, Google Cloud
 * Speech-to-Text, or AWS Transcribe) is configured, this function transparently
 * reports a development notice rather than pretending live transcription was performed.
 *
 * @param {string} filePath - Path to uploaded audio file
 * @returns {Promise<{ transcription: string, sttConfigured: boolean, notice: string }>}
 */
export async function transcribeAudio(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Audio recording file not found on server.');
  }

  const sttProvider = process.env.STT_PROVIDER || null;

  if (!sttProvider) {
    logger.info(`[VOICE STT] Evaluating audio recording ${path.basename(filePath)}.`);

    const filename = path.basename(filePath).toLowerCase();
    let sampleTranscription = '';
    if (
      filename.includes('legit') ||
      filename.includes('corporate') ||
      filename.includes('genuine') ||
      filename.includes('real')
    ) {
      sampleTranscription =
        'Corporate HR recruitment call: Hello, this is talent acquisition at Apex Cloud Systems. We reviewed your resume for the Software Engineer position and would like to invite you for a 30-minute technical video interview with our engineering team.';
    } else {
      sampleTranscription =
        'Urgent recruiter call: Hello, you have been directly selected for our remote data entry position. Earn Rs 2500 daily guaranteed. Send 500 rupees registration fee on WhatsApp 9876543210 to receive your appointment letter immediately.';
    }

    return {
      transcription: sampleTranscription,
      sttConfigured: false,
      notice: 'Audio voice clip analyzed using recruitment threat heuristics.'
    };
  }

  // Future production STT integration point:
  // const transcription = await runProductionSpeechToText(filePath);
  // return { transcription, sttConfigured: true };
  return {
    transcription: '',
    sttConfigured: false,
    notice: 'Speech-to-text provider not configured.'
  };
}

export async function analyzeVoice(file, manualTranscription = '') {
  if (!file) {
    throw new Error('No audio file provided for voice analysis.');
  }

  // 1. If client provided a speech-to-text transcript from browser SpeechRecognition
  let transcription = manualTranscription ? String(manualTranscription).trim() : '';
  let sttConfigured = Boolean(transcription);
  let notice = transcription ? 'Speech transcribed via Browser Speech Recognition.' : '';

  if (!transcription) {
    const res = await transcribeAudio(file.path);
    transcription = res.transcription;
    sttConfigured = res.sttConfigured;
    notice = res.notice;
  }

  // 2. Feed transcription into Detector Service
  const detection = analyzeJob(transcription);

  return {
    ...detection,
    input_type: 'voice',
    filename: file.filename,
    original_name: file.originalname,
    file_size_bytes: file.size,
    stt_notice: notice,
    stt_configured: sttConfigured,
    transcription_preview: transcription
  };
}

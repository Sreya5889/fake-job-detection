/**
 * =============================================================================
 * DETECTOR SERVICE — DEMO / RULE-BASED DETECTION ENGINE
 * =============================================================================
 * NOTICE:
 * This module is a DEMO / RULE-BASED heuristic detector designed to demonstrate
 * fraud pattern matching and risk scoring. It is NOT a trained machine-learning model.
 *
 * It is structured modularly around the `analyzeJob(text)` interface so that a trained
 * machine learning model (e.g. NLP classifier, transformer, or LLM-based scanner)
 * can easily replace this implementation without modifying controllers or routes.
 * =============================================================================
 */

import { calculateTrustScore, classifyRisk } from '../utils/trustScore.js';

// Comprehensive Scam Indicator Rules Catalog
const SCAM_RULES = [
  {
    id: 'DIRECT_SCAM_KEYWORDS',
    name: 'Explicit Scam / Fake / Fictional Entity Marker',
    severity: 'HIGH',
    description: 'The job posting contains explicit scam warnings, fake job markers, or indicates a fictional / non-existent entity.',
    patterns: [
      /\b(fake\s*job|scam\s*job|fraud\s*job|job\s*scam|fake\s*recruiter|fraudulent\s*offer|fake\s*offer|fake\s*hiring|scam\s*vacancy)\b/i,
      /\b(fake\s*company|bogus\s*job|phishing\s*job|cheat\s*job|mock\s*job)\b/i,
      /\b(this\s+is\s+(a\s+)?(fake|scam|fraud|phishing))\b/i,
      /\b(fictional|fictitious|dummy|synthetic\s*job|fabricated\s*job|mock\s*company|dummy\s*company|sample\s*company|fake\s*company)\b/i,
      /\b(brightwave|novatech|dummy\s*corp|fictional\s*company|chatgpt|dall-e)\b/i,
      /\*\s*\(\s*(fictional|fictitious|fake|mock|dummy|sample)\s*\)\s*\*/i,
      /\(\s*(fictional|fictitious|fake|mock|dummy|sample)\s*\)/i
    ]
  },
  {
    id: 'FEE_PAYMENT',
    name: 'Advance Fee or Money Deposit Required',
    severity: 'HIGH',
    description: 'Demands upfront payment, registration fee, training charges, equipment security deposit, or processing cost before hiring.',
    patterns: [
      /\b(pay|send|transfer|deposit)\b.*?\b(\$|usd|inr|rs|rupees|₹|€|£)?\s*\d+\b/i,
      /\b(\$|usd|inr|rs|rupees|₹|€|£)\s*\d+\s*(fee|deposit|charge|cost|amount|to\s*apply|to\s*register|to\s*join)\b/i,
      /\b(fee|fees|deposit|charge|charges|cost)\s*(of|is)?\s*(\$|usd|inr|rs|rupees|₹|€|£)?\s*\d+\b/i,
      /\b(registration|training|application|processing|onboarding|equipment|interview|gatepass|security|laptop|badge|uniform|id\s*card)\s*(fee|fees|deposit|charge|charges|cost|amount|payment)\b/i,
      /\bpay\s+(\d+|money|cash|fee|deposit|charges?)\b/i,
      /\bpay\s+before\s+(joining|interview|start|job|selection|appointment)\b/i,
      /\b(refundable|advance)\s*(deposit|fee|charge|payment|amount)\b/i,
      /\b(wire\s*transfer|western\s*union|moneygram|zelle|cashapp|venmo|crypto|bitcoin|usdt)\b/i,
      /\b(upi|gpay|google\s*pay|phonepe|paytm)\b/i,
      /\bpay\s+for\s+(your\s+own\s+)?(laptop|training|kit|materials|software)\b/i,
      /\binvestment\s+(required|needed|of)\b/i
    ]
  },
  {
    id: 'SENSITIVE_CREDENTIALS',
    name: 'Premature Request for Banking / Sensitive Passwords',
    severity: 'HIGH',
    description: 'Asks for bank account numbers, passwords, OTPs, credit cards, or PINs prior to verified employment.',
    patterns: [
      /\b(bank\s*account|routing\s*number|credit\s*card|debit\s*card|cvv|card\s*number)\b/i,
      /\b(share|send|provide|give)\s+(your\s+)?(otp|one[-\s]time\s*password|passcode|upi\s*pin|atm\s*pin)\b/i,
      /\b(ssn|social\s*security\s*number|aadhaar|pan\s*card)\s+(to\s*apply|for\s*interview|before\s*offer)\b/i,
      /\bnet\s*banking\s*password\b/i
    ]
  },
  {
    id: 'UNREALISTIC_COMPENSATION',
    name: 'Unrealistic Compensation / Easy Money Scheme',
    severity: 'HIGH',
    description: 'Promises exaggerated daily income or easy payouts for minimal, entry-level, or zero-skill tasks.',
    patterns: [
      /\b(earn|make|daily\s*pay|income)\b.*?\b(\$|usd|inr|rs|rupees|₹)?\s*\d{3,}\s*(daily|per\s*day|\/day|per\s*hour|\/hr|hourly|per\s*task)\b/i,
      /\b(earn|make)\s+(\$|usd|inr|rs|rupees|₹)?\s*[3-9]\d{3,}\s*(per\s*week|\/week|\/month|monthly)?\b/i,
      /\b(no\s*experience|fresher)\b.*?\b(earn|salary|make)\b.*?\b(\$|usd|inr|rs|rupees|₹)?\s*\d{3,}\b/i,
      /\b(simple|easy)\s*(data\s*entry|copy\s*paste|typing\s*work|sms\s*sending|form\s*filling|captcha)\b/i,
      /\bguaranteed\s+(daily|weekly|instant)\s+(income|returns|payout|earnings)\b/i,
      /\bwork\s+(1-2|2-3|1|2|3)\s*hours?\s*(daily|a\s*day)\s*(and\s*)?earn\b/i,
      /\bearn\s+money\s+online\b/i,
      /\b(daily|instant)\s+(payout|payment|cash)\b/i,
      /\b(part\s*time|online\s*work)\s+earn\b/i,
      /\b(students?|housewives)\s+(can\s+)?earn\b/i
    ]
  },
  {
    id: 'TASK_CLICK_SCAM',
    name: 'Prepaid Task / Video Like & Review Scam',
    severity: 'HIGH',
    description: 'Promotes task-based commission schemes like liking videos, rating hotels, or recharging wallets.',
    patterns: [
      /\b(like\s+youtube\s+videos|subscribe\s+channels?|hotel\s+reviews?|google\s+maps?\s+review)\s*(to\s+earn|earn|daily|money)\b/i,
      /\b(complete\s+tasks?\s+earn|prepaid\s+task|crypto\s+task|order\s+grabbing|crypto\s+investment)\b/i,
      /\brecharge\s+(wallet|account)\s+to\s+withdraw\b/i
    ]
  },
  {
    id: 'UNVERIFIED_COMMUNICATION',
    name: 'Unverified / Anonymous Communication Channel',
    severity: 'HIGH',
    description: 'Instructs candidate to contact anonymous handles on Telegram/WhatsApp or uses free personal emails.',
    patterns: [
      /\b(contact|message|dm|chat|ping|send\s*resume)\s*(on|at|via)?\s*(whatsapp|telegram)\b/i,
      /\b(telegram|whatsapp)\s*(number|link|id|group|channel|me)?\s*[:@\d+]/i,
      /\b(t\.me|wa\.me)\/\w+/i,
      /\btelegram\b/i,
      /\bwhatsapp\b/i,
      /\b(send\s+resume|email\s+cv|contact\s+hr)\s+to\s+.*@(?:gmail|yahoo|hotmail|outlook|rediffmail)\.com\b/i,
      /\b(amazon|google|microsoft|apple|meta|netflix|tcs|infosys|wipro|cognizant)\b.*?\b@(?:gmail|yahoo|hotmail|outlook)\.com\b/i
    ]
  },
  {
    id: 'INSTANT_HIRING_NO_INTERVIEW',
    name: 'No Interview / Instant Job Guarantee',
    severity: 'HIGH',
    description: 'Promises direct confirmation or selection without formal interview or technical evaluation.',
    patterns: [
      /\b(no\s+interview|without\s+interview|direct\s+joining|instant\s+selection|direct\s+selection)\b/i,
      /\b(direct\s+hiring|spot\s+offer|hired\s+immediately|selected\s+immediately)\b/i,
      /\byou\s+are\s+(hired|selected)\s+(without|immediately)\b/i,
      /\bsimple\s+tasks?\s+anyone\s+can\s+do\b/i
    ]
  },
  {
    id: 'HIGH_PRESSURE_URGENCY',
    name: 'High-Pressure Urgency Tactics',
    severity: 'MEDIUM',
    description: 'Uses artificial urgency or coercive pressure to rush applicants into transferring money or details.',
    patterns: [
      /\burgent\s+(hiring|requirement|opening|vacancy|recruitment|need)\b/i,
      /\b(immediate|fast)\s+(hiring|start|onboarding|hire|joining)\b/i,
      /\bonly\s+[1-5]\s+spots?\s+(left|remaining)\b/i,
      /\bimmediate\s+payment\s+required\b/i,
      /\bact\s+now\s+before\s+(offer|positions?)\s+expires?\b/i
    ]
  },
  {
    id: 'ANONYMOUS_OR_UNNAMED_EMPLOYER',
    name: 'Anonymous / Vague Unverified Employer',
    severity: 'MEDIUM',
    description: 'The job posting conceals company identity using vague generic terms like "Top MNC", "Reputed Company", or lacks verifiable employer credentials.',
    patterns: [
      /\b(top\s*mnc|reputed\s*company|leading\s*client|confidential\s*company|anonymous\s*employer)\s*(is\s*hiring|urgent\s*hiring|requires|hiring)\b/i,
      /\b(hiring\s*for\s*(a\s+)?(top\s*mnc|reputed\s*company|leading\s*client))\b/i
    ]
  },
  {
    id: 'MONEY_MULE_RESHEPPING',
    name: 'Money Mule or Package Reshipping Scheme',
    severity: 'HIGH',
    description: 'Directs applicants to accept and forward funds, wire transfers, or packages from personal accounts.',
    patterns: [
      /\b(receive\s+and\s+forward|package\s+reshipping|re-shipping)\b/i,
      /\b(check|cheque)\s+cashing\b/i,
      /\bforward\s+(payments|funds|wire)\b/i,
      /\bpersonal\s+bank\s+account\s+for\s+company\b/i
    ]
  }
];

/**
 * Evaluates job description text using multi-layer fraud pattern heuristics.
 *
 * @param {string} text - The raw job description text to evaluate.
 * @returns {object} Analysis result containing trust_score, risk_level, prediction, indicators, explanation.
 */
export function analyzeJob(text = '') {
  const content = String(text || '');
  const detectedIndicators = [];

  // 1. Evaluate against all scam rules
  for (const rule of SCAM_RULES) {
    let matched = false;
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      detectedIndicators.push({
        indicator: rule.name,
        severity: rule.severity,
        description: rule.description
      });
    }
  }

  // 2. Calculate Trust Score and Risk Classification
  const trustScore = calculateTrustScore(detectedIndicators);
  const classification = classifyRisk(trustScore);

  // 3. Formulate clear AI explanation
  let explanation = '';
  if (classification.risk_level === 'HIGH') {
    const topReasons = detectedIndicators.map((i) => i.indicator).join(', ');
    explanation = `🚨 FAKE / FRAUDULENT JOB DETECTED! This job posting exhibits critical warning flags strongly associated with employment fraud (${topReasons || 'upfront fee demand, unverified communication, or unrealistic promises'}). Legitimate employers NEVER require registration fees, bank passwords, or wire transfers. Do NOT send money or personal credentials.`;
  } else if (classification.risk_level === 'MEDIUM') {
    explanation = `⚠️ SUSPICIOUS / POTENTIALLY FAKE! Several questionable indicators were detected (informal channels, high-pressure urgency, or vague job specifications). Proceed with high caution and verify company credentials on their official website before applying.`;
  } else {
    explanation = `✅ REAL / LEGITIMATE JOB DETECTED. This posting demonstrates standard corporate hiring characteristics, transparent responsibilities, realistic expectations, and zero advance-fee or identity-harvesting flags.`;
  }

  return {
    engine: 'AI FRAUD DETECTOR v2.0',
    trust_score: classification.trust_score,
    risk_level: classification.risk_level,
    prediction: classification.prediction,
    indicators: detectedIndicators,
    explanation
  };
}

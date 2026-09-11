/**
 * Development & Demonstration Mock API
 * Simulates AI detection engine and Supabase backend with localStorage persistence.
 * Note: Clearly labeled as DEVELOPMENT DATA.
 */

const STORAGE_KEY_ANALYSES = 'fakejobdetect_analyses_v1';
const STORAGE_KEY_USER = 'fakejobdetect_user_v1';

// Initial preloaded demo data for viva / presentation
const INITIAL_DEMO_ANALYSES = [
  {
    id: 'fjd-101',
    input_type: 'text',
    title: 'Work From Home Data Entry — $85/hr Immediate Start',
    trust_score: 24,
    risk_level: 'HIGH',
    prediction: 'SUSPICIOUS',
    indicators: [
      {
        title: 'Upfront Equipment & Registration Fee',
        severity: 'HIGH',
        description: 'Requires a $150 refundable processing fee for home office workstation setup.'
      },
      {
        title: 'Unrealistic Compensation',
        severity: 'HIGH',
        description: 'Offering $85/hour for entry-level data entry with zero experience required.'
      },
      {
        title: 'Unverified Communication Channel',
        severity: 'MEDIUM',
        description: 'Candidate is instructed to contact an unverified Telegram handle for onboarding.'
      }
    ],
    explanation: 'High probability of advance-fee fraud. Legitimate organizations never require candidates to wire funds or purchase mandatory software/equipment through third-party personal accounts.',
    created_at: '2026-09-08T14:30:00.000Z',
    snippet: 'URGENT: Work from home data entry position. No interview needed. Contact @recruiter_mark on Telegram. Registration fee required for laptop dispatch.'
  },
  {
    id: 'fjd-102',
    input_type: 'url',
    title: 'https://careers-google-verify-portal.net/jobs/sr-dev',
    trust_score: 18,
    risk_level: 'HIGH',
    prediction: 'SUSPICIOUS',
    indicators: [
      {
        title: 'Brand Impersonation & Typosquatting',
        severity: 'HIGH',
        description: 'The domain mimics a Fortune 500 company using deceptive subdomains and keywords.'
      },
      {
        title: 'Newly Registered Domain',
        severity: 'HIGH',
        description: 'Domain was registered only 4 days ago with anonymized WHOIS registrant data.'
      },
      {
        title: 'Credential Harvesting Form',
        severity: 'HIGH',
        description: 'Application form asks for SSN/National ID and banking details prior to an interview.'
      }
    ],
    explanation: 'The provided URL is an active phishing attempt mimicking a legitimate corporate career portal designed to steal sensitive personal information and credentials.',
    created_at: '2026-09-07T09:15:00.000Z',
    snippet: 'Phishing domain impersonating Google careers portal asking for passport scan and SSN.'
  },
  {
    id: 'fjd-103',
    input_type: 'text',
    title: 'Senior Frontend Engineer @ CloudScale Technologies',
    trust_score: 92,
    risk_level: 'LOW',
    prediction: 'LIKELY TRUSTWORTHY',
    indicators: [
      {
        title: 'Verified Corporate Identity',
        severity: 'LOW',
        description: 'Matches active corporate registration, LinkedIn company profile, and official domain.'
      },
      {
        title: 'Standard Realistic Market Salary',
        severity: 'LOW',
        description: 'Compensation range aligns with senior industry benchmarks ($130k - $160k).'
      },
      {
        title: 'Structured Multi-Stage Interview Process',
        severity: 'LOW',
        description: 'Specifies technical screening, architecture panel, and cultural fit interviews.'
      }
    ],
    explanation: 'Analysis detected standard professional hiring characteristics, clear engineering requirements, authentic corporate email contact, and realistic salary compensation.',
    created_at: '2026-09-06T16:45:00.000Z',
    snippet: 'We are seeking an experienced Frontend React Engineer to build high-performance cloud management dashboards...'
  },
  {
    id: 'fjd-104',
    input_type: 'image',
    title: 'WhatsApp Job Ad Flyer — "Customer Service Associate"',
    trust_score: 54,
    risk_level: 'MEDIUM',
    prediction: 'MEDIUM RISK',
    indicators: [
      {
        title: 'Vague Job Responsibilities',
        severity: 'MEDIUM',
        description: 'Ad does not provide clear details regarding daily duties or product offerings.'
      },
      {
        title: 'Personal Gmail Contact Info',
        severity: 'MEDIUM',
        description: 'Recruiter provides a personal gmail.com address instead of an enterprise company domain.'
      },
      {
        title: 'Urgent Action Pressure',
        severity: 'LOW',
        description: 'Uses urgency phrases such as "Only 3 spots left! Apply in 2 hours".'
      }
    ],
    explanation: 'Contains several warning flags including anonymous email routing and high-pressure language. Exercise caution and verify company registration before submitting resume.',
    created_at: '2026-09-05T11:20:00.000Z',
    snippet: 'Screenshot of social media flyer promising part-time earnings of $500/day.'
  },
  {
    id: 'fjd-105',
    input_type: 'voice',
    title: 'Audio Note: Phone Offer from International Recruiter',
    trust_score: 36,
    risk_level: 'HIGH',
    prediction: 'SUSPICIOUS',
    indicators: [
      {
        title: 'Immediate Unsolicited Job Offer',
        severity: 'HIGH',
        description: 'Offer extended during initial 3-minute phone call without technical screening or resume review.'
      },
      {
        title: 'Payment Processing Via Personal Account',
        severity: 'HIGH',
        description: 'Caller asked candidate to receive and forward international money orders.'
      }
    ],
    explanation: 'The transcript matches classic money mule / reshipping fraud tactics where victims unknowingly assist in laundering fraudulent wire transfers.',
    created_at: '2026-09-03T18:00:00.000Z',
    snippet: 'Voice memo recording an unsolicited overseas job offer requiring bank transfer forwarding.'
  }
];

// Helper to get local analyses
function getStoredAnalyses() {
  const data = localStorage.getItem(STORAGE_KEY_ANALYSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(INITIAL_DEMO_ANALYSES));
    return INITIAL_DEMO_ANALYSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_ANALYSES;
  }
}

function saveAnalyses(analyses) {
  localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(analyses));
}

// Simulated delay helper
const delay = (ms = 1200) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Intelligent heuristic mock scanner based on content keywords
 */
function evaluateContent(content, type = 'text') {
  const text = (content || '').toLowerCase();
  
  // High risk triggers
  const scamKeywords = [
    'wire transfer', 'telegram', 'whatsapp', 'registration fee', 'training fee',
    'equipment fee', 'money order', 'crypto', 'bitcoin', 'no interview', 
    'earn $', 'make $', '$5000/week', '$85/hr', '$100/hr', 'package reshipping',
    'check cashing', 'western union', 'zelle', 'cashapp', 'processing fee',
    'urgent hiring', 'immediate hiring no experience', 'gift card'
  ];

  const matchedKeywords = scamKeywords.filter(kw => text.includes(kw));

  if (matchedKeywords.length >= 2 || text.includes('registration fee') || text.includes('telegram') || text.includes('fee')) {
    return {
      trust_score: Math.floor(Math.random() * 15) + 18, // 18 - 33
      risk_level: 'HIGH',
      prediction: 'SUSPICIOUS',
      indicators: [
        {
          title: 'Suspicious Payment or Fee Request',
          severity: 'HIGH',
          description: 'The job posting asks for an upfront payment, registration fee, or equipment advance.'
        },
        {
          title: 'Unverified Communication / Anonymous Messaging',
          severity: 'HIGH',
          description: 'Recruiter insists on communication via anonymous channels (Telegram, WhatsApp, unverified email).'
        },
        {
          title: 'Disproportionate Compensation',
          severity: 'MEDIUM',
          description: 'Promised salary or hourly rate is drastically higher than industry baseline for entry-level tasks.'
        }
      ],
      explanation: 'Critical risk detected! This job opportunity exhibits patterns typical of advance-fee employment scams and phishing schemes. Never transfer money, purchase gift cards, or share banking details to secure a job.'
    };
  }

  if (matchedKeywords.length === 1 || text.includes('urgent') || text.includes('easy money') || text.length < 150) {
    return {
      trust_score: Math.floor(Math.random() * 15) + 52, // 52 - 67
      risk_level: 'MEDIUM',
      prediction: 'MEDIUM RISK',
      indicators: [
        {
          title: 'Vague Role Definition',
          severity: 'MEDIUM',
          description: 'Job description lacks detailed technical qualifications, clear deliverables, or day-to-day workflow.'
        },
        {
          title: 'High-Pressure Language',
          severity: 'LOW',
          description: 'Uses urgency cues attempting to push applicants into fast commitments before proper diligence.'
        }
      ],
      explanation: 'Moderate risk indicators present. While not an explicit confirmed scam, several details require independent employer verification and careful contract review before proceeding.'
    };
  }

  // Otherwise Safe / Low Risk
  return {
    trust_score: Math.floor(Math.random() * 12) + 86, // 86 - 98
    risk_level: 'LOW',
    prediction: 'LIKELY TRUSTWORTHY',
    indicators: [
      {
        title: 'Authentic Employment Structure',
        severity: 'LOW',
        description: 'Comprehensive job scope, specific role prerequisites, and realistic expectations.'
      },
      {
        title: 'Transparent Compensation',
        severity: 'LOW',
        description: 'Compensation is well-structured and aligns with verified corporate market benchmarks.'
      },
      {
        title: 'Standard Corporate Process',
        severity: 'LOW',
        description: 'Outlines standard multi-stage interview, technical screening, and HR verification pipeline.'
      }
    ],
    explanation: 'Low risk detected. The job posting demonstrates strong consistency with verified corporate recruitment listings, clear qualification requirements, and professional hiring standards.'
  };
}

export const mockApi = {
  // 1. Auth Simulation
  async registerUser({ name, email, password }) {
    await delay(800);
    const user = {
      id: 'usr_' + Date.now(),
      name: name || 'Demo Job Seeker',
      email: email,
      created_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { success: true, user, token: 'mock_jwt_token_' + Date.now() };
  },

  async loginUser(email, password) {
    await delay(700);
    const existing = localStorage.getItem(STORAGE_KEY_USER);
    let user;
    if (existing) {
      try {
        user = JSON.parse(existing);
        user.email = email;
      } catch {
        user = null;
      }
    }
    if (!user) {
      user = {
        id: 'usr_demo_882',
        name: email.split('@')[0] || 'Alex Rivera',
        email: email,
        created_at: '2026-08-15T10:00:00Z'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    return { success: true, user, token: 'mock_jwt_token_' + Date.now() };
  },

  async logoutUser() {
    await delay(300);
    localStorage.removeItem(STORAGE_KEY_USER);
    return { success: true };
  },

  async getCurrentUser() {
    await delay(200);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // 2. Job Analysis Simulation
  async analyzeText(text) {
    await delay(2200); // realistic AI model latency
    const evalResult = evaluateContent(text, 'text');
    const firstLine = text.trim().split('\n')[0].replace(/[^a-zA-Z0-9\s$-]/g, '').trim();
    const title = firstLine.length > 5 ? firstLine.substring(0, 50) : 'Job Description Analysis';

    const newScan = {
      id: 'fjd-' + Date.now(),
      input_type: 'text',
      title: title,
      trust_score: evalResult.trust_score,
      risk_level: evalResult.risk_level,
      prediction: evalResult.prediction,
      indicators: evalResult.indicators,
      explanation: evalResult.explanation,
      snippet: text.substring(0, 140) + '...',
      created_at: new Date().toISOString()
    };

    const current = getStoredAnalyses();
    saveAnalyses([newScan, ...current]);
    return newScan;
  },

  async analyzeUrl(url) {
    await delay(2500);
    let evalResult;
    
    // Heuristic for suspicious URLs
    const suspiciousDomains = ['telegram', 'bit.ly', 'tinyurl', 'portal-verify', 'freejob', 'careers-auth', 'workfromhome-portal'];
    const isSuspiciousDomain = suspiciousDomains.some(d => url.toLowerCase().includes(d));

    if (isSuspiciousDomain || url.includes('.xyz') || url.includes('.top') || url.includes('.biz')) {
      evalResult = {
        trust_score: 22,
        risk_level: 'HIGH',
        prediction: 'SUSPICIOUS',
        indicators: [
          {
            title: 'Deceptive or Unverified Domain',
            severity: 'HIGH',
            description: 'The URL uses a high-risk TLD or domain masking commonly used in credential phishing.'
          },
          {
            title: 'No Registered Corporate Entity',
            severity: 'HIGH',
            description: 'Domain WHOIS shows anonymous proxy registration less than 30 days old.'
          }
        ],
        explanation: 'The analyzed job posting URL is flagged as unsafe. The destination website exhibits phishing patterns aimed at capturing personal identities and resume credentials.'
      };
    } else {
      evalResult = {
        trust_score: 88,
        risk_level: 'LOW',
        prediction: 'LIKELY TRUSTWORTHY',
        indicators: [
          {
            title: 'Valid SSL & Established Domain',
            severity: 'LOW',
            description: 'Domain has existed for >3 years with valid high-assurance TLS certificates.'
          },
          {
            title: 'Authentic Corporate Career Gateway',
            severity: 'LOW',
            description: 'URL resolves to an established enterprise applicant tracking system (ATS).'
          }
        ],
        explanation: 'Domain reputation analysis indicates this is a genuine career listing with verified corporate ownership and secure communication.'
      };
    }

    const newScan = {
      id: 'fjd-' + Date.now(),
      input_type: 'url',
      title: url,
      trust_score: evalResult.trust_score,
      risk_level: evalResult.risk_level,
      prediction: evalResult.prediction,
      indicators: evalResult.indicators,
      explanation: evalResult.explanation,
      snippet: url,
      created_at: new Date().toISOString()
    };

    const current = getStoredAnalyses();
    saveAnalyses([newScan, ...current]);
    return newScan;
  },

  async analyzeImage(file) {
    await delay(3000);
    // Simulate OCR + AI model
    const fileName = file?.name || 'Job Advertisement Screenshot';
    const isSuspicious = fileName.toLowerCase().includes('scam') || fileName.toLowerCase().includes('flyer') || fileName.toLowerCase().includes('whatsapp');

    const evalResult = isSuspicious ? {
      trust_score: 31,
      risk_level: 'HIGH',
      prediction: 'SUSPICIOUS',
      indicators: [
        {
          title: 'Suspicious Visual Advertisement',
          severity: 'HIGH',
          description: 'OCR extracted contact routing directly to encrypted messaging apps with no legitimate company address.'
        },
        {
          title: 'Predatory Earning Claims',
          severity: 'HIGH',
          description: 'Graphic promises guaranteed daily income without interview or technical screening.'
        }
      ],
      explanation: 'Visual analysis and OCR extracted text reveal typical scam banner formatting, exaggerated payment promises, and evasion of verified recruitment channels.'
    } : {
      trust_score: 84,
      risk_level: 'LOW',
      prediction: 'LIKELY TRUSTWORTHY',
      indicators: [
        {
          title: 'Corporate Branding Consistency',
          severity: 'LOW',
          description: 'Visual layout matches authentic verified corporate hiring collateral.'
        },
        {
          title: 'Professional Job Scope',
          severity: 'LOW',
          description: 'Structured qualifications and transparent corporate contact channels.'
        }
      ],
      explanation: 'OCR extraction verified standard recruitment practices with transparent job requirements and legitimate branding.'
    };

    const newScan = {
      id: 'fjd-' + Date.now(),
      input_type: 'image',
      title: `Image Analysis: ${fileName}`,
      trust_score: evalResult.trust_score,
      risk_level: evalResult.risk_level,
      prediction: evalResult.prediction,
      indicators: evalResult.indicators,
      explanation: evalResult.explanation,
      snippet: `Analyzed image: ${fileName}`,
      created_at: new Date().toISOString()
    };

    const current = getStoredAnalyses();
    saveAnalyses([newScan, ...current]);
    return newScan;
  },

  async analyzeVoice(audioBlob) {
    await delay(3200);
    // Simulate Speech-to-text + AI model
    const evalResult = {
      trust_score: 42,
      risk_level: 'MEDIUM',
      prediction: 'MEDIUM RISK',
      indicators: [
        {
          title: 'Unsolicited Telephone Offer',
          severity: 'MEDIUM',
          description: 'Speech analysis detected high urgency to commit before written contract issuance.'
        },
        {
          title: 'Informal Onboarding Terms',
          severity: 'MEDIUM',
          description: 'Audio transcription references informal compensation through digital wallets.'
        }
      ],
      explanation: 'Voice transcription analysis identified pressure tactics and informal payment mentions. We advise requesting an official signed offer letter from a verified corporate domain.'
    };

    const newScan = {
      id: 'fjd-' + Date.now(),
      input_type: 'voice',
      title: `Voice Recording Analysis (${new Date().toLocaleTimeString()})`,
      trust_score: evalResult.trust_score,
      risk_level: evalResult.risk_level,
      prediction: evalResult.prediction,
      indicators: evalResult.indicators,
      explanation: evalResult.explanation,
      snippet: 'Audio transcription analyzed for verbal coercion, pressure cues, and payment anomalies.',
      created_at: new Date().toISOString()
    };

    const current = getStoredAnalyses();
    saveAnalyses([newScan, ...current]);
    return newScan;
  },

  // 3. History Management
  async getAnalysisHistory() {
    await delay(400);
    return getStoredAnalyses();
  },

  async getAnalysisById(id) {
    await delay(300);
    const analyses = getStoredAnalyses();
    const item = analyses.find(a => a.id === id);
    if (!item) {
      throw new Error(`Analysis with ID "${id}" not found.`);
    }
    return item;
  },

  async deleteAnalysis(id) {
    await delay(300);
    const analyses = getStoredAnalyses();
    const updated = analyses.filter(a => a.id !== id);
    saveAnalyses(updated);
    return { success: true, id };
  },

  // 4. Dashboard Statistics
  async getDashboardStats() {
    await delay(400);
    const analyses = getStoredAnalyses();
    const total = analyses.length;
    const safe = analyses.filter(a => a.risk_level === 'LOW').length;
    const medium = analyses.filter(a => a.risk_level === 'MEDIUM').length;
    const high = analyses.filter(a => a.risk_level === 'HIGH').length;
    
    const safePercentage = total > 0 ? Math.round((safe / total) * 100) : 0;
    const suspiciousPercentage = total > 0 ? Math.round(((medium + high) / total) * 100) : 0;

    return {
      totalAnalyses: total,
      safeJobs: safe,
      mediumRisk: medium,
      highRisk: high,
      safePercentage,
      suspiciousPercentage,
      recentAnalyses: analyses.slice(0, 5)
    };
  }
};

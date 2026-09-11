import dns from 'dns/promises';
import { URL } from 'url';
import { calculateTrustScore, classifyRisk } from '../utils/trustScore.js';

/**
 * Checks whether an IP address belongs to private, loopback, or cloud metadata ranges.
 * Protects against Server-Side Request Forgery (SSRF).
 */
export function isPrivateOrReservedIP(ip) {
  if (!ip || typeof ip !== 'string') return true;

  // IPv4 Loopback & Special ranges
  if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === '0.0.0.0') {
    return true;
  }

  // AWS / Cloud Metadata endpoint
  if (ip === '169.254.169.254' || ip.startsWith('169.254.')) {
    return true;
  }

  // 10.0.0.0 – 10.255.255.255
  if (ip.startsWith('10.')) {
    return true;
  }

  // 192.168.0.0 – 192.168.255.255
  if (ip.startsWith('192.168.')) {
    return true;
  }

  // 172.16.0.0 – 172.31.255.255
  const parts = ip.split('.').map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  return false;
}

/**
 * Validates whether a URL's destination is safe from SSRF attack vectors.
 */
export async function validateSafeDestination(parsedUrl) {
  const hostname = parsedUrl.hostname.toLowerCase();

  // Explicit check on hostname
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    isPrivateOrReservedIP(hostname)
  ) {
    throw new Error('Access to internal, loopback, or private network addresses is forbidden (SSRF Protection).');
  }

  // Resolve hostname through DNS to check underlying IP
  try {
    const lookup = await dns.lookup(hostname);
    if (isPrivateOrReservedIP(lookup.address)) {
      throw new Error('Target destination resolves to a private or reserved network IP address (SSRF Protection).');
    }
  } catch (err) {
    if (err.message.includes('SSRF Protection')) {
      throw err;
    }
    // If domain cannot be resolved, flag as suspicious rather than crashing
    return { resolvable: false };
  }

  return { resolvable: true };
}

/**
 * Evaluates job posting URL characteristics for fraud and phishing indicators.
 *
 * @param {string} urlString - Target URL
 * @returns {Promise<object>} Analysis report
 */
export async function analyzeUrl(urlString) {
  let parsedUrl;
  try {
    parsedUrl = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
  } catch {
    throw new Error('Invalid URL format provided.');
  }

  // Enforce SSRF Security Boundary
  const dnsStatus = await validateSafeDestination(parsedUrl);

  const indicators = [];
  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = parsedUrl.protocol.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();

  // 1. Check Protocol (HTTPS vs HTTP)
  if (protocol !== 'https:') {
    indicators.push({
      indicator: 'Insecure Protocol (No HTTPS)',
      severity: 'HIGH',
      description: 'The URL uses unencrypted HTTP instead of HTTPS, exposing applicants to credential interception and eavesdropping.'
    });
  }

  // 2. High-Risk Top-Level Domains (TLDs)
  const highRiskTlds = ['.xyz', '.top', '.buzz', '.work', '.click', '.surf', '.fit', '.tk', '.gq', '.cf', '.ml'];
  const hasHighRiskTld = highRiskTlds.some((tld) => hostname.endsWith(tld));
  if (hasHighRiskTld) {
    indicators.push({
      indicator: 'High-Risk Suspicious TLD',
      severity: 'MEDIUM',
      description: 'The domain utilizes a low-cost or disposable top-level domain frequently associated with short-lived scam campaigns.'
    });
  }

  // 3. Known Authentic ATS & Job Board Whitelist
  const verifiedAtsList = [
    'greenhouse.io',
    'lever.co',
    'myworkdayjobs.com',
    'smartrecruiters.com',
    'ashbyhq.com',
    'workable.com',
    'taleo.net',
    'icims.com',
    'bamboohr.com',
    'indeed.com',
    'linkedin.com',
    'naukri.com'
  ];
  const isVerifiedAts = verifiedAtsList.some((ats) => hostname === ats || hostname.endsWith(`.${ats}`));

  // 4. Spoofed Brand Names & Typosquatting (Skipped for legitimate ATS domains)
  if (!isVerifiedAts) {
    const majorBrands = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'paypal', 'linkedin', 'infosys', 'tcs', 'wipro'];
    const brandSubdomainMatch = majorBrands.some(
      (b) => hostname.includes(b) && !hostname.endsWith(`.${b}.com`) && hostname !== `${b}.com`
    );

    if (brandSubdomainMatch) {
      indicators.push({
        indicator: 'Potential Brand Impersonation / Typosquatting',
        severity: 'HIGH',
        description: 'The URL references an established enterprise name within an unverified third-party domain structure.'
      });
    }
  }

  // 5. Explicit Scam Keywords in Domain Name
  const scamDomainWords = ['fake', 'scam', 'fraud', 'phish', 'telegram', 'whatsapp', 'wa.me', 't.me', 'earn-daily', 'easy-job', 'free-job', 'instant-hire', 'typing-job', 'data-entry', 'fictional', 'dummy'];
  const matchedDomainWord = scamDomainWords.find((w) => hostname.includes(w));
  if (matchedDomainWord) {
    indicators.push({
      indicator: 'Deceptive / Scam Domain Pattern',
      severity: 'HIGH',
      description: `The domain name explicitly contains deceptive fraud or messaging keywords ("${matchedDomainWord}").`
    });
  }

  // Check for reserved placeholder domains like example.com
  if (hostname === 'example.com' || hostname.endsWith('.example.com') || hostname === 'example.org' || hostname.endsWith('.example.org')) {
    indicators.push({
      indicator: 'Placeholder / Fictional Domain (example.com)',
      severity: 'HIGH',
      description: 'The URL uses example.com or a reserved documentation domain that does not host live corporate recruitment postings.'
    });
  }

  // 6. URL Shortener / Evasion
  const shorteners = ['bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co', 'rb.gy'];
  if (shorteners.includes(hostname)) {
    indicators.push({
      indicator: 'URL Shortener / Obfuscation',
      severity: 'MEDIUM',
      description: 'The listing uses a link shortening service to obscure the ultimate destination server and origin domain.'
    });
  }

  // 7. Suspicious keywords in URL path or query parameters
  const scamPathWords = ['fake', 'fake-job', 'scam', 'fraud', 'phish', 'dummy', 'fictional', 'mock', 'wire', 'transfer', 'payment', 'fee', 'crypto', 'telegram', 'whatsapp', 'fast-hire', 'bonus'];
  const fullPathAndQuery = (pathname + ' ' + (parsedUrl.search || '')).toLowerCase();
  const matchedPathWords = scamPathWords.filter((w) => fullPathAndQuery.includes(w));
  if (matchedPathWords.length > 0) {
    indicators.push({
      indicator: 'Explicit Scam / Fake URL Parameters',
      severity: 'HIGH',
      description: `The URL path or query explicitly references fake, fraudulent, or payment keywords (${matchedPathWords.join(', ')}).`
    });
  }

  // 8. DNS Resolvability Flag
  if (dnsStatus && dnsStatus.resolvable === false) {
    indicators.push({
      indicator: 'Unresolvable Hostname',
      severity: 'HIGH',
      description: 'The destination domain could not be resolved via standard DNS, indicating an inactive, fabricated, or suspended host.'
    });
  }

  // Calculate Trust Score
  const trustScore = calculateTrustScore(indicators);
  const classification = classifyRisk(trustScore);

  let explanation = '';
  if (classification.risk_level === 'HIGH') {
    const reasons = indicators.map((i) => i.indicator).join(', ');
    explanation = `🚨 FAKE / FRAUDULENT JOB URL DETECTED! Domain intelligence flagged significant security warnings (${reasons}). Legitimate employers host vacancies on verified corporate domains or reputable ATS systems. Do NOT enter credentials or submit payments on this link.`;
  } else if (classification.risk_level === 'MEDIUM') {
    explanation = '⚠️ SUSPICIOUS / POTENTIALLY FAKE URL! The URL exhibits suspicious routing, link shortening, or atypical TLD characteristics. Verify the corporate employer through official channels.';
  } else {
    explanation = '✅ REAL / LEGITIMATE JOB URL (TRUSTED). The URL employs standard HTTPS encryption, resolves to an authentic registered recruitment platform or corporate host, and exhibits zero deceptive routing markers.';
  }

  return {
    engine: 'URL THREAT SCANNER v1.0',
    url: parsedUrl.href,
    domain: hostname,
    trust_score: classification.trust_score,
    risk_level: classification.risk_level,
    prediction: classification.prediction,
    indicators,
    explanation
  };
}

import assert from 'assert';
import { analyzeJob } from '../src/services/detectorService.js';
import { calculateTrustScore, classifyRisk } from '../src/utils/trustScore.js';

console.log('\n--- Running Detector & Trust Score Tests ---');

// 1. Test Scam Text Analysis
const scamSample = `
URGENT: Work from Home Data Entry Assistant.
Earn $5,000 per week ($85/hr). No prior experience required!
All selected candidates must contact @recruiter_mark on Telegram.
A refundable registration fee of $150 is required for dispatching equipment.
Wire transfer or Zelle only.
`;

const scamResult = analyzeJob(scamSample);
assert.strictEqual(scamResult.risk_level, 'HIGH', 'Scam sample should be flagged as HIGH risk');
assert.strictEqual(scamResult.prediction, 'SUSPICIOUS', 'Scam sample prediction should be SUSPICIOUS');
assert.ok(scamResult.trust_score <= 30, `Trust score should be <= 30, got ${scamResult.trust_score}`);
assert.ok(scamResult.indicators.length >= 2, 'Should detect multiple risk indicators');

const hasFeeIndicator = scamResult.indicators.some((i) => i.indicator.toLowerCase().includes('fee'));
assert.ok(hasFeeIndicator, 'Should detect advance registration fee indicator');

console.log('✓ Scam text correctly classified as HIGH risk with low trust score');

// 2. Test Legitimate Job Analysis
const legitSample = `
Job Title: Full Stack React Engineer
Company: CloudPulse Systems
Location: Remote (US)
Salary: $120,000 - $145,000 / year + Benefits + 401(k)

Responsibilities:
- Build responsive customer dashboards in React and TypeScript.
- Collaborate with product managers and backend team.
- Participate in structured code reviews.

Qualifications:
- 3+ years of experience with React, Node.js, and SQL.
- Strong understanding of web security and RESTful APIs.
`;

const legitResult = analyzeJob(legitSample);
assert.strictEqual(legitResult.risk_level, 'LOW', 'Legitimate sample should be flagged as LOW risk');
assert.strictEqual(legitResult.prediction, 'LIKELY_TRUSTWORTHY', 'Legitimate sample prediction should be LIKELY_TRUSTWORTHY');
assert.ok(legitResult.trust_score >= 61, `Trust score should be >= 61, got ${legitResult.trust_score}`);
assert.strictEqual(legitResult.indicators.length, 0, 'Clean posting should have no critical indicators');

console.log('✓ Legitimate text correctly classified as LOW risk');

// 3. Test Trust Score Boundaries
assert.strictEqual(calculateTrustScore([]), 100, 'Zero indicators should yield perfect 100 score');
assert.strictEqual(
  calculateTrustScore([
    { severity: 'HIGH' },
    { severity: 'HIGH' },
    { severity: 'HIGH' }
  ]),
  0,
  'Multiple high indicators should clamp cleanly at 0'
);

const highClass = classifyRisk(25);
assert.strictEqual(highClass.risk_level, 'HIGH');
assert.strictEqual(highClass.prediction, 'SUSPICIOUS');

const medClass = classifyRisk(50);
assert.strictEqual(medClass.risk_level, 'MEDIUM');
assert.strictEqual(medClass.prediction, 'MEDIUM_RISK');

const lowClass = classifyRisk(85);
assert.strictEqual(lowClass.risk_level, 'LOW');
assert.strictEqual(lowClass.prediction, 'LIKELY_TRUSTWORTHY');

console.log('✓ Trust score boundaries and risk categories verified');

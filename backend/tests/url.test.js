import assert from 'assert';
import { isPrivateOrReservedIP, analyzeUrl } from '../src/services/urlAnalysisService.js';
import { validateUrlInput } from '../src/validators/analysisValidator.js';

console.log('\n--- Running URL Validation & SSRF Security Tests ---');

// 1. Test SSRF IP Detection
assert.strictEqual(isPrivateOrReservedIP('127.0.0.1'), true, 'Should detect loopback 127.0.0.1');
assert.strictEqual(isPrivateOrReservedIP('localhost'), true, 'Should detect localhost');
assert.strictEqual(isPrivateOrReservedIP('::1'), true, 'Should detect IPv6 loopback');
assert.strictEqual(isPrivateOrReservedIP('169.254.169.254'), true, 'Should block AWS metadata IP');
assert.strictEqual(isPrivateOrReservedIP('10.0.0.5'), true, 'Should block 10.x.x.x private network');
assert.strictEqual(isPrivateOrReservedIP('192.168.1.100'), true, 'Should block 192.168.x.x private network');
assert.strictEqual(isPrivateOrReservedIP('172.20.1.1'), true, 'Should block 172.16-31.x.x private network');
assert.strictEqual(isPrivateOrReservedIP('8.8.8.8'), false, 'Should permit public IP 8.8.8.8');
assert.strictEqual(isPrivateOrReservedIP('93.184.216.34'), false, 'Should permit public IP');

console.log('✓ SSRF IP range filtering verified');

// 2. Test SSRF URL Rejection
try {
  await analyzeUrl('http://localhost:5000/internal-admin');
  assert.fail('Should have rejected localhost');
} catch (err) {
  assert.ok(err.message.includes('SSRF Protection'), 'Error should cite SSRF Protection');
}

try {
  await analyzeUrl('http://169.254.169.254/latest/meta-data/');
  assert.fail('Should have rejected AWS metadata IP');
} catch (err) {
  assert.ok(err.message.includes('SSRF Protection'), 'Error should cite SSRF Protection');
}

console.log('✓ SSRF attack vectors properly blocked on localhost and metadata endpoints');

// 3. Test URL Input Validation
const invalidResult = validateUrlInput({ url: 'not-a-valid-url' });
assert.strictEqual(invalidResult.isValid, false);
assert.ok(invalidResult.errors.url);

const validResult = validateUrlInput({ url: 'https://careers.google.com/jobs/results/' });
assert.strictEqual(validResult.isValid, true);

console.log('✓ URL schema input validation verified');

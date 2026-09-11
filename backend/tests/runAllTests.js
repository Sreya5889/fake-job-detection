/**
 * Test Runner: Executes all backend test suites
 */
process.env.NODE_ENV = 'test';

console.log('====================================================');
console.log('FAKE JOB DETECTION BACKEND — TEST SUITE EXECUTION');
console.log('====================================================');

try {
  await import('./detector.test.js');
  await import('./url.test.js');
  await import('./auth.test.js');

  console.log('\n====================================================');
  console.log('ALL BACKEND TESTS PASSED SUCCESSFULLY! (0 Failures)');
  console.log('====================================================\n');
  process.exit(0);
} catch (err) {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
}

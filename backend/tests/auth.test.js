import assert from 'assert';
import {
  hashPassword,
  comparePassword,
  generateToken,
  registerUser,
  loginUser
} from '../src/services/authService.js';
import {
  validateRegisterInput,
  validateLoginInput
} from '../src/validators/authValidator.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

console.log('\n--- Running Authentication & Password Security Tests ---');

// 1. Password Hashing & Comparison
const testPass = 'SecureP@ssw0rd123';
const hash = await hashPassword(testPass);
assert.notStrictEqual(hash, testPass, 'Hash must not equal plaintext password');
assert.strictEqual(await comparePassword(testPass, hash), true, 'Correct password must compare true');
assert.strictEqual(await comparePassword('WrongPassword', hash), false, 'Incorrect password must compare false');

console.log('✓ Password hashing and verification working correctly');

// 2. JWT Signing & Verification
const testUser = { id: 'usr_test_123', email: 'tester@example.com', name: 'Tester' };
const token = generateToken(testUser);
assert.ok(typeof token === 'string' && token.length > 20, 'Token must be a valid JWT string');

const decoded = jwt.verify(token, env.JWT_SECRET);
assert.strictEqual(decoded.id, testUser.id);
assert.strictEqual(decoded.email, testUser.email);
assert.strictEqual(decoded.name, testUser.name);

console.log('✓ JWT token generation and payload decoding verified');

// 3. Validation Rules
const invalidReg = validateRegisterInput({ name: '', email: 'bad-email', password: '123' });
assert.strictEqual(invalidReg.isValid, false);
assert.ok(invalidReg.errors.name, 'Should require name');
assert.ok(invalidReg.errors.email, 'Should require valid email');
assert.ok(invalidReg.errors.password, 'Should require min 6 char password');

const validReg = validateRegisterInput({
  name: 'Sreya',
  email: 'sreya@example.com',
  password: 'password123'
});
assert.strictEqual(validReg.isValid, true);

console.log('✓ Registration validation rules enforced correctly');

// 4. Registration and Login Flow
const uniqueEmail = `test_${Date.now()}@example.com`;
const regResult = await registerUser({
  name: 'Sreya',
  email: uniqueEmail,
  password: 'password123'
});

assert.ok(regResult.user);
assert.strictEqual(regResult.user.email, uniqueEmail);
assert.ok(regResult.token);

const loginResult = await loginUser(uniqueEmail, 'password123');
assert.ok(loginResult.user);
assert.strictEqual(loginResult.user.email, uniqueEmail);
assert.ok(loginResult.token);

// Test invalid password login
try {
  await loginUser(uniqueEmail, 'incorrectPassword');
  assert.fail('Login should fail with invalid password');
} catch (err) {
  assert.strictEqual(err.statusCode, 401);
}

console.log('✓ User registration, login, and rejection of invalid credentials verified');

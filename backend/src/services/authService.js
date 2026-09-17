import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../config/supabase.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';


/**
 * Hash plain text password using bcrypt
 */
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare plain text password against bcrypt hash
 */
export async function comparePassword(plainPassword, passwordHash) {
  return await bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generate signed JWT authentication token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

/**
 * Register a new user in Supabase PostgreSQL
 */
export async function registerUser(input = {}) {
  const displayName = (input.name || input.full_name || '').trim();
  const { email, password } = input;
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const supabase = getSupabaseClient();

  if (!supabase) {
    const err = new Error('Database service unavailable.');
    err.statusCode = 500;
    throw err;
  }

  // 1. Check if user exists in Supabase
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
    logger.error('Supabase user check error:', checkError);
    const err = new Error('Database operation failed.');
    err.statusCode = 500;
    throw err;
  }

  if (existingUser) {
    const err = new Error('An account with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  // 2. Insert new user record into Supabase PostgreSQL
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        name: displayName || 'User',
        email: normalizedEmail,
        password_hash: passwordHash
      }
    ])
    .select('id, name, email, created_at')
    .single();

  if (insertError) {
    logger.error('Supabase user insert error:', insertError);
    const err = new Error('Database operation failed: Failed to create user account.');
    err.statusCode = 500;
    throw err;
  }

  const token = generateToken(newUser);
  return { user: newUser, token };
}

/**
 * Authenticate user with email and password from Supabase PostgreSQL
 */
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (!supabase) {
    const err = new Error('Database service unavailable.');
    err.statusCode = 500;
    throw err;
  }

  const { data: userRecord, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, created_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    logger.error('Supabase user login lookup error:', error);
    const err = new Error('Database operation failed.');
    err.statusCode = 500;
    throw err;
  }

  if (!userRecord) {
    logger.warn(`[AUTH] Login failed: User not found for email: ${normalizedEmail}`);
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  logger.info(`[AUTH] User found in Supabase (${userRecord.id}). Verifying credentials...`);

  // Handle password comparison & incompatible / legacy format migration
  let isPasswordValid = false;
  const storedHash = userRecord.password_hash || '';

  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    isPasswordValid = await comparePassword(password, storedHash);
  } else if (storedHash === password) {
    // Legacy plain-text password detected: automatically migrate to salted bcrypt hash
    logger.info(`[AUTH] Migrating legacy plain-text password to salted bcrypt hash for user ID: ${userRecord.id}`);
    const newHash = await hashPassword(password);
    await supabase.from('users').update({ password_hash: newHash }).eq('id', userRecord.id);
    userRecord.password_hash = newHash;
    isPasswordValid = true;
  } else {
    logger.warn(`[AUTH] Incompatible password format detected for user ID: ${userRecord.id}`);
    isPasswordValid = false;
  }

  if (!isPasswordValid) {
    logger.warn(`[AUTH] Login failed: Incorrect password for user: ${normalizedEmail}`);
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  logger.info(`[AUTH] Password verified successfully for user: ${normalizedEmail}. Issuing JWT...`);
  const token = generateToken(userRecord);
  const { password_hash, ...safeUser } = userRecord;

  return { user: safeUser, token };
}

/**
 * Fetch user profile by ID from Supabase PostgreSQL
 */
export async function getUserById(userId) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const err = new Error('Database service unavailable.');
    err.statusCode = 500;
    throw err;
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    logger.error('Supabase getUserById error:', error);
    const err = new Error('Database operation failed.');
    err.statusCode = 500;
    throw err;
  }
  return data;
}

/**
 * Update user profile in Supabase PostgreSQL (only allowed fields: name, email)
 */
export async function updateUserProfile(userId, { name, email }) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const err = new Error('Database service unavailable.');
    err.statusCode = 500;
    throw err;
  }

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, name, email, created_at, updated_at')
    .single();

  if (error) {
    logger.error('Supabase updateUserProfile error:', error);
    const err = new Error('Database operation failed.');
    err.statusCode = 500;
    throw err;
  }
  return data;
}

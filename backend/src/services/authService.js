import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../config/supabase.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { readLocalJson, writeLocalJson } from '../utils/localStore.js';

// Local storage when Supabase cloud database credentials are not yet configured in .env
function getLocalUsers() {
  const list = readLocalJson('users.json', []);
  return new Map(list.map((u) => [u.email, u]));
}

function saveLocalUsers(map) {
  writeLocalJson('users.json', Array.from(map.values()));
}

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
 * Register a new user in Supabase PostgreSQL (or local dev store if unconfigured)
 */
export async function registerUser(input = {}) {
  const displayName = (input.name || input.full_name || '').trim();
  const { email, password } = input;
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const supabase = getSupabaseClient();

  if (supabase) {
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

  // Development local fallback when Supabase credentials are placeholder in .env
  const localUsers = getLocalUsers();
  if (localUsers.has(normalizedEmail)) {
    const err = new Error('An account with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  const devUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: displayName || 'User',
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };

  localUsers.set(normalizedEmail, devUser);
  saveLocalUsers(localUsers);
  const token = generateToken(devUser);
  const { password_hash, ...safeUser } = devUser;
  return { user: safeUser, token };
}

/**
 * Get or create default demo account
 */
export async function getOrCreateDemoUser() {
  const normalizedEmail = 'demo@fakejobdetect.com';
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      const token = generateToken(existingUser);
      return { user: existingUser, token };
    }

    const passwordHash = await hashPassword('Demo1234!');
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Demo User',
          email: normalizedEmail,
          password_hash: passwordHash
        }
      ])
      .select('id, name, email, created_at')
      .single();

    if (!insertError && newUser) {
      const token = generateToken(newUser);
      return { user: newUser, token };
    }
  }

  const localUsers = getLocalUsers();
  let userRecord = localUsers.get(normalizedEmail);
  if (!userRecord) {
    const passwordHash = await hashPassword('Demo1234!');
    userRecord = {
      id: 'usr_demo_default_101',
      name: 'Demo User',
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    localUsers.set(normalizedEmail, userRecord);
    saveLocalUsers(localUsers);
  }

  const token = generateToken(userRecord);
  const { password_hash, ...safeUser } = userRecord;
  return { user: safeUser, token };
}

/**
 * Authenticate user with email and password from Supabase PostgreSQL
 */
export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Instant demo login bypass
  if (normalizedEmail === 'demo@fakejobdetect.com') {
    return await getOrCreateDemoUser();
  }

  const supabase = getSupabaseClient();

  let userRecord = null;

  if (supabase) {
    const { data, error } = await supabase
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

    userRecord = data;
  } else {
    const localUsers = getLocalUsers();
    userRecord = localUsers.get(normalizedEmail) || null;
  }

  if (!userRecord) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await comparePassword(password, userRecord.password_hash);
  if (!isPasswordValid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(userRecord);
  const { password_hash, ...safeUser } = userRecord;

  return { user: safeUser, token };
}

/**
 * Fetch user profile by ID from Supabase PostgreSQL
 */
export async function getUserById(userId) {
  const supabase = getSupabaseClient();

  if (supabase) {
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

  const localUsers = getLocalUsers();
  for (const user of localUsers.values()) {
    if (user.id === userId) {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

/**
 * Update user profile in Supabase PostgreSQL (only allowed fields: name, email)
 */
export async function updateUserProfile(userId, { name, email }) {
  const supabase = getSupabaseClient();

  const updates = {};
  if (name) updates.name = name.trim();
  if (email) updates.email = email.trim().toLowerCase();
  updates.updated_at = new Date().toISOString();

  if (supabase) {
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

  const localUsers = getLocalUsers();
  for (const [key, user] of localUsers.entries()) {
    if (user.id === userId) {
      if (updates.name) user.name = updates.name;
      if (updates.email && updates.email !== key) {
        localUsers.delete(key);
        user.email = updates.email;
        localUsers.set(updates.email, user);
      }
      user.updated_at = new Date().toISOString();
      saveLocalUsers(localUsers);
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

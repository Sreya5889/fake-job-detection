import { getUserById, updateUserProfile } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import validator from 'validator';

/**
 * Retrieve user profile details
 * GET /api/users/me
 */
export async function getProfile(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }
    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
}

/**
 * Update allowed profile fields (name, email)
 * PUT /api/users/me
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const errors = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || validator.isEmpty(name.trim())) {
        errors.name = 'Full name cannot be empty.';
      } else if (name.trim().length < 2) {
        errors.name = 'Full name must be at least 2 characters long.';
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !validator.isEmail(email.trim())) {
        errors.email = 'Please provide a valid email address.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return errorResponse(res, 'Validation error.', 400, errors);
    }

    // Explicitly reject tampering with internal fields
    const disallowedFields = ['id', 'password_hash', 'created_at', 'role'];
    const attemptedDisallowed = disallowedFields.filter((f) => req.body[f] !== undefined);
    if (attemptedDisallowed.length > 0) {
      return errorResponse(res, `Modifying protected field(s) '${attemptedDisallowed.join(', ')}' is forbidden.`, 403);
    }

    const updated = await updateUserProfile(req.user.id, { name, email });
    return successResponse(res, updated, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

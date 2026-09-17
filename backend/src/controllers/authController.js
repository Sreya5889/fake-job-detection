import { registerUser, loginUser, getUserById } from '../services/authService.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const { isValid, errors } = validateRegisterInput(req.body || {});
    if (!isValid) {
      return errorResponse(res, 'Validation error during registration.', 400, errors);
    }

    const { user, token } = await registerUser(req.body);

    return successResponse(
      res,
      { user, token },
      'Registration successful. Welcome to Fake Job Detection!',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body || {});
    if (!isValid) {
      return errorResponse(res, 'Validation error during login.', 400, errors);
    }

    const email = req.body.email || req.body.username || req.body.identifier;
    const { password } = req.body;
    const { user, token } = await loginUser(email, password);

    return successResponse(
      res,
      { user, token },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}


export async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User account not found.', 404);
    }

    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}

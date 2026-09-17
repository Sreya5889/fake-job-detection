import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/response.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Authentication required. Token is missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach authenticated user information to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Your session has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
}




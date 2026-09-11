import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';

export function notFoundHandler(req, res, next) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  // Multer-specific errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File is too large. Maximum size is 10MB.', 400);
    }
    return errorResponse(res, `File upload error: ${err.message}`, 400);
  }

  // Syntax errors (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload in request body.', 400);
  }

  const statusCode = err.statusCode || (res.statusCode && res.statusCode >= 400 ? res.statusCode : 500);

  // User-friendly messages without leaking sensitive internals
  let clientMessage = err.message || 'An unexpected internal server error occurred.';
  
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    clientMessage = 'An unexpected server error occurred. Please try again later.';
  }

  return errorResponse(res, clientMessage, statusCode, err.errors || null);
}

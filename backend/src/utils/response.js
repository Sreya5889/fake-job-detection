/**
 * Standardized API Response Utilities
 */

export function successResponse(res, data = {}, message = null, statusCode = 200) {
  const payload = {
    success: true,
    data
  };

  if (message) {
    payload.message = message;
  }

  return res.status(statusCode).json(payload);
}

export function errorResponse(res, message = 'Something went wrong', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

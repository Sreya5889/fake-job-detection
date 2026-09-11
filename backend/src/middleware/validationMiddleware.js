import { errorResponse } from '../utils/response.js';

/**
 * Creates a middleware that executes a validation function against req.body
 */
export function validateBody(validatorFn) {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body || {});
    if (!isValid) {
      return errorResponse(res, 'Validation error. Please check submitted fields.', 400, errors);
    }
    next();
  };
}

import validator from 'validator';

export function validateRegisterInput(body = {}) {
  const name = body.name || body.full_name;
  const { email, password } = body;
  const errors = {};

  if (!name || typeof name !== 'string' || validator.isEmpty(name.trim())) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters long.';
  }

  if (!email || typeof email !== 'string' || validator.isEmpty(email.trim())) {
    errors.email = 'Email address is required.';
  } else if (!validator.isEmail(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password || typeof password !== 'string' || validator.isEmpty(password)) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateLoginInput({ email, password }) {
  const errors = {};

  if (!email || typeof email !== 'string' || validator.isEmpty(email.trim())) {
    errors.email = 'Email address is required.';
  } else if (!validator.isEmail(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password || typeof password !== 'string' || validator.isEmpty(password)) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

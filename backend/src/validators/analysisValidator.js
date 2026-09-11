import validator from 'validator';

export function validateTextInput({ text }) {
  const errors = {};

  if (!text || typeof text !== 'string' || validator.isEmpty(text.trim())) {
    errors.text = 'Job description text is required.';
  } else if (text.trim().length < 20) {
    errors.text = 'Job description must be at least 20 characters long for analysis.';
  } else if (text.trim().length > 50000) {
    errors.text = 'Job description exceeds maximum allowed length (50,000 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateUrlInput({ url }) {
  const errors = {};

  if (!url || typeof url !== 'string' || validator.isEmpty(url.trim())) {
    errors.url = 'Job posting URL is required.';
  } else if (!validator.isURL(url.trim(), { protocols: ['http', 'https'], require_protocol: true })) {
    errors.url = 'Please provide a valid URL beginning with http:// or https://';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

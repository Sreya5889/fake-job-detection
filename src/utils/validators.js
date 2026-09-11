/**
 * Email validation regex
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * URL validation regex (accepts http, https, or domain with path)
 */
export function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const url = new URL(urlString.startsWith('http://') || urlString.startsWith('https://') 
      ? urlString 
      : `https://${urlString}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * Validate supported image MIME types and file extensions
 */
export function isValidImageFile(file) {
  if (!file) return { valid: false, message: 'No file provided' };
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!hasValidType && !hasValidExtension) {
    return { valid: false, message: 'Please upload a supported image (JPG, JPEG, or PNG).' };
  }
  
  // Max size 10MB
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: 'File is too large. Maximum size is 10MB.' };
  }
  
  return { valid: true };
}

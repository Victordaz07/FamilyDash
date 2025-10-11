/**
 * Input Sanitization Utilities
 * Prevents XSS, script injection, and other malicious inputs
 * 
 * SECURITY: Use these functions before storing user input in Firestore
 */

/**
 * Sanitize a string by removing potentially dangerous content
 * Removes: script tags, iframe tags, javascript: protocols, event handlers
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and content
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove data: URLs (can contain executable code)
    .replace(/data:text\/html/gi, '');
};

/**
 * Sanitize an object recursively
 * Applies string sanitization to all string values in the object
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      sanitized[key] = typeof value === 'string' 
        ? sanitizeString(value)
        : typeof value === 'object'
        ? sanitizeObject(value)
        : value;
    }
  }
  return sanitized;
};

/**
 * Validate and sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.trim().toLowerCase();
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize filename for safe storage
 * Removes path traversal attempts and dangerous characters
 */
export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .trim()
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>:"|?*]/g, '')
    // Limit length
    .substring(0, 255);
};

/**
 * Sanitize URL for safe storage
 * Validates URL format and removes javascript: and data: protocols
 */
export const sanitizeURL = (url: string): string => {
  if (typeof url !== 'string') return '';
  
  const sanitized = url.trim();
  
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(sanitized)) {
    return '';
  }
  
  // Only allow http, https, and relative URLs
  if (!/^(https?:\/\/|\/)/i.test(sanitized)) {
    return '';
  }
  
  return sanitized;
};

/**
 * Sanitize HTML content (basic version)
 * For more complex HTML sanitization, consider using a library like DOMPurify
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};


/**
 * Sanitization utilities for user input data
 * Prevents XSS and ensures data integrity
 */

/**
 * Sanitize HTML content by escaping special characters
 * @param content Raw HTML content
 * @returns Escaped HTML content
 */
export function sanitizeHtml(content: string): string {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return content.replace(/[&<>"'\/]/g, (match) => htmlEscapeMap[match]);
}

/**
 * Sanitize user input text by trimming and removing potentially harmful content
 * @param text Raw text input
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitize tags array by cleaning each tag
 * @param tags Array of tag strings
 * @returns Array of sanitized tags
 */
export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => sanitizeText(tag))
    .filter(tag => tag.length > 0)
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 tags
}

/**
 * Sanitize game title with additional validation
 * @param title Raw title string
 * @returns Sanitized title
 */
export function sanitizeTitle(title: string): string {
  const sanitized = sanitizeText(title);
  
  // Remove any remaining script tags or suspicious content
  return sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Sanitize description with line break preservation
 * @param description Raw description string
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string): string {
  return sanitizeText(description)
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}

/**
 * Validate and sanitize author name
 * @param author Raw author name
 * @returns Sanitized author name
 */
export function sanitizeAuthor(author: string): string {
  const sanitized = sanitizeText(author);
  
  // Additional validation for author names (no special characters except hyphen, underscore, space)
  return sanitized.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim();
}

/**
 * Deep sanitize an object by applying appropriate sanitization to each field
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function deepSanitize<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
      sanitized[key] = sanitizeTags(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = deepSanitize(value);
    }
  });
  
  return sanitized;
}

/**
 * Remove potentially dangerous content from URLs (additional layer beyond URL validation)
 * @param url URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  return url
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/<script/gi, '')
    .trim();
}
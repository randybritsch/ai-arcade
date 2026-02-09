import { ValidationResult } from '../types/game';
import { URL_PATTERNS } from '../utils/constants';

export class URLValidator {
  /**
   * Validates and normalizes a URL for safety and correctness
   * @param url Raw URL string to validate
   * @returns ValidationResult with status and normalized URL
   */
  static validate(url: string): ValidationResult {
    // Basic sanitization - trim whitespace
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      return {
        isValid: false,
        error: 'URL is required'
      };
    }

    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Basic URL format validation
    if (!URL_PATTERNS.URL_REGEX.test(normalizedUrl)) {
      return {
        isValid: false,
        error: 'Please enter a valid URL'
      };
    }

    try {
      const urlObj = new URL(normalizedUrl);
      
      // Security: Only allow http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS URLs are allowed'
        };
      }

      // Additional security check for common malicious patterns
      if (this.containsUnsafePatterns(normalizedUrl)) {
        return {
          isValid: false,
          error: 'URL contains potentially unsafe content'
        };
      }

      return {
        isValid: true,
        normalizedUrl: urlObj.toString()
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Sanitizes URL for safe storage and display
   * @param url URL to sanitize
   * @returns Sanitized URL string
   */
  static sanitize(url: string): string {
    const result = this.validate(url);
    return result.normalizedUrl || url;
  }

  /**
   * Checks if URL points to a likely game hosting domain
   * @param url URL to check
   * @returns True if domain is in allowlist
   */
  static isGameUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      return URL_PATTERNS.ALLOWED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  /**
   * Extracts domain from URL for display purposes
   * @param url URL to extract domain from
   * @returns Domain string or 'Unknown' if parsing fails
   */
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Checks for potentially unsafe URL patterns
   * @param url URL to check
   * @returns True if unsafe patterns detected
   */
  private static containsUnsafePatterns(url: string): boolean {
    const unsafePatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /<script/i,
      /onclick/i,
      /onerror/i,
    ];

    return unsafePatterns.some(pattern => pattern.test(url));
  }
}
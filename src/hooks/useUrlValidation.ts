import { useState, useCallback } from 'react';
import { URLValidator } from '../services/urlValidator';
import { ValidationResult } from '../types/game';

/**
 * Custom hook for URL validation with reactive state
 * Provides real-time validation feedback for form inputs
 */
export function useUrlValidation() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = useCallback(async (url: string): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      // Add small delay to simulate async validation and debounce rapid changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = URLValidator.validate(url);
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateUrlSync = useCallback((url: string): ValidationResult => {
    const result = URLValidator.validate(url);
    setValidationResult(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  const isGameUrl = useCallback((url: string): boolean => {
    return URLValidator.isGameUrl(url);
  }, []);

  const getDomain = useCallback((url: string): string => {
    return URLValidator.extractDomain(url);
  }, []);

  const sanitizeUrl = useCallback((url: string): string => {
    return URLValidator.sanitize(url);
  }, []);

  return {
    // State
    validationResult,
    isValidating,
    isValid: validationResult?.isValid ?? null,
    error: validationResult?.error ?? null,
    normalizedUrl: validationResult?.normalizedUrl ?? null,
    
    // Actions
    validateUrl,
    validateUrlSync,
    clearValidation,
    isGameUrl,
    getDomain,
    sanitizeUrl,
  };
}
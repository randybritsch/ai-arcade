import { renderHook, act } from '@testing-library/react';
import { useUrlValidation } from '../useUrlValidation';
import { URLValidator } from '../../services/urlValidator';

// Mock the URLValidator
jest.mock('../../services/urlValidator');
const MockURLValidator = URLValidator as jest.Mocked<typeof URLValidator>;

describe('useUrlValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useUrlValidation());

    expect(result.current.url).toBe('');
    expect(result.current.normalizedUrl).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.isValidating).toBe(false);
  });

  it('initializes with provided initial URL', () => {
    MockURLValidator.validate.mockReturnValue(true);
    MockURLValidator.normalize.mockReturnValue('https://itch.io/game');
    MockURLValidator.getValidationError.mockReturnValue('');

    const { result } = renderHook(() => useUrlValidation('https://itch.io/game'));

    expect(result.current.url).toBe('https://itch.io/game');
    expect(result.current.normalizedUrl).toBe('https://itch.io/game');
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('validates URL with debouncing', async () => {
    MockURLValidator.validate.mockReturnValue(true);
    MockURLValidator.normalize.mockReturnValue('https://itch.io/normalized');
    MockURLValidator.getValidationError.mockReturnValue('');

    const { result } = renderHook(() => useUrlValidation());

    // Set URL
    act(() => {
      result.current.setUrl('https://itch.io/game');
    });

    // Should be validating initially
    expect(result.current.isValidating).toBe(true);
    expect(result.current.url).toBe('https://itch.io/game');

    // Fast-forward through debounce delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should now be validated
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.normalizedUrl).toBe('https://itch.io/normalized');
    expect(result.current.error).toBe('');
    expect(MockURLValidator.validate).toHaveBeenCalledWith('https://itch.io/game');
    expect(MockURLValidator.normalize).toHaveBeenCalledWith('https://itch.io/game');
  });

  it('handles invalid URL validation', () => {
    MockURLValidator.validate.mockReturnValue(false);
    MockURLValidator.normalize.mockReturnValue('https://invalid.com');
    MockURLValidator.getValidationError.mockReturnValue('Domain not allowed');

    const { result } = renderHook(() => useUrlValidation());

    act(() => {
      result.current.setUrl('https://invalid.com');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Domain not allowed');
    expect(result.current.normalizedUrl).toBe('https://invalid.com');
  });

  it('cancels previous validation when URL changes quickly', () => {
    MockURLValidator.validate.mockReturnValue(true);
    MockURLValidator.normalize.mockReturnValue('https://itch.io/final');
    MockURLValidator.getValidationError.mockReturnValue('');

    const { result } = renderHook(() => useUrlValidation());

    // Set first URL
    act(() => {
      result.current.setUrl('https://itch.io/first');
    });

    expect(result.current.isValidating).toBe(true);

    // Change URL before debounce completes
    act(() => {
      jest.advanceTimersByTime(100); // Less than 300ms
      result.current.setUrl('https://itch.io/second');
    });

    // Complete debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should validate the latest URL only
    expect(MockURLValidator.validate).toHaveBeenCalledTimes(1);
    expect(MockURLValidator.validate).toHaveBeenCalledWith('https://itch.io/second');
    expect(result.current.url).toBe('https://itch.io/second');
  });

  it('handles empty URL', () => {
    const { result } = renderHook(() => useUrlValidation('https://itch.io/initial'));

    act(() => {
      result.current.setUrl('');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.url).toBe('');
    expect(result.current.normalizedUrl).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.isValidating).toBe(false);
    expect(MockURLValidator.validate).not.toHaveBeenCalled();
  });

  it('maintains validation state during rapid URL changes', () => {
    const { result } = renderHook(() => useUrlValidation());

    // Rapid URL changes
    act(() => {
      result.current.setUrl('https://itch.io/1');
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.setUrl('https://itch.io/2');
    });

    act(() => {
      jest.advanceTimersByTime(50);
      result.current.setUrl('https://itch.io/3');
    });

    // Should still be validating
    expect(result.current.isValidating).toBe(true);

    // Complete debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
  });

  it('cleans up validation timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useUrlValidation());

    act(() => {
      result.current.setUrl('https://itch.io/game');
    });

    expect(result.current.isValidating).toBe(true);

    // Unmount before validation completes
    unmount();

    // Advance timers after unmount
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Validator should not have been called
    expect(MockURLValidator.validate).not.toHaveBeenCalled();
  });

  it('preserves URL state when validation is in progress', () => {
    const { result } = renderHook(() => useUrlValidation());

    const testUrl = 'https://itch.io/test-game';

    act(() => {
      result.current.setUrl(testUrl);
    });

    // URL should be set immediately, even while validating
    expect(result.current.url).toBe(testUrl);
    expect(result.current.isValidating).toBe(true);

    // Previous validation state should be preserved until new validation completes
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.normalizedUrl).toBe('');
  });

  it('handles validation errors gracefully', () => {
    MockURLValidator.validate.mockImplementation(() => {
      throw new Error('Validation error');
    });

    const { result } = renderHook(() => useUrlValidation());

    act(() => {
      result.current.setUrl('https://itch.io/game');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should handle the error and set appropriate state
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Validation failed');
  });

  it('resets error when URL becomes valid', () => {
    // First validation fails
    MockURLValidator.validate.mockReturnValueOnce(false);
    MockURLValidator.getValidationError.mockReturnValueOnce('Invalid domain');

    const { result } = renderHook(() => useUrlValidation());

    act(() => {
      result.current.setUrl('https://invalid.com');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.error).toBe('Invalid domain');

    // Second validation succeeds
    MockURLValidator.validate.mockReturnValueOnce(true);
    MockURLValidator.getValidationError.mockReturnValueOnce('');
    MockURLValidator.normalize.mockReturnValueOnce('https://itch.io/valid');

    act(() => {
      result.current.setUrl('https://itch.io/valid');
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.error).toBe('');
    expect(result.current.isValid).toBe(true);
  });
});
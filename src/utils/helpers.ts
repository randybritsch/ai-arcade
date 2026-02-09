import { VALIDATION_LIMITS } from './constants';

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Format date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return 'Unknown';
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Validate game data before submission
 */
export function validateGameData(data: {
  title: string;
  url: string;
  description?: string;
  author?: string;
  tags: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Title validation
  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
    errors.push(`Title must be less than ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters`);
  }
  
  // URL validation
  if (!data.url.trim()) {
    errors.push('URL is required');
  }
  
  // Description validation
  if (data.description && data.description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description must be less than ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters`);
  }
  
  // Author validation
  if (data.author && data.author.length > VALIDATION_LIMITS.AUTHOR_MAX_LENGTH) {
    errors.push(`Author name must be less than ${VALIDATION_LIMITS.AUTHOR_MAX_LENGTH} characters`);
  }
  
  // Tags validation
  if (data.tags.length > VALIDATION_LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${VALIDATION_LIMITS.MAX_TAGS} tags allowed`);
  }
  
  data.tags.forEach((tag, index) => {
    if (tag.length > VALIDATION_LIMITS.TAG_MAX_LENGTH) {
      errors.push(`Tag ${index + 1} must be less than ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      
      document.body.prepend(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch {
        return false;
      } finally {
        textArea.remove();
      }
    }
  } catch {
    return false;
  }
}

/**
 * Generate a random color for tags
 */
export function generateTagColor(tag: string): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ];
  
  // Use tag content to consistently generate same color
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastDot = pathname.lastIndexOf('.');
    
    if (lastDot === -1) {
      return '';
    }
    
    return pathname.substring(lastDot + 1).toLowerCase();
  } catch {
    return '';
  }
}
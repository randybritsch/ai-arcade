// LocalStorage keys as defined in spec
export const STORAGE_KEYS = {
  GAMES: 'ai-arcade:games',
  APP_STATE: 'ai-arcade:state',
  ADMIN_CONFIG: 'ai-arcade:admin',
  SCHEMA_VERSION: 'ai-arcade:schema'
} as const;

// Data validation constants
export const VALIDATION_LIMITS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  AUTHOR_MAX_LENGTH: 50,
  TAG_MAX_LENGTH: 20,
  MAX_TAGS: 10,
  MAX_GAMES_STORAGE: 300, // Performance threshold
} as const;

// URL validation patterns
export const URL_PATTERNS = {
  // Basic URL validation pattern
  URL_REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Common game hosting domains (allowlist for additional security)
  ALLOWED_DOMAINS: [
    'codepen.io',
    'jsfiddle.net',
    'codesandbox.io',
    'replit.com',
    'github.io',
    'netlify.app',
    'vercel.app',
    'surge.sh',
    'glitch.me',
    'js.org',
  ],
} as const;

// App configuration
export const APP_CONFIG = {
  SCHEMA_VERSION: 1,
  LOCAL_STORAGE_QUOTA_WARNING: 8 * 1024 * 1024, // 8MB warning threshold
  DEBOUNCE_SEARCH_MS: 300,
  PAGINATION_SIZE: 12,
  AUTO_SAVE_INTERVAL_MS: 30000, // 30 seconds
} as const;

// Admin configuration
export const ADMIN_CONFIG = {
  ADMIN_PASSWORD: 'arcade-admin', // Simple password for demo - in production would be more secure
  BULK_OPERATION_LIMIT: 50, // Max items for bulk operations
} as const;

// CSS class names for styling consistency
export const CSS_CLASSES = {
  BUTTON_PRIMARY: 'btn btn-primary',
  BUTTON_SECONDARY: 'btn btn-secondary',
  BUTTON_DANGER: 'btn btn-danger',
  CARD: 'game-card',
  MODAL: 'modal',
  LOADING: 'loading-spinner',
} as const;
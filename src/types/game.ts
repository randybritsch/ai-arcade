// Primary data schema for games
export interface Game {
  id: string;                    // UUID v4
  title: string;                 // 1-100 chars
  url: string;                   // Validated URL
  description?: string;          // 0-500 chars
  author?: string;               // 0-50 chars, display name
  tags: string[];                // 0-10 tags, max 20 chars each
  submittedAt: string;           // ISO 8601 timestamp
  featured: boolean;             // Admin-set feature flag
  playCount: number;             // View counter
  status: 'active' | 'hidden';   // Moderation status
}

// Application state structure
export interface AppState {
  games: Game[];
  filters: {
    tags: string[];
    featured: boolean;
    searchTerm: string;
  };
  adminMode: boolean;
  lastSync: string;
}

// Form data for game submission
export interface GameSubmissionData {
  title: string;
  url: string;
  description?: string;
  author?: string;
  tags: string[];
}

// URL validation result
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
}

// Storage schema
export interface StorageVersion {
  version: number;
  migrationDate: string;
  dataFormat: string;
}

// Filter options for game gallery
export interface GameFilters {
  tags: string[];
  featured: boolean;
  searchTerm: string;
  status?: 'active' | 'hidden' | 'all';
}
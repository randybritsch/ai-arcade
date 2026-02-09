// Admin configuration and state
export interface AdminConfig {
  isAdminMode: boolean;
  moderationQueue: string[]; // Game IDs that need review
  featuredGames: string[];   // Game IDs that are featured
}

// Admin actions for game management
export interface AdminActions {
  clearAllGames: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  featureGame: (gameId: string) => Promise<void>;
  unfeatureGame: (gameId: string) => Promise<void>;
  hideGame: (gameId: string) => Promise<void>;
  showGame: (gameId: string) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

// Bulk operations for admin panel
export interface BulkOperations {
  selectedGameIds: string[];
  action: 'feature' | 'unfeature' | 'hide' | 'show' | 'delete';
}

// Statistics for admin dashboard
export interface AdminStats {
  totalGames: number;
  activeGames: number;
  hiddenGames: number;
  featuredGames: number;
  totalPlays: number;
  averageRating?: number;
}
import { Game } from '../types/game';
import { STORAGE_KEYS, APP_CONFIG } from '../utils/constants';
import { URLValidator } from './urlValidator';
import { v4 as uuidv4 } from 'uuid';

export class GameStorage {
  /**
   * Save a new game to localStorage
   * @param game Game object to save
   * @throws Error if storage quota exceeded or validation fails
   */
  static async save(game: Omit<Game, 'id' | 'submittedAt' | 'playCount'>): Promise<void> {
    // Validate URL before saving
    const validation = URLValidator.validate(game.url);
    if (!validation.isValid) {
      throw new Error(`Invalid URL: ${validation.error}`);
    }

    // Create complete game object
    const newGame: Game = {
      id: uuidv4(),
      title: game.title.trim(),
      url: validation.normalizedUrl!,
      description: game.description?.trim(),
      author: game.author?.trim(),
      tags: game.tags.map(tag => tag.trim()).filter(Boolean),
      submittedAt: new Date().toISOString(),
      featured: false,
      playCount: 0,
      status: 'active'
    };

    const existingGames = await this.getAll();
    const updatedGames = [...existingGames, newGame];

    await this.saveGames(updatedGames);
  }

  /**
   * Retrieve all games from localStorage
   * @returns Promise resolving to array of games
   */
  static async getAll(): Promise<Game[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (!data) {
        return [];
      }

      const games = JSON.parse(data) as Game[];
      return Array.isArray(games) ? games : [];
    } catch (error) {
      console.error('Error loading games from storage:', error);
      return [];
    }
  }

  /**
   * Get a specific game by ID
   * @param id Game ID to retrieve
   * @returns Promise resolving to game or null if not found
   */
  static async getById(id: string): Promise<Game | null> {
    const games = await this.getAll();
    return games.find(game => game.id === id) || null;
  }

  /**
   * Update an existing game
   * @param id Game ID to update
   * @param updates Partial game object with updates
   */
  static async update(id: string, updates: Partial<Game>): Promise<void> {
    const games = await this.getAll();
    const gameIndex = games.findIndex(game => game.id === id);
    
    if (gameIndex === -1) {
      throw new Error('Game not found');
    }

    // Validate URL if it's being updated
    if (updates.url) {
      const validation = URLValidator.validate(updates.url);
      if (!validation.isValid) {
        throw new Error(`Invalid URL: ${validation.error}`);
      }
      updates.url = validation.normalizedUrl;
    }

    games[gameIndex] = { ...games[gameIndex], ...updates };
    await this.saveGames(games);
  }

  /**
   * Delete a game by ID
   * @param id Game ID to delete
   */
  static async delete(id: string): Promise<void> {
    const games = await this.getAll();
    const filteredGames = games.filter(game => game.id !== id);
    await this.saveGames(filteredGames);
  }

  /**
   * Clear all games from storage
   */
  static async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.GAMES);
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
  }

  /**
   * Export all games as JSON string
   * @returns Promise resolving to JSON export
   */
  static async export(): Promise<string> {
    const games = await this.getAll();
    const exportData = {
      games,
      exportDate: new Date().toISOString(),
      version: APP_CONFIG.SCHEMA_VERSION
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import games from JSON data
   * @param data JSON string containing game data
   */
  static async import(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.games || !Array.isArray(importData.games)) {
        throw new Error('Invalid import format: missing games array');
      }

      // Validate each game before importing
      for (const game of importData.games) {
        if (!this.isValidGame(game)) {
          throw new Error('Invalid game data in import');
        }
      }

      await this.saveGames(importData.games);
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Increment play count for a game
   * @param id Game ID to increment play count
   */
  static async incrementPlayCount(id: string): Promise<void> {
    const game = await this.getById(id);
    if (game) {
      await this.update(id, { playCount: game.playCount + 1 });
    }
  }

  /**
   * Get filtered games based on criteria
   * @param filters Filter criteria
   * @returns Promise resolving to filtered games array
   */
  static async getFiltered(filters: {
    searchTerm?: string;
    tags?: string[];
    featured?: boolean;
    status?: 'active' | 'hidden' | 'all';
  }): Promise<Game[]> {
    const games = await this.getAll();
    
    return games.filter(game => {
      // Status filter
      if (filters.status && filters.status !== 'all' && game.status !== filters.status) {
        return false;
      }

      // Featured filter
      if (filters.featured !== undefined && game.featured !== filters.featured) {
        return false;
      }

      // Search term filter (title, description, author)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(searchLower);
        const matchesDescription = game.description?.toLowerCase().includes(searchLower) || false;
        const matchesAuthor = game.author?.toLowerCase().includes(searchLower) || false;
        
        if (!matchesTitle && !matchesDescription && !matchesAuthor) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          game.tags.some(gameTag => 
            gameTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Private helper to save games array to localStorage
   * @param games Games array to save
   */
  private static async saveGames(games: Game[]): Promise<void> {
    try {
      // Check storage quota
      const dataString = JSON.stringify(games);
      const sizeInBytes = new Blob([dataString]).size;
      
      if (sizeInBytes > APP_CONFIG.LOCAL_STORAGE_QUOTA_WARNING) {
        console.warn('Approaching localStorage quota limit');
      }

      localStorage.setItem(STORAGE_KEYS.GAMES, dataString);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some games or export your data.');
      }
      throw new Error('Failed to save games to storage');
    }
  }

  /**
   * Validate game object structure
   * @param game Object to validate
   * @returns True if valid game object
   */
  private static isValidGame(game: any): game is Game {
    return (
      typeof game === 'object' &&
      typeof game.id === 'string' &&
      typeof game.title === 'string' &&
      typeof game.url === 'string' &&
      Array.isArray(game.tags) &&
      typeof game.submittedAt === 'string' &&
      typeof game.featured === 'boolean' &&
      typeof game.playCount === 'number' &&
      ['active', 'hidden'].includes(game.status)
    );
  }
}
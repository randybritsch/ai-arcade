import { Game } from '../types/game';
import { APP_CONFIG } from '../utils/constants';
import { URLValidator } from './urlValidator';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export class GameStorage {
  /**
   * Save a new game to Supabase
   * @param game Game object to save
   * @throws Error if validation fails or database error
   */
  static async save(game: Omit<Game, 'id' | 'submittedAt' | 'playCount'>): Promise<void> {
    // Validate URL before saving
    const validation = URLValidator.validate(game.url);
    if (!validation.isValid) {
      throw new Error(`Invalid URL: ${validation.error}`);
    }

    // Create complete game object
    const newGame = {
      id: uuidv4(),
      title: game.title.trim(),
      url: validation.normalizedUrl!,
      description: game.description?.trim() || null,
      author: game.author?.trim() || null,
      tags: game.tags.map(tag => tag.trim()).filter(Boolean),
      submitted_at: new Date().toISOString(),
      featured: false,
      play_count: 0,
      status: 'active' as const
    };

    const { error } = await supabase
      .from('games')
      .insert([newGame]);

    if (error) {
      throw new Error(`Failed to save game: ${error.message}`);
    }
  }

  /**
   * Retrieve all games from Supabase
   * @returns Promise resolving to array of games
   */
  static async getAll(): Promise<Game[]> {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading games from database:', error);
        return [];
      }

      // Transform snake_case to camelCase
      return (data || []).map(this.transformFromDb);
    } catch (error) {
      console.error('Error loading games from database:', error);
      return [];
    }
  }

  /**
   * Get a specific game by ID
   * @param id Game ID to retrieve
   * @returns Promise resolving to game or null if not found
   */
  static async getById(id: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.transformFromDb(data);
  }

  /**
   * Update an existing game
   * @param id Game ID to update
   * @param updates Partial game object with updates
   */
  static async update(id: string, updates: Partial<Game>): Promise<void> {
    // Validate URL if it's being updated
    if (updates.url) {
      const validation = URLValidator.validate(updates.url);
      if (!validation.isValid) {
        throw new Error(`Invalid URL: ${validation.error}`);
      }
      updates.url = validation.normalizedUrl;
    }

    // Transform camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.url !== undefined) dbUpdates.url = updates.url;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.author !== undefined) dbUpdates.author = updates.author;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.playCount !== undefined) dbUpdates.play_count = updates.playCount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('games')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) {
      throw new Error(`Failed to update game: ${error.message}`);
    }
  }

  /**
   * Delete a game by ID
   * @param id Game ID to delete
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete game: ${error.message}`);
    }
  }

  /**
   * Clear all games from storage (use with caution!)
   */
  static async clear(): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      throw new Error(`Failed to clear games: ${error.message}`);
    }
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

      // Transform to database format
      const dbGames = importData.games.map((game: Game) => ({
        id: game.id,
        title: game.title,
        url: game.url,
        description: game.description || null,
        author: game.author || null,
        tags: game.tags,
        submitted_at: game.submittedAt,
        featured: game.featured,
        play_count: game.playCount,
        status: game.status
      }));

      const { error } = await supabase
        .from('games')
        .insert(dbGames);

      if (error) {
        throw new Error(`Import failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Increment play count for a game
   * @param id Game ID to increment play count
   */
  static async incrementPlayCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_play_count', { game_id: id });

    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const game = await this.getById(id);
      if (game) {
        await this.update(id, { playCount: game.playCount + 1 });
      }
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
    let query = supabase.from('games').select('*');

    // Status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Featured filter
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    // Tags filter (PostgreSQL array contains)
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error filtering games:', error);
      return [];
    }

    let games = (data || []).map(this.transformFromDb);

    // Search term filter (client-side for flexibility)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      games = games.filter(game => {
        const matchesTitle = game.title.toLowerCase().includes(searchLower);
        const matchesDescription = game.description?.toLowerCase().includes(searchLower) || false;
        const matchesAuthor = game.author?.toLowerCase().includes(searchLower) || false;
        return matchesTitle || matchesDescription || matchesAuthor;
      });
    }

    return games;
  }

  /**
   * Transform database row to Game object (snake_case to camelCase)
   */
  private static transformFromDb(row: any): Game {
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description || undefined,
      author: row.author || undefined,
      tags: row.tags || [],
      submittedAt: row.submitted_at,
      featured: row.featured,
      playCount: row.play_count,
      status: row.status
    };
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
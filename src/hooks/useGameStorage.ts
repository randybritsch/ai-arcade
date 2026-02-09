import { useState, useEffect, useCallback } from 'react';
import { Game, GameFilters } from '../types/game';
import { GameStorage } from '../services/gameStorage';

/**
 * Custom hook for managing game storage operations
 * Provides CRUD operations and reactive state management
 */
export function useGameStorage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedGames = await GameStorage.getAll();
      setGames(loadedGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  const addGame = useCallback(async (gameData: Omit<Game, 'id' | 'submittedAt' | 'playCount'>) => {
    try {
      await GameStorage.save(gameData);
      await loadGames(); // Refresh games list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game');
      return false;
    }
  }, [loadGames]);

  const updateGame = useCallback(async (id: string, updates: Partial<Game>) => {
    try {
      await GameStorage.update(id, updates);
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === id ? { ...game, ...updates } : game
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game');
      return false;
    }
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    try {
      await GameStorage.delete(id);
      setGames(prevGames => prevGames.filter(game => game.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game');
      return false;
    }
  }, []);

  const clearAllGames = useCallback(async () => {
    try {
      await GameStorage.clear();
      setGames([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear games');
      return false;
    }
  }, []);

  const incrementPlayCount = useCallback(async (id: string) => {
    try {
      await GameStorage.incrementPlayCount(id);
      setGames(prevGames =>
        prevGames.map(game =>
          game.id === id ? { ...game, playCount: game.playCount + 1 } : game
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update play count');
    }
  }, []);

  const getFilteredGames = useCallback(async (filters: GameFilters) => {
    try {
      const filtered = await GameStorage.getFiltered(filters);
      return filtered;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter games');
      return [];
    }
  }, []);

  const refreshGames = useCallback(() => {
    loadGames();
  }, [loadGames]);

  return {
    // State
    games,
    loading,
    error,
    
    // Actions
    addGame,
    updateGame,
    deleteGame,
    clearAllGames,
    incrementPlayCount,
    getFilteredGames,
    refreshGames,
    
    // Computed values
    totalGames: games.length,
    activeGames: games.filter(game => game.status === 'active').length,
    featuredGames: games.filter(game => game.featured).length,
  };
}
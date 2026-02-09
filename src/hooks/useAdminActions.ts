import { useState, useCallback, useEffect } from 'react';
import { AdminConfig, AdminStats, BulkOperations } from '../types/admin';
import { Game } from '../types/game';
import { GameStorage } from '../services/gameStorage';
import { DataExport } from '../services/dataExport';
import { ADMIN_CONFIG } from '../utils/constants';

/**
 * Custom hook for admin operations and state management
 * Provides administrative functions for game moderation and bulk operations
 */
export function useAdminActions() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load admin stats when entering admin mode
  useEffect(() => {
    if (isAdminMode) {
      loadAdminStats();
    }
  }, [isAdminMode]);

  const loadAdminStats = useCallback(async () => {
    try {
      const games = await GameStorage.getAll();
      const stats: AdminStats = {
        totalGames: games.length,
        activeGames: games.filter(g => g.status === 'active').length,
        hiddenGames: games.filter(g => g.status === 'hidden').length,
        featuredGames: games.filter(g => g.featured).length,
        totalPlays: games.reduce((sum, g) => sum + g.playCount, 0),
      };
      setAdminStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    }
  }, []);

  const authenticateAdmin = useCallback((password: string): boolean => {
    // Simple password check for demo - in production would use proper auth
    if (password === ADMIN_CONFIG.ADMIN_PASSWORD) {
      setIsAdminMode(true);
      return true;
    }
    return false;
  }, []);

  const exitAdminMode = useCallback(() => {
    setIsAdminMode(false);
    setAdminStats(null);
    setError(null);
  }, []);

  const featureGame = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      await GameStorage.update(gameId, { featured: true });
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to feature game');
      return false;
    }
  }, [loadAdminStats]);

  const unfeatureGame = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      await GameStorage.update(gameId, { featured: false });
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfeature game');
      return false;
    }
  }, [loadAdminStats]);

  const hideGame = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      await GameStorage.update(gameId, { status: 'hidden' });
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hide game');
      return false;
    }
  }, [loadAdminStats]);

  const showGame = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      await GameStorage.update(gameId, { status: 'active' });
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to show game');
      return false;
    }
  }, [loadAdminStats]);

  const deleteGame = useCallback(async (gameId: string): Promise<boolean> => {
    try {
      await GameStorage.delete(gameId);
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game');
      return false;
    }
  }, [loadAdminStats]);

  const clearAllGames = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      await GameStorage.clear();
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear all games');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAdminStats]);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      await GameStorage.clear();
      // Could add default sample games here if needed
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset to defaults');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAdminStats]);

  const exportData = useCallback(async (format: 'json' | 'csv' = 'json'): Promise<void> => {
    try {
      setLoading(true);
      if (format === 'csv') {
        await DataExport.exportAsCsv();
      } else {
        await DataExport.exportAsJson();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (file: File): Promise<boolean> => {
    try {
      setLoading(true);
      await DataExport.importFromFile(file);
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAdminStats]);

  const performBulkOperation = useCallback(async (operation: BulkOperations): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (operation.selectedGameIds.length > ADMIN_CONFIG.BULK_OPERATION_LIMIT) {
        throw new Error(`Bulk operation limited to ${ADMIN_CONFIG.BULK_OPERATION_LIMIT} items`);
      }

      const promises = operation.selectedGameIds.map(gameId => {
        switch (operation.action) {
          case 'feature':
            return GameStorage.update(gameId, { featured: true });
          case 'unfeature':
            return GameStorage.update(gameId, { featured: false });
          case 'hide':
            return GameStorage.update(gameId, { status: 'hidden' });
          case 'show':
            return GameStorage.update(gameId, { status: 'active' });
          case 'delete':
            return GameStorage.delete(gameId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      await loadAdminStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAdminStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isAdminMode,
    adminStats,
    loading,
    error,
    
    // Authentication
    authenticateAdmin,
    exitAdminMode,
    
    // Game operations
    featureGame,
    unfeatureGame,
    hideGame,
    showGame,
    deleteGame,
    
    // Bulk operations
    clearAllGames,
    resetToDefaults,
    performBulkOperation,
    
    // Data operations
    exportData,
    importData,
    
    // Utility
    loadAdminStats,
    clearError,
  };
}
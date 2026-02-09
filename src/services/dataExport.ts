import { Game } from '../types/game';
import { GameStorage } from './gameStorage';

export class DataExport {
  /**
   * Export games data as JSON file download
   */
  static async exportAsJson(): Promise<void> {
    try {
      const jsonData = await GameStorage.export();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-arcade-games-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export games data as CSV file download
   */
  static async exportAsCsv(): Promise<void> {
    try {
      const games = await GameStorage.getAll();
      const csvContent = this.convertToCSV(games);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-arcade-games-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import games from a file input
   * @param file File object containing game data
   */
  static async importFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          await GameStorage.import(content);
          resolve();
        } catch (error) {
          reject(new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Convert games array to CSV format
   * @param games Array of games to convert
   * @returns CSV content as string
   */
  private static convertToCSV(games: Game[]): string {
    const headers = ['ID', 'Title', 'URL', 'Description', 'Author', 'Tags', 'Submitted At', 'Featured', 'Play Count', 'Status'];
    
    const csvRows = [
      headers.join(','),
      ...games.map(game => [
        `"${game.id}"`,
        `"${game.title.replace(/"/g, '""')}"`,
        `"${game.url}"`,
        `"${(game.description || '').replace(/"/g, '""')}"`,
        `"${(game.author || '').replace(/"/g, '""')}"`,
        `"${game.tags.join('; ')}"`,
        `"${game.submittedAt}"`,
        game.featured ? 'Yes' : 'No',
        game.playCount.toString(),
        game.status
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  /**
   * Get storage usage information
   * @returns Storage stats object
   */
  static async getStorageStats(): Promise<{
    totalGames: number;
    storageSize: number;
    quotaUsed: number;
  }> {
    const games = await GameStorage.getAll();
    const storageData = localStorage.getItem('ai-arcade:games') || '';
    const sizeInBytes = new Blob([storageData]).size;
    
    // Estimate quota usage (localStorage is typically 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB
    const quotaUsed = Math.round((sizeInBytes / estimatedQuota) * 100);
    
    return {
      totalGames: games.length,
      storageSize: sizeInBytes,
      quotaUsed: Math.min(quotaUsed, 100)
    };
  }
}
import { GameStorage } from '../services/gameStorage';
import { Game } from '../types/game';

describe('GameStorage', () => {
  let gameStorage: GameStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    gameStorage = new GameStorage();
  });

  describe('getGames', () => {
    it('returns empty array when no games exist', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      expect(gameStorage.getGames()).toEqual([]);
    });

    it('returns parsed games from localStorage', () => {
      const mockGames: Game[] = [
        {
          id: '1',
          title: 'Test Game',
          description: 'A test game',
          url: 'https://example.com/game',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          submittersName: 'Test User',
          tags: ['test'],
          createdAt: new Date('2023-01-01'),
          isApproved: true,
        },
      ];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockGames));
      
      const result = gameStorage.getGames();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Game');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('handles corrupted localStorage data gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid json');
      expect(gameStorage.getGames()).toEqual([]);
    });
  });

  describe('addGame', () => {
    it('adds a new game with generated id and timestamp', () => {
      const gameData = {
        title: 'New Game',
        description: 'A new game',
        url: 'https://example.com/new-game',
        submittersName: 'New User',
        tags: ['new'],
      };

      const result = gameStorage.addGame(gameData);

      expect(result.id).toBeDefined();
      expect(result.title).toBe('New Game');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.isApproved).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ai-arcade-games',
        expect.any(String)
      );
    });

    it('preserves existing games when adding new one', () => {
      const existingGames = [
        {
          id: '1',
          title: 'Existing Game',
          description: 'An existing game',
          url: 'https://example.com/existing',
          submittersName: 'Existing User',
          tags: [],
          createdAt: new Date(),
          isApproved: true,
        },
      ];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(existingGames));

      const newGame = {
        title: 'New Game',
        description: 'A new game',
        url: 'https://example.com/new',
        submittersName: 'New User',
        tags: [],
      };

      gameStorage.addGame(newGame);

      const savedData = (localStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toHaveLength(2);
    });
  });

  describe('updateGame', () => {
    it('updates an existing game', () => {
      const existingGame: Game = {
        id: '1',
        title: 'Original Title',
        description: 'Original description',
        url: 'https://example.com/original',
        submittersName: 'Original User',
        tags: [],
        createdAt: new Date(),
        isApproved: false,
      };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingGame]));

      const updates = {
        title: 'Updated Title',
        isApproved: true,
      };

      const result = gameStorage.updateGame('1', updates);

      expect(result).toBeTruthy();
      expect(result!.title).toBe('Updated Title');
      expect(result!.isApproved).toBe(true);
      expect(result!.description).toBe('Original description'); // unchanged
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('returns null when game not found', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([]));

      const result = gameStorage.updateGame('nonexistent', { title: 'New Title' });

      expect(result).toBeNull();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame', () => {
    it('deletes an existing game', () => {
      const games = [
        {
          id: '1',
          title: 'Game 1',
          description: 'First game',
          url: 'https://example.com/1',
          submittersName: 'User 1',
          tags: [],
          createdAt: new Date(),
          isApproved: true,
        },
        {
          id: '2',
          title: 'Game 2',
          description: 'Second game',
          url: 'https://example.com/2',
          submittersName: 'User 2',
          tags: [],
          createdAt: new Date(),
          isApproved: true,
        },
      ];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(games));

      const result = gameStorage.deleteGame('1');

      expect(result).toBe(true);
      const savedData = (localStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].id).toBe('2');
    });

    it('returns false when game not found', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([]));

      const result = gameStorage.deleteGame('nonexistent');

      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getGameById', () => {
    it('returns game when found', () => {
      const game = {
        id: '1',
        title: 'Test Game',
        description: 'A test game',
        url: 'https://example.com/game',
        submittersName: 'Test User',
        tags: [],
        createdAt: new Date(),
        isApproved: true,
      };
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([game]));

      const result = gameStorage.getGameById('1');

      expect(result).toBeTruthy();
      expect(result!.title).toBe('Test Game');
    });

    it('returns null when not found', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([]));

      const result = gameStorage.getGameById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('clearAllGames', () => {
    it('removes all games from storage', () => {
      gameStorage.clearAllGames();
      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-arcade-games');
    });
  });

  describe('importGames', () => {
    it('imports and merges games', () => {
      const existingGames = [
        {
          id: '1',
          title: 'Existing Game',
          description: 'An existing game',
          url: 'https://example.com/existing',
          submittersName: 'Existing User',
          tags: [],
          createdAt: new Date(),
          isApproved: true,
        },
      ];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(existingGames));

      const newGames = [
        {
          id: '2',
          title: 'Imported Game',
          description: 'An imported game',
          url: 'https://example.com/imported',
          submittersName: 'Imported User',
          tags: [],
          createdAt: new Date(),
          isApproved: false,
        },
      ];

      const result = gameStorage.importGames(newGames);

      expect(result).toBe(1); // 1 new game imported
      const savedData = (localStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData).toHaveLength(2);
    });

    it('skips games with duplicate URLs', () => {
      const existingGames = [
        {
          id: '1',
          title: 'Existing Game',
          url: 'https://example.com/game',
          description: 'An existing game',
          submittersName: 'Existing User',
          tags: [],
          createdAt: new Date(),
          isApproved: true,
        },
      ];
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(existingGames));

      const duplicateGames = [
        {
          id: '2',
          title: 'Duplicate Game',
          url: 'https://example.com/game', // Same URL
          description: 'A duplicate game',
          submittersName: 'Duplicate User',
          tags: [],
          createdAt: new Date(),
          isApproved: false,
        },
      ];

      const result = gameStorage.importGames(duplicateGames);

      expect(result).toBe(0); // No new games imported
    });
  });
});
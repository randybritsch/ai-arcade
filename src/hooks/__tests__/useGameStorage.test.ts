import { renderHook, act } from '@testing-library/react';
import { useGameStorage } from '../useGameStorage';
import { GameStorage } from '../../services/gameStorage';

// Mock the GameStorage class
jest.mock('../../services/gameStorage');
const MockGameStorage = GameStorage as jest.MockedClass<typeof GameStorage>;

describe('useGameStorage', () => {
  let mockGameStorageInstance: jest.Mocked<GameStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStorageInstance = {
      getGames: jest.fn(),
      addGame: jest.fn(),
      updateGame: jest.fn(),
      deleteGame: jest.fn(),
      getGameById: jest.fn(),
      clearAllGames: jest.fn(),
      importGames: jest.fn(),
    } as any;
    
    MockGameStorage.mockImplementation(() => mockGameStorageInstance);
  });

  it('initializes with empty games array and loading state', () => {
    mockGameStorageInstance.getGames.mockReturnValue([]);
    
    const { result } = renderHook(() => useGameStorage());

    expect(result.current.games).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads games on initialization', () => {
    const mockGames = [
      {
        id: '1',
        title: 'Test Game',
        description: 'A test game',
        url: 'https://itch.io/game',
        submittersName: 'Test User',
        tags: [],
        createdAt: new Date(),
        isApproved: true,
      },
    ];
    mockGameStorageInstance.getGames.mockReturnValue(mockGames);

    const { result } = renderHook(() => useGameStorage());

    expect(result.current.games).toEqual(mockGames);
    expect(mockGameStorageInstance.getGames).toHaveBeenCalled();
  });

  it('adds a new game', async () => {
    const newGameData = {
      title: 'New Game',
      description: 'A new game',
      url: 'https://itch.io/new-game',
      submittersName: 'New User',
      tags: ['new'],
    };

    const createdGame = {
      id: 'new-id',
      ...newGameData,
      createdAt: new Date(),
      isApproved: false,
    };

    mockGameStorageInstance.getGames.mockReturnValue([]);
    mockGameStorageInstance.addGame.mockReturnValue(createdGame);

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      const addedGame = await result.current.addGame(newGameData);
      expect(addedGame).toEqual(createdGame);
    });

    expect(mockGameStorageInstance.addGame).toHaveBeenCalledWith(newGameData);
    expect(result.current.games).toContain(createdGame);
    expect(result.current.error).toBeNull();
  });

  it('handles add game errors', async () => {
    const newGameData = {
      title: 'New Game',
      description: 'A new game',
      url: 'https://itch.io/new-game',
      submittersName: 'New User',
      tags: [],
    };

    mockGameStorageInstance.getGames.mockReturnValue([]);
    mockGameStorageInstance.addGame.mockImplementation(() => {
      throw new Error('Storage failed');
    });

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      try {
        await result.current.addGame(newGameData);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to add game: Storage failed');
    expect(result.current.games).toEqual([]);
  });

  it('updates an existing game', async () => {
    const existingGame = {
      id: '1',
      title: 'Original Title',
      description: 'Original description',
      url: 'https://itch.io/game',
      submittersName: 'User',
      tags: [],
      createdAt: new Date(),
      isApproved: false,
    };

    const updatedGame = {
      ...existingGame,
      title: 'Updated Title',
      isApproved: true,
    };

    mockGameStorageInstance.getGames.mockReturnValue([existingGame]);
    mockGameStorageInstance.updateGame.mockReturnValue(updatedGame);

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      const updated = await result.current.updateGame('1', { title: 'Updated Title', isApproved: true });
      expect(updated).toEqual(updatedGame);
    });

    expect(mockGameStorageInstance.updateGame).toHaveBeenCalledWith('1', { title: 'Updated Title', isApproved: true });
    expect(result.current.games[0]).toEqual(updatedGame);
  });

  it('handles update game not found', async () => {
    mockGameStorageInstance.getGames.mockReturnValue([]);
    mockGameStorageInstance.updateGame.mockReturnValue(null);

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      const updated = await result.current.updateGame('nonexistent', { title: 'New Title' });
      expect(updated).toBeNull();
    });

    expect(result.current.error).toBe('Game not found');
  });

  it('deletes a game', async () => {
    const gameToDelete = {
      id: '1',
      title: 'Game to Delete',
      description: 'Will be deleted',
      url: 'https://itch.io/delete',
      submittersName: 'User',
      tags: [],
      createdAt: new Date(),
      isApproved: true,
    };

    mockGameStorageInstance.getGames.mockReturnValue([gameToDelete]);
    mockGameStorageInstance.deleteGame.mockReturnValue(true);

    const { result } = renderHook(() => useGameStorage());

    expect(result.current.games).toHaveLength(1);

    await act(async () => {
      const deleted = await result.current.deleteGame('1');
      expect(deleted).toBe(true);
    });

    expect(mockGameStorageInstance.deleteGame).toHaveBeenCalledWith('1');
    expect(result.current.games).toHaveLength(0);
  });

  it('handles delete game not found', async () => {
    mockGameStorageInstance.getGames.mockReturnValue([]);
    mockGameStorageInstance.deleteGame.mockReturnValue(false);

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      const deleted = await result.current.deleteGame('nonexistent');
      expect(deleted).toBe(false);
    });

    expect(result.current.error).toBe('Game not found');
  });

  it('gets a game by ID', () => {
    const game = {
      id: '1',
      title: 'Test Game',
      description: 'A test game',
      url: 'https://itch.io/game',
      submittersName: 'User',
      tags: [],
      createdAt: new Date(),
      isApproved: true,
    };

    mockGameStorageInstance.getGames.mockReturnValue([game]);
    mockGameStorageInstance.getGameById.mockReturnValue(game);

    const { result } = renderHook(() => useGameStorage());

    const foundGame = result.current.getGameById('1');
    expect(foundGame).toEqual(game);
    expect(mockGameStorageInstance.getGameById).toHaveBeenCalledWith('1');
  });

  it('clears all games', async () => {
    const existingGames = [
      {
        id: '1',
        title: 'Game 1',
        description: 'First game',
        url: 'https://itch.io/1',
        submittersName: 'User 1',
        tags: [],
        createdAt: new Date(),
        isApproved: true,
      },
    ];

    mockGameStorageInstance.getGames
      .mockReturnValueOnce(existingGames)
      .mockReturnValueOnce([]);

    const { result } = renderHook(() => useGameStorage());

    expect(result.current.games).toEqual(existingGames);

    await act(async () => {
      await result.current.clearAllGames();
    });

    expect(mockGameStorageInstance.clearAllGames).toHaveBeenCalled();
    expect(result.current.games).toEqual([]);
  });

  it('imports games', async () => {
    const existingGames = [
      {
        id: '1',
        title: 'Existing Game',
        description: 'An existing game',
        url: 'https://itch.io/existing',
        submittersName: 'Existing User',
        tags: [],
        createdAt: new Date(),
        isApproved: true,
      },
    ];

    const importedGames = [
      {
        id: '2',
        title: 'Imported Game',
        description: 'An imported game',
        url: 'https://itch.io/imported',
        submittersName: 'Imported User',
        tags: [],
        createdAt: new Date(),
        isApproved: false,
      },
    ];

    const allGames = [...existingGames, ...importedGames];

    mockGameStorageInstance.getGames
      .mockReturnValueOnce(existingGames)
      .mockReturnValueOnce(allGames);
    mockGameStorageInstance.importGames.mockReturnValue(1);

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      const importCount = await result.current.importGames(importedGames);
      expect(importCount).toBe(1);
    });

    expect(mockGameStorageInstance.importGames).toHaveBeenCalledWith(importedGames);
    expect(result.current.games).toEqual(allGames);
  });

  it('handles import errors', async () => {
    mockGameStorageInstance.getGames.mockReturnValue([]);
    mockGameStorageInstance.importGames.mockImplementation(() => {
      throw new Error('Import failed');
    });

    const { result } = renderHook(() => useGameStorage());

    await act(async () => {
      try {
        await result.current.importGames([]);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to import games: Import failed');
  });

  it('clears errors', () => {
    mockGameStorageInstance.getGames.mockReturnValue([]);

    const { result } = renderHook(() => useGameStorage());

    // Set an error first
    act(() => {
      // Manually set error state by triggering a failed operation
      result.current.addGame({
        title: '',
        description: '',
        url: 'invalid-url',
        submittersName: '',
        tags: [],
      });
    });

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
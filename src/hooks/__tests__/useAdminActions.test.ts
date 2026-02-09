import { renderHook, act } from '@testing-library/react';
import { useAdminActions } from '../useAdminActions';

// Mock the hooks that useAdminActions depends on
jest.mock('../useGameStorage');
import { useGameStorage } from '../useGameStorage';

const mockUseGameStorage = useGameStorage as jest.MockedFunction<typeof useGameStorage>;

describe('useAdminActions', () => {
  let mockGameStorageHook: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGameStorageHook = {
      games: [],
      updateGame: jest.fn(),
      deleteGame: jest.fn(),
      clearAllGames: jest.fn(),
      importGames: jest.fn(),
      isLoading: false,
      error: null,
    };
    
    mockUseGameStorage.mockReturnValue(mockGameStorageHook);

    // Mock localStorage for admin authentication
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with default state', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAdminActions());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.selectedGames).toEqual([]);
    expect(result.current.bulkAction).toBeNull();
    expect(result.current.actionInProgress).toBe(false);
  });

  it('initializes with authenticated state from localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('true');

    const { result } = renderHook(() => useAdminActions());

    expect(result.current.isAuthenticated).toBe(true);
  });

  describe('authentication', () => {
    it('authenticates with correct password', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.authenticate('admin123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('ai-arcade-admin-auth', 'true');
    });

    it('rejects incorrect password', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.authenticate('wrong-password');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('logs out user', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');

      const { result } = renderHook(() => useAdminActions());

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('ai-arcade-admin-auth');
    });
  });

  describe('game moderation', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');
    });

    it('approves a game', async () => {
      const mockGame = {
        id: '1',
        title: 'Test Game',
        isApproved: false,
      };
      
      mockGameStorageHook.updateGame.mockResolvedValue({ ...mockGame, isApproved: true });

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.approveGame('1');
      });

      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('1', { isApproved: true });
    });

    it('rejects a game', async () => {
      const mockGame = {
        id: '1',
        title: 'Test Game',
        isApproved: true,
      };
      
      mockGameStorageHook.updateGame.mockResolvedValue({ ...mockGame, isApproved: false });

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.rejectGame('1');
      });

      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('1', { isApproved: false });
    });

    it('deletes a game', async () => {
      mockGameStorageHook.deleteGame.mockResolvedValue(true);

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.deleteGame('1');
      });

      expect(mockGameStorageHook.deleteGame).toHaveBeenCalledWith('1');
    });

    it('handles moderation errors', async () => {
      mockGameStorageHook.updateGame.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        try {
          await result.current.approveGame('1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('bulk operations', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');
    });

    it('selects and deselects games', () => {
      const { result } = renderHook(() => useAdminActions());

      // Select games
      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
      });

      expect(result.current.selectedGames).toEqual(['1', '2']);

      // Deselect a game
      act(() => {
        result.current.selectGame('1');
      });

      expect(result.current.selectedGames).toEqual(['2']);
    });

    it('selects all games', () => {
      const mockGames = [
        { id: '1', title: 'Game 1' },
        { id: '2', title: 'Game 2' },
        { id: '3', title: 'Game 3' },
      ];
      
      mockGameStorageHook.games = mockGames;

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.selectAllGames();
      });

      expect(result.current.selectedGames).toEqual(['1', '2', '3']);
    });

    it('clears selected games', () => {
      const { result } = renderHook(() => useAdminActions());

      // Select some games first
      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
      });

      expect(result.current.selectedGames).toEqual(['1', '2']);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedGames).toEqual([]);
    });

    it('sets bulk action', () => {
      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.setBulkAction('approve');
      });

      expect(result.current.bulkAction).toBe('approve');

      act(() => {
        result.current.setBulkAction(null);
      });

      expect(result.current.bulkAction).toBeNull();
    });

    it('executes bulk approve', async () => {
      mockGameStorageHook.updateGame.mockResolvedValue({});

      const { result } = renderHook(() => useAdminActions());

      // Select games and set bulk action
      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
        result.current.setBulkAction('approve');
      });

      await act(async () => {
        await result.current.executeBulkAction();
      });

      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('1', { isApproved: true });
      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('2', { isApproved: true });
      expect(result.current.selectedGames).toEqual([]);
      expect(result.current.bulkAction).toBeNull();
    });

    it('executes bulk reject', async () => {
      mockGameStorageHook.updateGame.mockResolvedValue({});

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
        result.current.setBulkAction('reject');
      });

      await act(async () => {
        await result.current.executeBulkAction();
      });

      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('1', { isApproved: false });
      expect(mockGameStorageHook.updateGame).toHaveBeenCalledWith('2', { isApproved: false });
    });

    it('executes bulk delete', async () => {
      mockGameStorageHook.deleteGame.mockResolvedValue(true);

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
        result.current.setBulkAction('delete');
      });

      await act(async () => {
        await result.current.executeBulkAction();
      });

      expect(mockGameStorageHook.deleteGame).toHaveBeenCalledWith('1');
      expect(mockGameStorageHook.deleteGame).toHaveBeenCalledWith('2');
    });

    it('handles bulk action errors gracefully', async () => {
      mockGameStorageHook.updateGame
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.selectGame('1');
        result.current.selectGame('2');
        result.current.setBulkAction('approve');
      });

      await act(async () => {
        await result.current.executeBulkAction();
      });

      expect(console.error).toHaveBeenCalled();
      // Should still clear selection and action after partial failure
      expect(result.current.selectedGames).toEqual([]);
      expect(result.current.bulkAction).toBeNull();
    });

    it('does nothing when no bulk action is set', async () => {
      const { result } = renderHook(() => useAdminActions());

      act(() => {
        result.current.selectGame('1');
      });

      await act(async () => {
        await result.current.executeBulkAction();
      });

      expect(mockGameStorageHook.updateGame).not.toHaveBeenCalled();
      expect(mockGameStorageHook.deleteGame).not.toHaveBeenCalled();
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');
    });

    it('clears all games', async () => {
      mockGameStorageHook.clearAllGames.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        await result.current.clearAllGames();
      });

      expect(mockGameStorageHook.clearAllGames).toHaveBeenCalled();
    });

    it('imports games', async () => {
      const mockGames = [
        { id: '1', title: 'Imported Game 1' },
        { id: '2', title: 'Imported Game 2' },
      ];
      
      mockGameStorageHook.importGames.mockResolvedValue(2);

      const { result } = renderHook(() => useAdminActions());

      await act(async () => {
        const count = await result.current.importGames(mockGames);
        expect(count).toBe(2);
      });

      expect(mockGameStorageHook.importGames).toHaveBeenCalledWith(mockGames);
    });
  });

  describe('statistics', () => {
    it('calculates statistics correctly', () => {
      const mockGames = [
        { id: '1', isApproved: true, createdAt: new Date('2023-01-01') },
        { id: '2', isApproved: false, createdAt: new Date('2023-01-02') },
        { id: '3', isApproved: true, createdAt: new Date('2023-01-03') },
      ];
      
      mockGameStorageHook.games = mockGames;

      const { result } = renderHook(() => useAdminActions());

      const stats = result.current.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.approved).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.recentSubmissions).toBe(3); // All submitted in last 7 days (using mock dates)
    });

    it('handles empty games array', () => {
      mockGameStorageHook.games = [];

      const { result } = renderHook(() => useAdminActions());

      const stats = result.current.getStatistics();

      expect(stats.total).toBe(0);
      expect(stats.approved).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.recentSubmissions).toBe(0);
    });
  });
});
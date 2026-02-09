import { DataExport } from '../dataExport';
import { Game } from '../../types/game';

// Mock console.error to avoid test output pollution
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('DataExport', () => {
  const mockGames: Game[] = [
    {
      id: '1',
      title: 'Test Game 1',
      description: 'First test game',
      url: 'https://itch.io/game1',
      thumbnailUrl: 'https://itch.io/thumb1.jpg',
      submittersName: 'User One',
      tags: ['action', 'adventure'],
      createdAt: new Date('2023-01-01T10:00:00Z'),
      isApproved: true,
    },
    {
      id: '2',
      title: 'Test Game 2',
      description: 'Second test game',
      url: 'https://github.io/user/game2',
      submittersName: 'User Two',
      tags: ['puzzle'],
      createdAt: new Date('2023-01-02T11:00:00Z'),
      isApproved: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToJSON', () => {
    it('creates a JSON file with correct content', () => {
      DataExport.exportToJSON(mockGames);

      expect(URL.createObjectURL).toHaveBeenCalled();
      
      // Get the blob that was created
      const createObjectURLCall = (URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      expect(blob.type).toBe('application/json');
      
      // Verify the content by reading the blob
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const parsedContent = JSON.parse(content);
          
          expect(parsedContent).toHaveLength(2);
          expect(parsedContent[0].title).toBe('Test Game 1');
          expect(parsedContent[1].title).toBe('Test Game 2');
          
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('handles empty games array', () => {
      DataExport.exportToJSON([]);

      expect(URL.createObjectURL).toHaveBeenCalled();
      
      const createObjectURLCall = (URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const parsedContent = JSON.parse(content);
          
          expect(parsedContent).toEqual([]);
          
          resolve();
        };
        reader.readAsText(blob);
      });
    });
  });

  describe('exportToCSV', () => {
    it('creates a CSV file with correct headers and data', () => {
      DataExport.exportToCSV(mockGames);

      expect(URL.createObjectURL).toHaveBeenCalled();
      
      const createObjectURLCall = (URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      expect(blob.type).toBe('text/csv');
      
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const lines = content.split('\n');
          
          // Check header
          expect(lines[0]).toContain('Title,Description,URL,Thumbnail URL,Submitter,Tags,Created Date,Approved');
          
          // Check first data row
          expect(lines[1]).toContain('Test Game 1');
          expect(lines[1]).toContain('itch.io/game1');
          expect(lines[1]).toContain('User One');
          expect(lines[1]).toContain('true');
          
          // Check second data row
          expect(lines[2]).toContain('Test Game 2');
          expect(lines[2]).toContain('github.io/user/game2');
          expect(lines[2]).toContain('User Two');
          expect(lines[2]).toContain('false');
          
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('handles empty games array', () => {
      DataExport.exportToCSV([]);

      expect(URL.createObjectURL).toHaveBeenCalled();
      
      const createObjectURLCall = (URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          // Should only have header row
          expect(lines).toHaveLength(1);
          expect(lines[0]).toContain('Title,Description,URL');
          
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('escapes CSV special characters correctly', () => {
      const gamesWithSpecialChars: Game[] = [
        {
          id: '1',
          title: 'Game with "quotes" and, commas',
          description: 'Description with\nnewlines\nand "quotes"',
          url: 'https://itch.io/game',
          submittersName: 'User, with comma',
          tags: ['tag1', 'tag2'],
          createdAt: new Date('2023-01-01'),
          isApproved: true,
        },
      ];

      DataExport.exportToCSV(gamesWithSpecialChars);

      const createObjectURLCall = (URL.createObjectURL as jest.Mock).mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          
          // Check that quotes are escaped and fields are properly quoted
          expect(content).toContain('"Game with ""quotes"" and, commas"');
          expect(content).toContain('"Description with\nnewlines\nand ""quotes"""');
          expect(content).toContain('"User, with comma"');
          
          resolve();
        };
        reader.readAsText(blob);
      });
    });
  });

  describe('parseImportedData', () => {
    it('parses valid JSON data', () => {
      const jsonData = JSON.stringify(mockGames);
      const result = DataExport.parseImportedData(jsonData);
      
      expect(result.success).toBe(true);
      expect(result.games).toHaveLength(2);
      expect(result.games![0].title).toBe('Test Game 1');
      expect(result.games![0].createdAt).toBeInstanceOf(Date);
    });

    it('handles invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      const result = DataExport.parseImportedData(invalidJson);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON format');
      expect(result.games).toBeUndefined();
    });

    it('validates game data structure', () => {
      const invalidGameData = JSON.stringify([
        {
          id: '1',
          // Missing required fields
          title: 'Test',
        },
      ]);
      
      const result = DataExport.parseImportedData(invalidGameData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid game data structure');
    });

    it('handles non-array JSON data', () => {
      const nonArrayData = JSON.stringify({ notAnArray: true });
      const result = DataExport.parseImportedData(nonArrayData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Data must be an array of games');
    });

    it('converts string dates to Date objects', () => {
      const gamesWithStringDates = [
        {
          id: '1',
          title: 'Test Game',
          description: 'A test game',
          url: 'https://itch.io/game',
          submittersName: 'Test User',
          tags: [],
          createdAt: '2023-01-01T10:00:00Z',
          isApproved: true,
        },
      ];
      
      const jsonData = JSON.stringify(gamesWithStringDates);
      const result = DataExport.parseImportedData(jsonData);
      
      expect(result.success).toBe(true);
      expect(result.games![0].createdAt).toBeInstanceOf(Date);
      expect(result.games![0].createdAt.getFullYear()).toBe(2023);
    });
  });

  describe('generateFilename', () => {
    beforeAll(() => {
      // Mock Date to return a consistent timestamp for testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-06-15T14:30:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('generates JSON filename with timestamp', () => {
      const filename = DataExport.generateFilename('json');
      expect(filename).toBe('ai-arcade-games-2023-06-15_14-30-00.json');
    });

    it('generates CSV filename with timestamp', () => {
      const filename = DataExport.generateFilename('csv');
      expect(filename).toBe('ai-arcade-games-2023-06-15_14-30-00.csv');
    });

    it('handles custom prefix', () => {
      const filename = DataExport.generateFilename('json', 'backup');
      expect(filename).toBe('backup-2023-06-15_14-30-00.json');
    });
  });

  describe('error handling', () => {
    it('handles blob creation errors gracefully', () => {
      // Mock URL.createObjectURL to throw an error
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn().mockImplementation(() => {
        throw new Error('Failed to create blob URL');
      });

      // Should not throw, but should log error
      expect(() => DataExport.exportToJSON(mockGames)).not.toThrow();
      expect(console.error).toHaveBeenCalled();

      // Restore original function
      URL.createObjectURL = originalCreateObjectURL;
    });
  });
});
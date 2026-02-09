import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from '../GameCard';
import { Game } from '../../types/game';

// Mock window.open
Object.assign(global, { open: jest.fn() });

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

describe('GameCard', () => {
  const mockGame: Game = {
    id: '1',
    title: 'Test Game',
    description: 'A fun test game for testing purposes',
    url: 'https://itch.io/test-game',
    thumbnailUrl: 'https://itch.io/thumbnail.jpg',
    submittersName: 'Test User',
    tags: ['action', 'adventure'],
    createdAt: new Date('2023-01-01T10:00:00Z'),
    isApproved: true,
  };

  const defaultProps = {
    game: mockGame,
    onPlay: jest.fn(),
    onCopyUrl: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders game information correctly', () => {
    render(<GameCard {...defaultProps} />);
    
    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('A fun test game for testing purposes')).toBeInTheDocument();
    expect(screen.getByText('by Test User')).toBeInTheDocument();
    expect(screen.getByText('action')).toBeInTheDocument();
    expect(screen.getByText('adventure')).toBeInTheDocument();
  });

  it('displays thumbnail image when provided', () => {
    render(<GameCard {...defaultProps} />);
    
    const thumbnail = screen.getByAltText('Test Game thumbnail');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', 'https://itch.io/thumbnail.jpg');
  });

  it('shows placeholder when no thumbnail provided', () => {
    const gameWithoutThumbnail = { ...mockGame, thumbnailUrl: undefined };
    render(<GameCard {...defaultProps} game={gameWithoutThumbnail} />);
    
    expect(screen.getByText('🎮')).toBeInTheDocument();
    expect(screen.queryByAltText('Test Game thumbnail')).not.toBeInTheDocument();
  });

  it('calls onPlay when play button is clicked', () => {
    render(<GameCard {...defaultProps} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(defaultProps.onPlay).toHaveBeenCalledWith(mockGame);
  });

  it('calls onCopyUrl when copy URL button is clicked', () => {
    render(<GameCard {...defaultProps} />);
    
    const copyButton = screen.getByRole('button', { name: /copy url/i });
    fireEvent.click(copyButton);
    
    expect(defaultProps.onCopyUrl).toHaveBeenCalledWith(mockGame.url);
  });

  it('opens game URL in new tab when open link button is clicked', () => {
    render(<GameCard {...defaultProps} />);
    
    const openButton = screen.getByRole('button', { name: /open in new tab/i });
    fireEvent.click(openButton);
    
    expect(global.open).toHaveBeenCalledWith(mockGame.url, '_blank', 'noopener,noreferrer');
  });

  it('shows admin controls when showAdminControls is true', () => {
    render(<GameCard {...defaultProps} showAdminControls />);
    
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('does not show admin controls by default', () => {
    render(<GameCard {...defaultProps} />);
    
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', () => {
    const onApprove = jest.fn();
    render(<GameCard {...defaultProps} showAdminControls onApprove={onApprove} />);
    
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);
    
    expect(onApprove).toHaveBeenCalledWith(mockGame.id);
  });

  it('calls onReject when reject button is clicked', () => {
    const onReject = jest.fn();
    render(<GameCard {...defaultProps} showAdminControls onReject={onReject} />);
    
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);
    
    expect(onReject).toHaveBeenCalledWith(mockGame.id);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<GameCard {...defaultProps} showAdminControls onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(mockGame.id);
  });

  it('shows selection checkbox when selectable is true', () => {
    render(<GameCard {...defaultProps} selectable />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('calls onSelect when selection checkbox is toggled', () => {
    const onSelect = jest.fn();
    render(<GameCard {...defaultProps} selectable onSelect={onSelect} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onSelect).toHaveBeenCalledWith(mockGame.id);
  });

  it('shows selected state when isSelected is true', () => {
    render(<GameCard {...defaultProps} selectable isSelected />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows approval status badge for approved games', () => {
    render(<GameCard {...defaultProps} showAdminControls />);
    
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toHaveClass('game-card__status--approved');
  });

  it('shows pending status badge for unapproved games', () => {
    const unapprovedGame = { ...mockGame, isApproved: false };
    render(<GameCard {...defaultProps} game={unapprovedGame} showAdminControls />);
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toHaveClass('game-card__status--pending');
  });

  it('formats creation date correctly', () => {
    render(<GameCard {...defaultProps} />);
    
    // Should show formatted date (exact format may vary based on locale)
    expect(screen.getByText(/Jan|January/)).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDescription = 'This is a very long description that should be truncated when displayed in the game card to prevent the card from becoming too tall and maintain a consistent layout across the grid of games.';
    const gameWithLongDesc = { ...mockGame, description: longDescription };
    
    render(<GameCard {...defaultProps} game={gameWithLongDesc} />);
    
    // Should show truncated version with ellipsis
    const description = screen.getByText(/This is a very long description/);
    expect(description).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const minimalGame: Game = {
      id: '2',
      title: 'Minimal Game',
      description: 'Simple game',
      url: 'https://itch.io/minimal',
      submittersName: 'Minimal User',
      tags: [],
      createdAt: new Date(),
      isApproved: true,
    };
    
    expect(() => {
      render(<GameCard {...defaultProps} game={minimalGame} />);
    }).not.toThrow();
    
    expect(screen.getByText('Minimal Game')).toBeInTheDocument();
    expect(screen.getByText('Simple game')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<GameCard {...defaultProps} className="custom-class" />);
    
    const gameCard = container.firstChild;
    expect(gameCard).toHaveClass('game-card', 'custom-class');
  });

  it('handles image load errors gracefully', () => {
    render(<GameCard {...defaultProps} />);
    
    const thumbnail = screen.getByAltText('Test Game thumbnail');
    fireEvent.error(thumbnail);
    
    // Should show placeholder instead of broken image
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<GameCard {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Game');
    });

    it('has accessible button labels', () => {
      render(<GameCard {...defaultProps} />);
      
      expect(screen.getByLabelText(/play test game/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/copy url for test game/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/open test game in new tab/i)).toBeInTheDocument();
    });

    it('has proper alt text for thumbnail', () => {
      render(<GameCard {...defaultProps} />);
      
      const thumbnail = screen.getByAltText('Test Game thumbnail');
      expect(thumbnail).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<GameCard {...defaultProps} />);
      
      const playButton = screen.getByRole('button', { name: /play/i });
      playButton.focus();
      
      expect(document.activeElement).toBe(playButton);
    });

    it('has proper ARIA labels for admin controls', () => {
      render(<GameCard {...defaultProps} showAdminControls />);
      
      expect(screen.getByLabelText(/approve test game/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reject test game/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/delete test game/i)).toBeInTheDocument();
    });
  });
});
import React, { useState } from 'react';
import { Game, BulkOperations } from '../../types/game';
import { Button } from '../common/Button';
import { useAdminActions } from '../../hooks/useAdminActions';
import { formatRelativeTime, truncateText } from '../../utils/helpers';

interface GameModerationProps {
  games: Game[];
  onGamesUpdated?: () => void;
}

export function GameModeration({ games, onGamesUpdated }: GameModerationProps) {
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'feature' | 'unfeature' | 'hide' | 'show' | 'delete'>('feature');
  
  const { performBulkOperation, loading, error } = useAdminActions();

  const handleSelectAll = () => {
    if (selectedGameIds.length === games.length) {
      setSelectedGameIds([]);
    } else {
      setSelectedGameIds(games.map(game => game.id));
    }
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameIds(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleBulkAction = async () => {
    if (selectedGameIds.length === 0) return;

    const operation: BulkOperations = {
      selectedGameIds,
      action: bulkAction
    };

    const success = await performBulkOperation(operation);
    if (success) {
      setSelectedGameIds([]);
      if (onGamesUpdated) {
        onGamesUpdated();
      }
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      feature: 'Feature',
      unfeature: 'Unfeature',
      hide: 'Hide',
      show: 'Show',
      delete: 'Delete'
    };
    return labels[action as keyof typeof labels] || action;
  };

  if (games.length === 0) {
    return (
      <div className="moderation-empty">
        <p>No games to moderate.</p>
      </div>
    );
  }

  return (
    <div className="game-moderation">
      <div className="moderation-header">
        <h3>Game Moderation</h3>
        <p>Select games and perform bulk actions</p>
      </div>

      {error && (
        <div className="moderation-error">
          <p>{error}</p>
        </div>
      )}

      {/* Bulk actions toolbar */}
      <div className="bulk-actions-toolbar">
        <div className="selection-controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedGameIds.length === games.length ? 'Deselect All' : 'Select All'}
            {selectedGameIds.length > 0 && ` (${selectedGameIds.length})`}
          </Button>
        </div>

        {selectedGameIds.length > 0 && (
          <div className="bulk-action-controls">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="action-select"
            >
              <option value="feature">Feature Selected</option>
              <option value="unfeature">Unfeature Selected</option>
              <option value="hide">Hide Selected</option>
              <option value="show">Show Selected</option>
              <option value="delete">Delete Selected</option>
            </select>

            <Button
              variant={bulkAction === 'delete' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleBulkAction}
              loading={loading}
              disabled={loading}
            >
              {getActionLabel(bulkAction)} ({selectedGameIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Games list */}
      <div className="moderation-games-list">
        {games.map(game => (
          <div
            key={game.id}
            className={`moderation-game-item ${selectedGameIds.includes(game.id) ? 'selected' : ''}`}
          >
            <div className="game-checkbox">
              <input
                type="checkbox"
                checked={selectedGameIds.includes(game.id)}
                onChange={() => handleSelectGame(game.id)}
                aria-label={`Select ${game.title}`}
              />
            </div>

            <div className="game-info">
              <div className="game-primary">
                <h4 className="game-title">
                  {truncateText(game.title, 50)}
                  {game.featured && <span className="featured-indicator">★</span>}
                </h4>
                <span className={`game-status status-${game.status}`}>
                  {game.status}
                </span>
              </div>

              <div className="game-secondary">
                <span className="game-author">
                  {game.author ? `by ${game.author}` : 'Anonymous'}
                </span>
                <span className="game-date">
                  {formatRelativeTime(game.submittedAt)}
                </span>
                <span className="game-plays">
                  {game.playCount} {game.playCount === 1 ? 'play' : 'plays'}
                </span>
              </div>

              {game.description && (
                <p className="game-description">
                  {truncateText(game.description, 100)}
                </p>
              )}

              <div className="game-url">
                <a 
                  href={game.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="url-link"
                >
                  {truncateText(game.url, 60)}
                </a>
              </div>

              {game.tags.length > 0 && (
                <div className="game-tags-mini">
                  {game.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag-mini">
                      {tag}
                    </span>
                  ))}
                  {game.tags.length > 3 && (
                    <span className="tag-mini tag-more">
                      +{game.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="game-quick-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(game.url, '_blank')}
                title="Open game"
              >
                ↗
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="moderation-summary">
        <p>
          Total: {games.length} games | 
          Active: {games.filter(g => g.status === 'active').length} | 
          Hidden: {games.filter(g => g.status === 'hidden').length} | 
          Featured: {games.filter(g => g.featured).length}
        </p>
      </div>
    </div>
  );
}
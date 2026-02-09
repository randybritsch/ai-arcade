import React, { useState } from 'react';
import { Game } from '../../types/game';
import { Button } from '../common/Button';
import { formatRelativeTime, copyToClipboard, truncateText, generateTagColor } from '../../utils/helpers';
import { useGameStorage } from '../../hooks/useGameStorage';

interface GameCardProps {
  game: Game;
  onPlay?: (game: Game) => void;
  showAdminActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  onFeature?: (game: Game) => void;
  onHide?: (game: Game) => void;
}

export function GameCard({
  game,
  onPlay,
  showAdminActions = false,
  onEdit,
  onDelete,
  onFeature,
  onHide
}: GameCardProps) {
  const [copying, setCopying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { incrementPlayCount } = useGameStorage();

  const handlePlay = () => {
    // Open modal/window first (synchronous to avoid popup blocker)
    if (onPlay) {
      onPlay(game);
    } else {
      window.open(game.url, '_blank', 'noopener,noreferrer');
    }
    // Then increment play count asynchronously
    incrementPlayCount(game.id);
  };

  const handleCopyUrl = async () => {
    setCopying(true);
    const success = await copyToClipboard(game.url);
    
    setTimeout(() => {
      setCopying(false);
    }, 1500);

    if (!success) {
      // Fallback: show alert with URL
      alert(`Copy this URL: ${game.url}`);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const displayDescription = game.description 
    ? showFullDescription 
      ? game.description 
      : truncateText(game.description, 100)
    : 'No description provided';

  const needsToggle = game.description && game.description.length > 100;

  return (
    <article className={`game-card ${game.featured ? 'game-card-featured' : ''} ${game.status === 'hidden' ? 'game-card-hidden' : ''}`}>
      {game.featured && <div className="featured-badge">Featured</div>}
      {game.status === 'hidden' && <div className="hidden-badge">Hidden</div>}
      
      <div className="game-card-header">
        <h3 className="game-title" title={game.title}>
          {truncateText(game.title, 60)}
        </h3>
        {game.author && (
          <p className="game-author">by {truncateText(game.author, 30)}</p>
        )}
      </div>

      <div className="game-card-body">
        <p className="game-description">
          {displayDescription}
          {needsToggle && (
            <button 
              className="description-toggle"
              onClick={toggleDescription}
              aria-label={showFullDescription ? 'Show less' : 'Show more'}
            >
              {showFullDescription ? ' Show less' : ' Show more'}
            </button>
          )}
        </p>

        {game.tags.length > 0 && (
          <div className="game-tags">
            {game.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="game-tag"
                style={{ backgroundColor: generateTagColor(tag) }}
              >
                {tag}
              </span>
            ))}
            {game.tags.length > 3 && (
              <span className="game-tag-more">+{game.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="game-card-meta">
        <span className="game-date" title={new Date(game.submittedAt).toLocaleString()}>
          {formatRelativeTime(game.submittedAt)}
        </span>
        <span className="game-plays">
          {game.playCount} {game.playCount === 1 ? 'play' : 'plays'}
        </span>
      </div>

      <div className="game-card-actions">
        <Button variant="primary" onClick={handlePlay} className="play-button">
          Play Game
        </Button>
        
        <Button 
          variant="ghost"
          onClick={handleCopyUrl}
          loading={copying}
          className="copy-button"
          title="Copy game URL"
        >
          {copying ? 'Copied!' : 'Copy URL'}
        </Button>

        {showAdminActions && (
          <div className="admin-actions">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(game)}>
                Edit
              </Button>
            )}
            
            {onFeature && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onFeature(game)}
                className={game.featured ? 'featured-active' : ''}
              >
                {game.featured ? 'Unfeature' : 'Feature'}
              </Button>
            )}
            
            {onHide && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onHide(game)}
              >
                {game.status === 'hidden' ? 'Show' : 'Hide'}
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onDelete(game)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
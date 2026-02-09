import React, { useState } from 'react';
import { Game } from '../../types/game';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { URLValidator } from '../../services/urlValidator';
import { copyToClipboard, formatRelativeTime } from '../../utils/helpers';

interface GamePlayerProps {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onPlayCountIncrement?: (gameId: string) => void;
}

export function GamePlayer({ 
  game, 
  isOpen, 
  onClose, 
  onPlayCountIncrement 
}: GamePlayerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
    // Increment play count when iframe loads successfully
    if (onPlayCountIncrement) {
      onPlayCountIncrement(game.id);
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(game.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    if (!success) {
      alert(`Copy this URL: ${game.url}`);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(game.url, '_blank', 'noopener,noreferrer');
    if (onPlayCountIncrement) {
      onPlayCountIncrement(game.id);
    }
  };

  const domain = URLValidator.extractDomain(game.url);
  const isGameDomain = URLValidator.isGameUrl(game.url);

  const footer = (
    <div className="player-footer">
      <div className="player-actions">
        <Button variant="ghost" onClick={handleCopyUrl}>
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>
        <Button variant="secondary" onClick={handleOpenInNewTab}>
          Open in New Tab
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Playing: ${game.title}`}
      size="lg"
      footer={footer}
      closeOnOverlayClick={false}
    >
      <div className="game-player">
        {/* Game info header */}
        <div className="player-header">
          <div className="game-meta">
            {game.author && (
              <p className="game-author">by {game.author}</p>
            )}
            <p className="game-domain">
              Hosted on {domain}
              {isGameDomain && <span className="verified-domain">✓</span>}
            </p>
            <p className="game-date">
              Submitted {formatRelativeTime(game.submittedAt)}
            </p>
          </div>
          
          {game.description && (
            <div className="game-description">
              <p>{game.description}</p>
            </div>
          )}
          
          {game.tags.length > 0 && (
            <div className="game-tags">
              {game.tags.map((tag, index) => (
                <span key={index} className="game-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Game iframe */}
        <div className="player-content">
          {!isGameDomain && (
            <div className="security-warning">
              ⚠️ This game is hosted on an unverified domain. Exercise caution.
            </div>
          )}
          
          <div className="iframe-container">
            {!iframeLoaded && !iframeError && (
              <div className="iframe-loading">
                <p>Loading game...</p>
              </div>
            )}
            
            {iframeError && (
              <div className="iframe-error">
                <h3>Unable to load game</h3>
                <p>
                  The game couldn't be loaded in an iframe. This might be due to:
                </p>
                <ul>
                  <li>The website prevents embedding</li>
                  <li>The URL is not accessible</li>
                  <li>Security restrictions</li>
                </ul>
                <Button variant="primary" onClick={handleOpenInNewTab}>
                  Open in New Tab Instead
                </Button>
              </div>
            )}
            
            <iframe
              src={game.url}
              title={`Game: ${game.title}`}
              className={`game-iframe ${iframeLoaded ? 'loaded' : ''}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation"
              loading="lazy"
              style={{ 
                display: iframeError ? 'none' : 'block',
                width: '100%',
                height: '600px',
                border: 'none',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
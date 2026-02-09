import React, { useState, useEffect } from 'react';
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
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setIframeLoaded(false);
      setIframeError(false);
      setLoadTimeout(false);
      
      // Set a timeout to detect if iframe fails to load
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          setLoadTimeout(true);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, iframeLoaded]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
    setLoadTimeout(false);
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
  const showError = iframeError || loadTimeout;

  const footer = (
    <div className="player-footer">
      <div className="player-actions">
        <Button 
          variant="primary" 
          onClick={handleOpenInNewTab}
          title="Open game in a new browser tab"
        >
          Open in New Tab
        </Button>
        <Button variant="ghost" onClick={handleCopyUrl}>
          {copied ? 'Copied!' : 'Copy URL'}
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
          
          {showError && (
            <div className="embed-blocked-warning" style={{
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginTop: 0 }}>⚠️ Cannot Display Game Here</h3>
              <p>
                This website ({domain}) prevents embedding in iframes for security reasons.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>Click "Open in New Tab" button below to play the game.</strong>
              </p>
              <Button variant="primary" onClick={handleOpenInNewTab} size="lg">
                Open in New Tab to Play
              </Button>
            </div>
          )}
          
          <div className="iframe-container">
            {!iframeLoaded && !showError && (
              <div className="iframe-loading">
                <p>Loading game...</p>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                  If the game doesn't load, click "Open in New Tab" below.
                </p>
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
                display: showError ? 'none' : 'block',
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
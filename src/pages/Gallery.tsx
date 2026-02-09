import React, { useState } from 'react';
import { GameGallery } from '../components/game/GameGallery';
import { GamePlayer } from '../components/game/GamePlayer';
import { Game } from '../types/game';
import { useGameStorage } from '../hooks/useGameStorage';

export function Gallery() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { incrementPlayCount } = useGameStorage();

  const handleGamePlay = (game: Game) => {
    setSelectedGame(game);
  };

  const handleClosePlayer = () => {
    setSelectedGame(null);
  };

  const handlePlayCountIncrement = async (gameId: string) => {
    await incrementPlayCount(gameId);
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Game Gallery</h1>
        <p>Explore amazing games created by our community</p>
      </div>

      <GameGallery onGamePlay={handleGamePlay} />

      {/* Game player modal */}
      {selectedGame && (
        <GamePlayer
          game={selectedGame}
          isOpen={true}
          onClose={handleClosePlayer}
          onPlayCountIncrement={handlePlayCountIncrement}
        />
      )}
    </div>
  );
}
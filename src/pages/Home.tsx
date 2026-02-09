import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useGameStorage } from '../hooks/useGameStorage';

export function Home() {
  const { games, loading, totalGames, activeGames, featuredGames } = useGameStorage();

  const featuredGamesList = games.filter(game => game.featured && game.status === 'active').slice(0, 3);
  const recentGamesList = games
    .filter(game => game.status === 'active')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 6);

  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to AI Arcade
          </h1>
          <p className="hero-subtitle">
            Discover and share amazing games created by learners like you. 
            From simple experiments to complex creations, explore the creativity of our community.
          </p>
          <div className="hero-actions">
            <Link to="/submit">
              <Button variant="primary" size="lg">
                Submit Your Game
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="secondary" size="lg">
                Browse Games
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="hero-stats">
          {loading ? (
            <div className="stats-loading">
              <p>Loading stats...</p>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{totalGames}</span>
                <span className="stat-label">Total Games</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{activeGames}</span>
                <span className="stat-label">Active Games</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{featuredGames}</span>
                <span className="stat-label">Featured</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured games section */}
      {featuredGamesList.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Featured Games</h2>
            <p>Handpicked games that showcase creativity and innovation</p>
          </div>
          <div className="featured-games-grid">
            {featuredGamesList.map(game => (
              <div key={game.id} className="featured-game-card">
                <h3 className="featured-game-title">{game.title}</h3>
                {game.author && (
                  <p className="featured-game-author">by {game.author}</p>
                )}
                {game.description && (
                  <p className="featured-game-description">
                    {game.description.length > 100 
                      ? `${game.description.substring(0, 100)}...`
                      : game.description
                    }
                  </p>
                )}
                <div className="featured-game-meta">
                  <span className="play-count">{game.playCount} plays</span>
                  {game.tags.length > 0 && (
                    <div className="featured-tags">
                      {game.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="featured-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  variant="primary"
                  onClick={() => {
                    window.open(game.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Play Now
                </Button>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/gallery?featured=true">
              <Button variant="ghost">View All Featured Games</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Recent games section */}
      {recentGamesList.length > 0 && (
        <section className="recent-section">
          <div className="section-header">
            <h2>Recently Added</h2>
            <p>Fresh games from our community</p>
          </div>
          <div className="recent-games-list">
            {recentGamesList.map(game => (
              <div key={game.id} className="recent-game-item">
                <div className="recent-game-info">
                  <h4 className="recent-game-title">{game.title}</h4>
                  {game.author && (
                    <span className="recent-game-author">by {game.author}</span>
                  )}
                  <span className="recent-game-date">
                    {new Date(game.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="recent-game-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.open(game.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    Play
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/gallery">
              <Button variant="ghost">View All Games</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && totalGames === 0 && (
        <section className="empty-state">
          <div className="empty-state-content">
            <h2>Be the First!</h2>
            <p>
              No games have been submitted yet. Be the first to share your creation 
              and help build our gaming community.
            </p>
            <Link to="/submit">
              <Button variant="primary" size="lg">
                Submit the First Game
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Call to action */}
      {totalGames > 0 && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Share Your Creation?</h2>
            <p>
              Join our community of game creators. Whether it's a simple experiment 
              or a complex masterpiece, we'd love to see what you've built!
            </p>
            <Link to="/submit">
              <Button variant="primary" size="lg">
                Submit Your Game
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
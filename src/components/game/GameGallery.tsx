import React, { useState, useEffect, useMemo } from 'react';
import { Game, GameFilters } from '../../types/game';
import { GameCard } from './GameCard';
import { LoadingSpinner, CardSkeleton } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { useGameStorage } from '../../hooks/useGameStorage';
import { debounce } from '../../utils/helpers';
import { APP_CONFIG } from '../../utils/constants';

interface GameGalleryProps {
  games?: Game[];
  loading?: boolean;
  showAdminActions?: boolean;
  onGameEdit?: (game: Game) => void;
  onGameDelete?: (game: Game) => void;
  onGameFeature?: (game: Game) => void;
  onGameHide?: (game: Game) => void;
  onGamePlay?: (game: Game) => void;
}

export function GameGallery({
  games: propGames,
  loading: propLoading,
  showAdminActions = false,
  onGameEdit,
  onGameDelete,
  onGameFeature,
  onGameHide,
  onGamePlay
}: GameGalleryProps) {
  const { games: storageGames, loading: storageLoading, getFilteredGames } = useGameStorage();
  
  // Use prop games if provided, otherwise use storage games
  const games = propGames ?? storageGames;
  const loading = propLoading ?? storageLoading;

  const [filters, setFilters] = useState<GameFilters>({
    tags: [],
    featured: false,
    searchTerm: '',
    status: 'active'
  });
  
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'alphabetical'>('newest');

  // Debounced search function
  const debouncedFilter = useMemo(
    () => debounce(async (currentFilters: GameFilters) => {
      setFilterLoading(true);
      try {
        const filtered = await getFilteredGames(currentFilters);
        setFilteredGames(filtered);
      } finally {
        setFilterLoading(false);
      }
    }, APP_CONFIG.DEBOUNCE_SEARCH_MS),
    [getFilteredGames]
  );

  // Apply filters when they change
  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
    
    if (!propGames) {
      // Only use filtered search if we're managing games internally
      debouncedFilter(filters);
    } else {
      // Apply filters client-side for prop games
      const filtered = propGames.filter(game => {
        if (filters.status && filters.status !== 'all' && game.status !== filters.status) {
          return false;
        }
        if (filters.featured && !game.featured) {
          return false;
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesTitle = game.title.toLowerCase().includes(searchLower);
          const matchesDescription = game.description?.toLowerCase().includes(searchLower) || false;
          const matchesAuthor = game.author?.toLowerCase().includes(searchLower) || false;
          if (!matchesTitle && !matchesDescription && !matchesAuthor) {
            return false;
          }
        }
        if (filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some(filterTag =>
            game.tags.some(gameTag => 
              gameTag.toLowerCase().includes(filterTag.toLowerCase())
            )
          );
          if (!hasMatchingTag) {
            return false;
          }
        }
        return true;
      });
      setFilteredGames(filtered);
    }
  }, [filters, propGames, debouncedFilter]);

  // Get all unique tags from games
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach(game => {
      game.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [games]);

  // Sort filtered games
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      case 'popular':
        return sorted.sort((a, b) => b.playCount - a.playCount);
      case 'alphabetical':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [filteredGames, sortBy]);

  // Pagination
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * APP_CONFIG.PAGINATION_SIZE;
    return sortedGames.slice(startIndex, startIndex + APP_CONFIG.PAGINATION_SIZE);
  }, [sortedGames, currentPage]);

  const totalPages = Math.ceil(sortedGames.length / APP_CONFIG.PAGINATION_SIZE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFeaturedToggle = () => {
    setFilters(prev => ({ ...prev, featured: !prev.featured }));
  };

  const handleStatusChange = (status: 'active' | 'hidden' | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      featured: false,
      searchTerm: '',
      status: 'active'
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.tags.length > 0 || filters.featured || filters.status !== 'active';

  if (loading) {
    return (
      <div className="game-gallery">
        <div className="gallery-loading">
          <LoadingSpinner size="lg" text="Loading games..." />
        </div>
      </div>
    );
  }

  return (
    <div className="game-gallery">
      {/* Filters */}
      <div className="gallery-filters">
        <div className="filter-row">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search games..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="sort-select-container">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-toggles">
            <Button
              variant={filters.featured ? 'primary' : 'ghost'}
              size="sm"
              onClick={handleFeaturedToggle}
            >
              Featured Only
            </Button>
            
            {showAdminActions && (
              <div className="status-filters">
                <Button
                  variant={filters.status === 'active' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filters.status === 'hidden' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleStatusChange('hidden')}
                >
                  Hidden
                </Button>
                <Button
                  variant={filters.status === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleStatusChange('all')}
                >
                  All
                </Button>
              </div>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="tag-filters">
            <span className="filter-label">Tags:</span>
            <div className="tag-filter-list">
              {allTags.slice(0, 20).map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${filters.tags.includes(tag) ? 'tag-filter-active' : ''}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results info */}
      <div className="gallery-info">
        <p className="results-count">
          {filterLoading ? (
            'Filtering...'
          ) : (
            `${sortedGames.length} ${sortedGames.length === 1 ? 'game' : 'games'} found`
          )}
        </p>
      </div>

      {/* Game grid */}
      {filterLoading ? (
        <div className="game-grid">
          <CardSkeleton count={6} />
        </div>
      ) : sortedGames.length === 0 ? (
        <div className="empty-state">
          <h3>No games found</h3>
          <p>
            {hasActiveFilters 
              ? 'Try adjusting your filters or search terms.'
              : 'No games have been submitted yet. Be the first to add one!'
            }
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <>
          <div className="game-grid">
            {paginatedGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={onGamePlay}
                showAdminActions={showAdminActions}
                onEdit={onGameEdit}
                onDelete={onGameDelete}
                onFeature={onGameFeature}
                onHide={onGameHide}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="gallery-pagination">
              <Button
                variant="ghost"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="ghost"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  };

  return (
    <div className={`loading-container ${className}`.trim()}>
      <div className={`spinner ${sizeClasses[size]}`} role="status" aria-label="Loading">
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...', 
  children 
}: LoadingOverlayProps) {
  return (
    <div className="loading-overlay-container">
      {children}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '' 
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`skeleton ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="game-card skeleton-card">
          <Skeleton height="200px" className="skeleton-image" />
          <div className="skeleton-content">
            <Skeleton height="1.5rem" className="skeleton-title" />
            <Skeleton height="1rem" width="60%" className="skeleton-author" />
            <Skeleton height="3rem" className="skeleton-description" />
            <div className="skeleton-tags">
              <Skeleton height="1.5rem" width="4rem" />
              <Skeleton height="1.5rem" width="3rem" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
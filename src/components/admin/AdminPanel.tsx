import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Modal, ConfirmModal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAdminActions } from '../../hooks/useAdminActions';
import { useGameStorage } from '../../hooks/useGameStorage';
import { GameGallery } from '../game/GameGallery';
import { formatDate } from '../../utils/helpers';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    message: string;
    action: () => void;
  } | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);

  const {
    isAdminMode,
    adminStats,
    loading,
    error,
    authenticateAdmin,
    exitAdminMode,
    clearAllGames,
    resetToDefaults,
    exportData,
    importData,
    clearError
  } = useAdminActions();

  const { games, refreshGames, updateGame, deleteGame } = useGameStorage();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authenticateAdmin(passwordInput);
    if (success) {
      setPasswordInput('');
      setShowPasswordInput(false);
    } else {
      alert('Invalid password');
    }
  };

  const handleClearAll = () => {
    setConfirmAction({
      type: 'clear',
      message: 'Are you sure you want to delete ALL games? This action cannot be undone.',
      action: async () => {
        const success = await clearAllGames();
        if (success) {
          refreshGames();
        }
      }
    });
  };

  const handleReset = () => {
    setConfirmAction({
      type: 'reset',
      message: 'Reset to factory defaults? This will clear all data.',
      action: async () => {
        const success = await resetToDefaults();
        if (success) {
          refreshGames();
        }
      }
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportData(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileInput(file || null);
  };

  const handleImport = async () => {
    if (!fileInput) return;

    const success = await importData(fileInput);
    if (success) {
      setFileInput(null);
      refreshGames();
      // Reset file input
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const handleGameFeature = async (game: any) => {
    await updateGame(game.id, { featured: !game.featured });
  };

  const handleGameHide = async (game: any) => {
    await updateGame(game.id, { status: game.status === 'hidden' ? 'active' : 'hidden' });
  };

  const handleGameDelete = async (game: any) => {
    setConfirmAction({
      type: 'delete',
      message: `Delete "${game.title}"? This action cannot be undone.`,
      action: async () => {
        await deleteGame(game.id);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Panel"
      size="lg"
      closeOnOverlayClick={false}
    >
      {!isAdminMode ? (
        // Password input
        <div className="admin-login">
          <p>Enter admin password to access the admin panel:</p>
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Admin password"
              className="form-input"
              autoFocus
            />
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Login
              </Button>
            </div>
          </form>
        </div>
      ) : (
        // Admin interface
        <div className="admin-interface">
          {error && (
            <div className="admin-error">
              <p>{error}</p>
              <Button size="sm" variant="ghost" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Admin stats */}
          {adminStats && (
            <div className="admin-stats">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{adminStats.totalGames}</span>
                  <span className="stat-label">Total Games</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{adminStats.activeGames}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{adminStats.hiddenGames}</span>
                  <span className="stat-label">Hidden</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{adminStats.featuredGames}</span>
                  <span className="stat-label">Featured</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{adminStats.totalPlays}</span>
                  <span className="stat-label">Total Plays</span>
                </div>
              </div>
            </div>
          )}

          {/* Admin actions */}
          <div className="admin-actions">
            <h3>Actions</h3>
            
            <div className="action-group">
              <h4>Data Management</h4>
              <div className="action-buttons">
                <Button
                  variant="secondary"
                  onClick={() => handleExport('json')}
                  disabled={loading}
                >
                  Export JSON
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleExport('csv')}
                  disabled={loading}
                >
                  Export CSV
                </Button>
              </div>
              
              <div className="import-section">
                <div className="file-input-container">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleImport}
                    disabled={!fileInput || loading}
                  >
                    Import Data
                  </Button>
                </div>
              </div>
            </div>

            <div className="action-group">
              <h4>System Operations</h4>
              <div className="action-buttons">
                <Button
                  variant="danger"
                  onClick={handleClearAll}
                  disabled={loading}
                >
                  Clear All Games
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset System
                </Button>
              </div>
            </div>

            <div className="action-group">
              <h4>Session</h4>
              <Button variant="ghost" onClick={exitAdminMode}>
                Exit Admin Mode
              </Button>
            </div>
          </div>

          {loading && (
            <div className="admin-loading">
              <LoadingSpinner size="md" text="Processing..." />
            </div>
          )}

          {/* Game management */}
          <div className="admin-games">
            <h3>Game Management</h3>
            <GameGallery
              games={games}
              showAdminActions={true}
              onGameFeature={handleGameFeature}
              onGameHide={handleGameHide}
              onGameDelete={handleGameDelete}
            />
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            confirmAction.action();
            setConfirmAction(null);
          }}
          title="Confirm Action"
          message={confirmAction.message}
          confirmText="Confirm"
          confirmVariant="danger"
        />
      )}
    </Modal>
  );
}
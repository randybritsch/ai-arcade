import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSubmission } from '../components/game/GameSubmission';
import { Button } from '../components/common/Button';

export function Submit() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

  const handleSubmissionSuccess = () => {
    setShowSuccessMessage(true);
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const handleViewGallery = () => {
    navigate('/gallery');
  };

  const handleSubmitAnother = () => {
    setShowSuccessMessage(false);
    // The form is already reset by GameSubmission component
  };

  return (
    <div className="submit-page">
      <div className="submit-header">
        <h1>Submit Your Game</h1>
        <p>Share your creation with the AI Arcade community!</p>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <div className="success-message">
          <div className="success-content">
            <h2>🎉 Game Submitted Successfully!</h2>
            <p>
              Your game has been added to the AI Arcade. It may take a few moments 
              to appear in the gallery as it's processed.
            </p>
            <div className="success-actions">
              <Button variant="primary" onClick={handleViewGallery}>
                View in Gallery
              </Button>
              <Button variant="secondary" onClick={handleSubmitAnother}>
                Submit Another Game
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="submit-content">
        <div className="submit-guidelines">
          <h2>Submission Guidelines</h2>
          <ul>
            <li>
              <strong>Game URL:</strong> Provide a direct link to your playable game. 
              Popular hosting platforms include CodePen, JSFiddle, GitHub Pages, 
              Vercel, Netlify, and Replit.
            </li>
            <li>
              <strong>Title:</strong> Choose a clear, descriptive name for your game 
              (1-100 characters).
            </li>
            <li>
              <strong>Description:</strong> Briefly explain what your game is about, 
              how to play, or what makes it special (optional, up to 500 characters).
            </li>
            <li>
              <strong>Tags:</strong> Add relevant keywords to help others discover 
              your game (up to 10 tags, 20 characters each).
            </li>
            <li>
              <strong>Author Name:</strong> Your display name will be shown with 
              your game (optional, up to 50 characters).
            </li>
          </ul>
        </div>

        <div className="submit-form-container">
          <GameSubmission onSubmissionSuccess={handleSubmissionSuccess} />
        </div>

        <div className="submit-tips">
          <h3>💡 Tips for Success</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>Make it Playable</h4>
              <p>Ensure your game runs in a web browser and doesn't require downloads or installations.</p>
            </div>
            <div className="tip-item">
              <h4>Test Your Link</h4>
              <p>Double-check that your game URL works correctly and loads as expected.</p>
            </div>
            <div className="tip-item">
              <h4>Add Clear Instructions</h4>
              <p>Include controls and gameplay instructions either in your description or within the game.</p>
            </div>
            <div className="tip-item">
              <h4>Use Descriptive Tags</h4>
              <p>Add relevant tags like "puzzle", "platformer", "multiplayer", or "educational" to help categorization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
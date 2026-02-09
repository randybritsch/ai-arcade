import React, { useState, useEffect } from 'react';
import { GameSubmissionData } from '../../types/game';
import { Button } from '../common/Button';
import { useUrlValidation } from '../../hooks/useUrlValidation';
import { useGameStorage } from '../../hooks/useGameStorage';
import { validateGameData } from '../../utils/helpers';
import { sanitizeTitle, sanitizeDescription, sanitizeAuthor, sanitizeTags } from '../../utils/sanitization';
import { VALIDATION_LIMITS } from '../../utils/constants';

interface GameSubmissionProps {
  onSubmissionSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<GameSubmissionData>;
  isEdit?: boolean;
}

export function GameSubmission({
  onSubmissionSuccess,
  onCancel,
  initialData,
  isEdit = false
}: GameSubmissionProps) {
  const [formData, setFormData] = useState<GameSubmissionData>({
    title: '',
    url: '',
    description: '',
    author: '',
    tags: [],
    ...initialData
  });

  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { validateUrlSync, isValid: urlIsValid, error: urlError, isGameUrl, getDomain } = useUrlValidation();
  const { addGame, error: storageError } = useGameStorage();

  // Real-time URL validation
  useEffect(() => {
    if (formData.url.trim()) {
      validateUrlSync(formData.url);
    }
  }, [formData.url, validateUrlSync]);

  const handleInputChange = (field: keyof GameSubmissionData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleTagAdd = () => {
    if (!tagInput.trim() || formData.tags.length >= VALIDATION_LIMITS.MAX_TAGS) {
      return;
    }

    const newTag = tagInput.trim();
    if (!formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
    setTagInput('');
  };

  const handleTagRemove = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors([]);
    
    // Sanitize form data
    const sanitizedData = {
      title: sanitizeTitle(formData.title),
      url: formData.url.trim(),
      description: formData.description ? sanitizeDescription(formData.description) : undefined,
      author: formData.author ? sanitizeAuthor(formData.author) : undefined,
      tags: sanitizeTags(formData.tags)
    };

    // Validate form data
    const validation = validateGameData(sanitizedData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // URL validation
    if (!urlIsValid) {
      setValidationErrors([urlError || 'Please enter a valid URL']);
      return;
    }

    setSubmitting(true);

    try {
      // Add game to storage
      const success = await addGame({
        ...sanitizedData,
        featured: false,
        status: 'active'
      });

      if (success) {
        // Reset form
        setFormData({
          title: '',
          url: '',
          description: '',
          author: '',
          tags: []
        });
        setTagInput('');
        
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        setValidationErrors(['Failed to submit game. Please try again.']);
      }
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Submission failed']);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.url.trim() && urlIsValid;
  const domain = formData.url ? getDomain(formData.url) : '';
  const isVerifiedDomain = formData.url ? isGameUrl(formData.url) : false;

  return (
    <form onSubmit={handleSubmit} className="game-submission-form">
      <div className="form-header">
        <h2>{isEdit ? 'Edit Game' : 'Submit New Game'}</h2>
        <p>Share your awesome game with the community!</p>
      </div>

      {/* Error display */}
      {(validationErrors.length > 0 || storageError) && (
        <div className="form-errors">
          {validationErrors.map((error, index) => (
            <p key={index} className="error-message">{error}</p>
          ))}
          {storageError && <p className="error-message">{storageError}</p>}
        </div>
      )}

      {/* Title field */}
      <div className="form-field">
        <label htmlFor="title" className="form-label">
          Game Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={handleInputChange('title')}
          placeholder="Enter the name of your game"
          maxLength={VALIDATION_LIMITS.TITLE_MAX_LENGTH}
          className="form-input"
          required
        />
        <span className="character-count">
          {formData.title.length}/{VALIDATION_LIMITS.TITLE_MAX_LENGTH}
        </span>
      </div>

      {/* URL field */}
      <div className="form-field">
        <label htmlFor="url" className="form-label">
          Game URL *
        </label>
        <input
          id="url"
          type="url"
          value={formData.url}
          onChange={handleInputChange('url')}
          placeholder="https://example.com/my-game"
          className={`form-input ${urlIsValid === false ? 'form-input-error' : urlIsValid === true ? 'form-input-success' : ''}`}
          required
        />
        {formData.url && (
          <div className="url-validation">
            {urlError && <p className="validation-error">{urlError}</p>}
            {urlIsValid && domain && (
              <p className={`validation-success ${isVerifiedDomain ? 'verified-domain' : ''}`}>
                Will be hosted on {domain}
                {isVerifiedDomain && ' ✓ Verified game hosting domain'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Description field */}
      <div className="form-field">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange('description')}
          placeholder="Tell us about your game (optional)"
          maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
          className="form-textarea"
          rows={4}
        />
        <span className="character-count">
          {formData.description?.length || 0}/{VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
        </span>
      </div>

      {/* Author field */}
      <div className="form-field">
        <label htmlFor="author" className="form-label">
          Your Name
        </label>
        <input
          id="author"
          type="text"
          value={formData.author}
          onChange={handleInputChange('author')}
          placeholder="Your display name (optional)"
          maxLength={VALIDATION_LIMITS.AUTHOR_MAX_LENGTH}
          className="form-input"
        />
        <span className="character-count">
          {formData.author?.length || 0}/{VALIDATION_LIMITS.AUTHOR_MAX_LENGTH}
        </span>
      </div>

      {/* Tags field */}
      <div className="form-field">
        <label htmlFor="tags" className="form-label">
          Tags ({formData.tags.length}/{VALIDATION_LIMITS.MAX_TAGS})
        </label>
        <div className="tag-input-container">
          <input
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags (press Enter or comma to add)"
            maxLength={VALIDATION_LIMITS.TAG_MAX_LENGTH}
            className="form-input"
            disabled={formData.tags.length >= VALIDATION_LIMITS.MAX_TAGS}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleTagAdd}
            disabled={!tagInput.trim() || formData.tags.length >= VALIDATION_LIMITS.MAX_TAGS}
          >
            Add
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="tag-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="form-tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(index)}
                  className="tag-remove"
                  aria-label={`Remove tag: ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="form-actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={!isFormValid || submitting}
        >
          {submitting ? 'Submitting...' : isEdit ? 'Update Game' : 'Submit Game'}
        </Button>
      </div>
    </form>
  );
}
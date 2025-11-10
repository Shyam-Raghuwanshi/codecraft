/**
 * ReviewCard.tsx - Production-Ready ReviewCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, dark theme, hover effects, accessibility, error handling
 */

import React, { useState } from 'react';
import Badge from './Badge';
import { SaveIcon, ClockIcon, CheckIcon, FileCodeIcon, ErrorIcon } from '../lib/icons';
import type { CodeRabbitReview } from '../lib/mock-data';

export interface ReviewCardProps {
  review: CodeRabbitReview;
  onSave: (review: CodeRabbitReview) => void | Promise<void>;
  className?: string;
  isLoading?: boolean;
  variant?: 'default' | 'compact';
}

/**
 * Format file path for display
 */
const formatFilePath = (filePath: string): string => {
  try {
    if (!filePath) return 'Unknown file';
    
    // Show only the last 2 directories + filename for readability
    const parts = filePath.split('/');
    if (parts.length > 3) {
      return '.../' + parts.slice(-2).join('/');
    }
    return filePath;
  } catch (error) {
    console.error('Error formatting file path:', error);
    return filePath || 'Unknown file';
  }
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(date);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown time';
  }
};

/**
 * Get status icon and styling
 */
const getStatusDisplay = (status: CodeRabbitReview['status']) => {
  switch (status) {
    case 'open':
      return {
        icon: <ClockIcon size="xs" color="warning" />,
        label: 'Open',
        className: 'bg-amber-900/50 text-amber-100 border-amber-700'
      };
    case 'resolved':
      return {
        icon: <CheckIcon size="xs" color="success" />,
        label: 'Resolved',
        className: 'bg-green-900/50 text-green-100 border-green-700'
      };
    case 'dismissed':
      return {
        icon: null,
        label: 'Dismissed',
        className: 'bg-slate-700/50 text-slate-300 border-slate-600'
      };
    default:
      return {
        icon: <ClockIcon size="xs" color="secondary" />,
        label: 'Unknown',
        className: 'bg-slate-700/50 text-slate-300 border-slate-600'
      };
  }
};

/**
 * Code snippet component with syntax highlighting-like styling
 */
const CodeSnippet: React.FC<{ code: string; isCompact?: boolean }> = ({ code, isCompact = false }) => {
  if (!code) return null;

  return (
    <div className={`${isCompact ? 'mt-2' : 'mt-4'}`}>
      <div className="flex items-center gap-2 mb-2">
        <FileCodeIcon size="xs" color="secondary" />
        <h4 className="text-sm font-medium text-slate-300">Code:</h4>
      </div>
      <div className="code-block max-h-40 overflow-y-auto custom-scrollbar">
        <code className="text-sm">{code}</code>
      </div>
    </div>
  );
};

/**
 * Suggestion component with enhanced styling
 */
const SuggestionBlock: React.FC<{ suggestion: string; isCompact?: boolean }> = ({ suggestion, isCompact = false }) => {
  if (!suggestion) return null;

  return (
    <div className={`${isCompact ? 'mt-2' : 'mt-4'} relative`}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
      <div className="pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm">
        <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
          💡 Suggestion:
        </h4>
        <p className="text-slate-200 leading-relaxed text-sm">{suggestion}</p>
      </div>
    </div>
  );
};

/**
 * Error display component
 */
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg backdrop-blur-sm">
    <div className="flex items-center gap-2">
      <ErrorIcon size="sm" color="error" />
      <p className="text-sm text-red-300">{error}</p>
    </div>
  </div>
);

/**
 * Production ReviewCard Component
 * Displays CodeRabbit review information with dark theme and smooth animations
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onSave, 
  className = '',
  isLoading = false,
  variant = 'default'
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  try {
    // Validate required props
    if (!review) {
      console.warn('ReviewCard: review prop is required');
      return null;
    }

    if (!onSave || typeof onSave !== 'function') {
      console.warn('ReviewCard: onSave prop must be a function');
      return null;
    }

    const {
      fileName,
      issueType,
      severity,
      line,
      message,
      suggestion,
      codeSnippet,
      createdAt,
      status
    } = review;

    const statusDisplay = getStatusDisplay(status);
    const isCompact = variant === 'compact';
    const isResolved = status === 'resolved';
    const canSave = !isResolved && !isSaving && !isLoading;

    /**
     * Handle save button click
     */
    const handleSave = async () => {
      try {
        setIsSaving(true);
        setSaveError(null);

        await onSave(review);

        // Success feedback could be added here (e.g., toast notification)
        console.log('Review saved successfully:', review.reviewId);
      } catch (error) {
        console.error('Error saving review:', error);
        setSaveError(error instanceof Error ? error.message : 'Failed to save review');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <article
        className={`
          card card-hover group animate-fade-in backdrop-blur-sm
          ${isCompact ? 'p-4' : 'p-6'}
          ${className}
        `.trim()}
        role="article"
        aria-label="Code review details"
      >
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* File and Line */}
            <div className="flex items-center space-x-3">
              <FileCodeIcon size="sm" color="primary" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                  {formatFilePath(fileName)}
                </h3>
                <p className="text-sm text-slate-400">
                  Line {line} • {formatDate(createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col gap-2 ml-4">
            <Badge 
              type={severity} 
              showIcon={!isCompact}
              variant="solid"
              size={isCompact ? 'sm' : 'md'}
            />
            <Badge 
              type={issueType} 
              showIcon={!isCompact}
              variant="outline"
              size={isCompact ? 'sm' : 'md'}
            />
            <div className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 
              text-xs font-medium rounded-full border transition-all duration-200
              ${statusDisplay.className}
            `}>
              {statusDisplay.icon}
              <span>{statusDisplay.label}</span>
            </div>
          </div>
        </div>

        {/* Issue Message */}
        <div className={`${isCompact ? 'mb-3' : 'mb-4'}`}>
          <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            🔍 Issue:
          </h4>
          <p className="text-slate-100 leading-relaxed">{message}</p>
        </div>

        {/* Suggestion */}
        {suggestion && <SuggestionBlock suggestion={suggestion} isCompact={isCompact} />}

        {/* Code Snippet */}
        {codeSnippet && <CodeSnippet code={codeSnippet} isCompact={isCompact} />}

        {/* Save Error */}
        {saveError && <ErrorDisplay error={saveError} />}

        {/* Action Button */}
        <div className={`${isCompact ? 'mt-4' : 'mt-6'} flex justify-end`}>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`
              btn btn-primary btn-md
              ${!canSave ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25'}
              transition-all duration-300
            `.trim()}
            aria-label={`Save review for ${fileName}`}
          >
            {isSaving ? (
              <>
                <div className="loading-spinner mr-2" />
                Saving...
              </>
            ) : isResolved ? (
              <>
                <CheckIcon size="sm" color="white" />
                Resolved
              </>
            ) : (
              <>
                <SaveIcon size="sm" color="white" />
                Save Review
              </>
            )}
          </button>
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error rendering ReviewCard component:', error);
    
    // Fallback review card
    return (
      <div className="card p-6 border-red-500/50">
        <div className="flex items-center gap-3">
          <ErrorIcon size="md" color="error" />
          <div>
            <h3 className="text-sm font-medium text-red-300">Error loading review</h3>
            <p className="text-sm text-slate-400 mt-1">
              There was a problem displaying this review information.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default ReviewCard;
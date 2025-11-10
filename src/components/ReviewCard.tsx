/**
 * ReviewCard.tsx - Reusable ReviewCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, save functionality, proper error handling, accessibility
 */

import React, { useState } from 'react';
import Badge from './Badge';
import type { CodeRabbitReview } from '../lib/mock-data';

export interface ReviewCardProps {
  review: CodeRabbitReview;
  onSave: (review: CodeRabbitReview) => void | Promise<void>;
  className?: string;
  isLoading?: boolean;
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown time';
  }
};

/**
 * Get status badge color based on review status
 */
const getStatusColor = (status: CodeRabbitReview['status']): string => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'dismissed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Code snippet component with syntax highlighting-like styling
 */
const CodeSnippet: React.FC<{ code: string }> = ({ code }) => {
  if (!code) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Code:</h4>
      <pre className="bg-gray-900 text-gray-100 text-sm p-4 rounded-md overflow-x-auto border">
        <code>{code}</code>
      </pre>
    </div>
  );
};

/**
 * ReviewCard Component
 * Displays CodeRabbit review information with save functionality
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onSave, 
  className = '',
  isLoading = false 
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
      <div
        className={`
          bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200
          ${className}
        `.trim()}
        role="article"
        aria-label="Code review details"
      >
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* File and Line */}
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {formatFilePath(fileName)}
              </h3>
              <span className="text-sm text-gray-500">
                Line {line}
              </span>
            </div>
            
            {/* Date */}
            <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col space-y-2 ml-4">
            <Badge type={severity} />
            <Badge type={issueType} />
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        {/* Issue Message */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Issue:</h4>
          <p className="text-gray-900 leading-relaxed">{message}</p>
        </div>

        {/* Suggestion */}
        {suggestion && (
          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Suggestion:</h4>
            <p className="text-blue-700 leading-relaxed">{suggestion}</p>
          </div>
        )}

        {/* Code Snippet */}
        {codeSnippet && <CodeSnippet code={codeSnippet} />}

        {/* Save Error */}
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading || status === 'resolved'}
            className={`
              inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${
                isSaving || isLoading || status === 'resolved'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `.trim()}
            aria-label={`Save review for ${fileName}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : status === 'resolved' ? (
              'Resolved'
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Review
              </>
            )}
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ReviewCard component:', error);
    
    // Fallback review card
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Error loading review</h3>
            <p className="text-sm text-gray-500">There was a problem displaying this review information.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default ReviewCard;
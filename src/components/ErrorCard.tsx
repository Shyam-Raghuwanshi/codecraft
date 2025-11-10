/**
 * ErrorCard.tsx - Reusable ErrorCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, expandable UI, error handling, proper accessibility
 */

import React, { useState } from 'react';
import Badge from './Badge';
import type { SentryError } from '../lib/mock-data';

export interface ErrorCardProps {
  error: SentryError;
  className?: string;
}

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
 * Format stack trace for better readability
 */
const formatStackTrace = (stackTrace: string): string[] => {
  try {
    if (!stackTrace) return [];
    
    return stackTrace
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  } catch (error) {
    console.error('Error formatting stack trace:', error);
    return ['Stack trace unavailable'];
  }
};

/**
 * Get environment badge color
 */
const getEnvironmentColor = (environment: SentryError['environment']): string => {
  switch (environment) {
    case 'production':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'staging':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'development':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Expandable Stack Trace Component
 */
const StackTrace: React.FC<{ stackTrace: string; isExpanded: boolean }> = ({ 
  stackTrace, 
  isExpanded 
}) => {
  if (!isExpanded) return null;

  const stackLines = formatStackTrace(stackTrace);

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Stack Trace:</h4>
      <div className="bg-gray-900 text-gray-100 text-xs font-mono p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto">
        {stackLines.length > 0 ? (
          stackLines.map((line, index) => (
            <div key={index} className="mb-1 whitespace-nowrap">
              {line}
            </div>
          ))
        ) : (
          <div className="text-gray-400">No stack trace available</div>
        )}
      </div>
    </div>
  );
};

/**
 * ErrorCard Component
 * Displays Sentry error information with expandable stack trace
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({ error, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  try {
    // Validate required props
    if (!error) {
      console.warn('ErrorCard: error prop is required');
      return null;
    }

    const {
      errorMessage,
      errorType,
      severity,
      occurredAt,
      affectedUsers,
      totalOccurrences,
      environment,
      browser,
      os,
      url,
      stackTrace
    } = error;

    const hasStackTrace = stackTrace && stackTrace.trim().length > 0;

    return (
      <div
        className={`
          bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200
          ${className}
        `.trim()}
        role="article"
        aria-label="Error details"
      >
        {/* Error Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* Error Message */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
              {errorMessage || 'Unknown Error'}
            </h3>
            
            {/* Error Type */}
            {errorType && (
              <p className="text-sm text-gray-600 mb-2 font-mono">
                {errorType}
              </p>
            )}
          </div>
          
          {/* Severity Badge */}
          <Badge type={severity} className="ml-4 flex-shrink-0" />
        </div>

        {/* Error Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Affected Users */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Affected Users</p>
            <p className="text-lg font-semibold text-gray-900">{affectedUsers.toLocaleString()}</p>
          </div>
          
          {/* Total Occurrences */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Occurrences</p>
            <p className="text-lg font-semibold text-gray-900">{totalOccurrences.toLocaleString()}</p>
          </div>
          
          {/* Last Occurred */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Last Occurred</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(occurredAt)}</p>
          </div>
          
          {/* Environment */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Environment</p>
            <span 
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getEnvironmentColor(environment)}`}
            >
              {environment}
            </span>
          </div>
        </div>

        {/* Additional Context */}
        {(browser || os || url) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Context</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              {browser && (
                <div>
                  <span className="text-gray-500">Browser:</span>
                  <span className="ml-2 text-gray-900">{browser}</span>
                </div>
              )}
              {os && (
                <div>
                  <span className="text-gray-500">OS:</span>
                  <span className="ml-2 text-gray-900">{os}</span>
                </div>
              )}
              {url && (
                <div className="md:col-span-1">
                  <span className="text-gray-500">URL:</span>
                  <span className="ml-2 text-gray-900 break-all">{url}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {hasStackTrace && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              aria-expanded={isExpanded}
              aria-controls="stack-trace"
            >
              {isExpanded ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Stack Trace
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show Stack Trace
                </>
              )}
            </button>
          </div>
        )}

        {/* Expandable Stack Trace */}
        {hasStackTrace && (
          <div id="stack-trace">
            <StackTrace stackTrace={stackTrace} isExpanded={isExpanded} />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering ErrorCard component:', error);
    
    // Fallback error card
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Error loading error details</h3>
            <p className="text-sm text-gray-500">There was a problem displaying this error information.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default ErrorCard;
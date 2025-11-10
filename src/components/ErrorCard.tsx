/**
 * ErrorCard.tsx - Production-Ready ErrorCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, dark theme, icons, expandable UI, error handling, accessibility
 */

import React, { useState } from 'react';
import Badge from './Badge';
import { 
  ErrorIcon, 
  UserIcon, 
  ClockIcon, 
  MonitorIcon, 
  SmartphoneIcon, 
  GithubIcon,
  EyeIcon,
  EyeOffIcon,
  ServerIcon
} from '../lib/icons';
import type { SentryError } from '../lib/mock-data';

export interface ErrorCardProps {
  error: SentryError;
  className?: string;
  variant?: 'default' | 'compact';
  showActions?: boolean;
}

/**
 * Format date for display with relative time
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
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
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
 * Get environment badge styling for dark theme
 */
const getEnvironmentStyling = (environment: SentryError['environment']) => {
  switch (environment) {
    case 'production':
      return {
        className: 'bg-red-900/50 text-red-100 border-red-700',
        icon: <ServerIcon size="xs" color="error" />
      };
    case 'staging':
      return {
        className: 'bg-amber-900/50 text-amber-100 border-amber-700',
        icon: <ServerIcon size="xs" color="warning" />
      };
    case 'development':
      return {
        className: 'bg-blue-900/50 text-blue-100 border-blue-700',
        icon: <ServerIcon size="xs" color="primary" />
      };
    default:
      return {
        className: 'bg-slate-700/50 text-slate-300 border-slate-600',
        icon: <ServerIcon size="xs" color="secondary" />
      };
  }
};

/**
 * Get browser/device icon
 */
const getDeviceIcon = (browser?: string, os?: string) => {
  if (os?.toLowerCase().includes('mobile') || browser?.toLowerCase().includes('mobile')) {
    return <SmartphoneIcon size="xs" color="secondary" />;
  }
  return <MonitorIcon size="xs" color="secondary" />;
};

/**
 * Expandable Stack Trace Component with dark theme
 */
const StackTrace: React.FC<{ stackTrace: string; isExpanded: boolean; isCompact?: boolean }> = ({ 
  stackTrace, 
  isExpanded,
  isCompact = false
}) => {
  if (!isExpanded) return null;

  const stackLines = formatStackTrace(stackTrace);

  return (
    <div className={`${isCompact ? 'mt-3' : 'mt-4'} border-t border-slate-700 pt-4`}>
      <div className="flex items-center gap-2 mb-3">
        <GithubIcon size="xs" color="secondary" />
        <h4 className="text-sm font-medium text-slate-300">Stack Trace:</h4>
      </div>
      <div className="code-block max-h-64 overflow-y-auto">
        {stackLines.length > 0 ? (
          stackLines.map((line, index) => (
            <div key={index} className="mb-1 text-xs leading-relaxed">
              <span className="text-slate-500 mr-2">{index + 1}</span>
              <span className="text-slate-200">{line}</span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-sm">No stack trace available</div>
        )}
      </div>
    </div>
  );
};

/**
 * Error metadata component
 */
const ErrorMetadata: React.FC<{ 
  error: SentryError; 
  isCompact?: boolean; 
}> = ({ error, isCompact = false }) => {
  const {
    affectedUsers,
    totalOccurrences,
    occurredAt,
    environment,
    browser,
    os,
    url
  } = error;

  const envStyling = getEnvironmentStyling(environment);
  const deviceIcon = getDeviceIcon(browser, os);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {/* Affected Users */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <UserIcon size="xs" color="secondary" />
            <p className="text-xs text-slate-400 font-medium">Affected Users</p>
          </div>
          <p className="text-lg font-semibold text-red-400">{affectedUsers.toLocaleString()}</p>
        </div>
        
        {/* Total Occurrences */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ErrorIcon size="xs" color="secondary" />
            <p className="text-xs text-slate-400 font-medium">Occurrences</p>
          </div>
          <p className="text-lg font-semibold text-amber-400">{totalOccurrences.toLocaleString()}</p>
        </div>
        
        {/* Last Occurred */}
        {!isCompact && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <ClockIcon size="xs" color="secondary" />
              <p className="text-xs text-slate-400 font-medium">Last Occurred</p>
            </div>
            <p className="text-sm font-medium text-slate-300">{formatDate(occurredAt)}</p>
          </div>
        )}
        
        {/* Environment */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium">Environment</p>
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border
            ${envStyling.className}
          `}>
            {envStyling.icon}
            {environment}
          </span>
        </div>
      </div>

      {/* Additional Context */}
      {(browser || os || url) && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur-sm">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            {deviceIcon}
            Context
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            {browser && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Browser:</span>
                <span className="text-slate-200 font-mono text-xs">{browser}</span>
              </div>
            )}
            {os && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">OS:</span>
                <span className="text-slate-200 font-mono text-xs">{os}</span>
              </div>
            )}
            {url && (
              <div className="space-y-1">
                <span className="text-slate-400 text-xs">URL:</span>
                <p className="text-slate-200 font-mono text-xs break-all bg-slate-900/50 p-2 rounded border border-slate-700">
                  {url}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Production ErrorCard Component
 * Displays Sentry error information with dark theme and expandable stack trace
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({ 
  error, 
  className = '',
  variant = 'default',
  showActions = true
}) => {
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
      stackTrace
    } = error;

    const hasStackTrace = stackTrace && stackTrace.trim().length > 0;
    const isCompact = variant === 'compact';

    return (
      <article
        className={`
          card card-hover group animate-fade-in backdrop-blur-sm
          ${isCompact ? 'p-4' : 'p-6'}
          ${className}
        `.trim()}
        role="article"
        aria-label="Error details"
      >
        {/* Error Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Error Message */}
            <div className="flex items-start gap-3">
              <ErrorIcon size="md" color="error" className="mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-red-300 break-words leading-tight group-hover:text-red-200 transition-colors">
                  {errorMessage || 'Unknown Error'}
                </h3>
                
                {/* Error Type */}
                {errorType && (
                  <p className="text-sm text-slate-400 mt-1 font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700 inline-block">
                    {errorType}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Severity Badge */}
          <Badge 
            type={severity} 
            showIcon 
            variant="solid"
            size={isCompact ? 'sm' : 'md'}
            className="ml-4 flex-shrink-0" 
          />
        </div>

        {/* Error Metadata */}
        <ErrorMetadata error={error} isCompact={isCompact} />

        {/* Actions */}
        {showActions && hasStackTrace && (
          <div className={`${isCompact ? 'mt-4' : 'mt-6'} flex justify-between items-center`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-ghost btn-sm focus-ring"
              aria-expanded={isExpanded}
              aria-controls="stack-trace"
            >
              {isExpanded ? (
                <>
                  <EyeOffIcon size="xs" />
                  Hide Stack Trace
                </>
              ) : (
                <>
                  <EyeIcon size="xs" />
                  Show Stack Trace
                </>
              )}
            </button>
          </div>
        )}

        {/* Expandable Stack Trace */}
        {hasStackTrace && (
          <div id="stack-trace">
            <StackTrace 
              stackTrace={stackTrace} 
              isExpanded={isExpanded} 
              isCompact={isCompact}
            />
          </div>
        )}
      </article>
    );
  } catch (error) {
    console.error('Error rendering ErrorCard component:', error);
    
    // Fallback error card
    return (
      <div className="card p-6 border-red-500/50">
        <div className="flex items-center gap-3">
          <ErrorIcon size="md" color="error" />
          <div>
            <h3 className="text-sm font-medium text-red-300">Error loading error details</h3>
            <p className="text-sm text-slate-400 mt-1">
              There was a problem displaying this error information.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default ErrorCard;
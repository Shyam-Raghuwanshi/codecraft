/**
 * Badge.tsx - Reusable Badge Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, color-coded styling, reusable design
 */

import React from 'react';

// Types for badge variants
export type BadgeType = 
  | 'bug' 
  | 'style' 
  | 'performance' 
  | 'security' 
  | 'maintainability'
  | 'high' 
  | 'medium' 
  | 'low'
  | 'fatal'
  | 'error'
  | 'warning'
  | 'info';

export interface BadgeProps {
  type: BadgeType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Get color classes based on badge type
 */
const getBadgeColors = (type: BadgeType): string => {
  switch (type) {
    // Issue types
    case 'bug':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'style':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'performance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'security':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'maintainability':
      return 'bg-green-100 text-green-800 border-green-200';
    
    // Severity levels
    case 'high':
    case 'fatal':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
    case 'error':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get size classes based on badge size
 */
const getBadgeSize = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5';
    case 'md':
      return 'text-sm px-2.5 py-1';
    case 'lg':
      return 'text-base px-3 py-1.5';
    default:
      return 'text-sm px-2.5 py-1';
  }
};

/**
 * Get display label for badge type
 */
const getBadgeLabel = (type: BadgeType, customLabel?: string): string => {
  if (customLabel) return customLabel;
  
  switch (type) {
    case 'bug': return 'Bug';
    case 'style': return 'Style';
    case 'performance': return 'Performance';
    case 'security': return 'Security';
    case 'maintainability': return 'Maintainability';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    case 'fatal': return 'Fatal';
    case 'error': return 'Error';
    case 'warning': return 'Warning';
    case 'info': return 'Info';
    default: return type;
  }
};

/**
 * Badge Component
 * Color-coded badge for displaying issue types, severity levels, and statuses
 */
export const Badge: React.FC<BadgeProps> = ({ 
  type, 
  label, 
  size = 'md',
  className = '' 
}) => {
  try {
    const colorClasses = getBadgeColors(type);
    const sizeClasses = getBadgeSize(size);
    const displayLabel = getBadgeLabel(type, label);

    return (
      <span
        className={`
          inline-flex items-center font-medium rounded-full border
          ${colorClasses}
          ${sizeClasses}
          ${className}
        `.trim()}
        role="status"
        aria-label={`${type} badge: ${displayLabel}`}
      >
        {displayLabel}
      </span>
    );
  } catch (error) {
    console.error('Error rendering Badge component:', error);
    
    // Fallback badge on error
    return (
      <span 
        className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200"
        role="status"
        aria-label="Unknown badge"
      >
        {label || 'Unknown'}
      </span>
    );
  }
};

export default Badge;
/**
 * Badge.tsx - Production-Ready Badge Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, dark theme styling, accessibility, proper error handling
 */

import React from 'react';
import { BugIcon, ShieldIcon, ZapIcon, CodeIcon, TrendUpIcon } from '../lib/icons';

// Types for badge variants with expanded severity options
export type BadgeType = 
  | 'bug' 
  | 'style' 
  | 'performance' 
  | 'security' 
  | 'maintainability'
  | 'high' 
  | 'medium' 
  | 'low'
  | 'critical'
  | 'major'
  | 'minor'
  | 'fatal'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'resolved'
  | 'unresolved'
  | 'open'
  | 'closed';

export interface BadgeProps {
  type: BadgeType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'solid' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
}

/**
 * Get color classes based on badge type for dark theme
 */
const getBadgeColors = (type: BadgeType, variant: 'solid' | 'outline' | 'ghost' = 'solid'): string => {
  const colorMap = {
    // Issue types
    bug: {
      solid: 'bg-red-900/50 text-red-100 border-red-700 shadow-red-500/20',
      outline: 'bg-transparent text-red-400 border-red-600 hover:bg-red-900/20',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/30'
    },
    style: {
      solid: 'bg-blue-900/50 text-blue-100 border-blue-700 shadow-blue-500/20',
      outline: 'bg-transparent text-blue-400 border-blue-600 hover:bg-blue-900/20',
      ghost: 'bg-blue-900/20 text-blue-300 border-transparent hover:bg-blue-900/30'
    },
    performance: {
      solid: 'bg-amber-900/50 text-amber-100 border-amber-700 shadow-amber-500/20',
      outline: 'bg-transparent text-amber-400 border-amber-600 hover:bg-amber-900/20',
      ghost: 'bg-amber-900/20 text-amber-300 border-transparent hover:bg-amber-900/30'
    },
    security: {
      solid: 'bg-purple-900/50 text-purple-100 border-purple-700 shadow-purple-500/20',
      outline: 'bg-transparent text-purple-400 border-purple-600 hover:bg-purple-900/20',
      ghost: 'bg-purple-900/20 text-purple-300 border-transparent hover:bg-purple-900/30'
    },
    maintainability: {
      solid: 'bg-green-900/50 text-green-100 border-green-700 shadow-green-500/20',
      outline: 'bg-transparent text-green-400 border-green-600 hover:bg-green-900/20',
      ghost: 'bg-green-900/20 text-green-300 border-transparent hover:bg-green-900/30'
    },
    
    // Severity levels - High (Red)
    high: {
      solid: 'bg-red-900/60 text-red-100 border-red-600 shadow-red-500/30 glow-red',
      outline: 'bg-transparent text-red-400 border-red-500 hover:bg-red-900/30',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/40'
    },
    critical: {
      solid: 'bg-red-900/60 text-red-100 border-red-600 shadow-red-500/30 glow-red',
      outline: 'bg-transparent text-red-400 border-red-500 hover:bg-red-900/30',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/40'
    },
    fatal: {
      solid: 'bg-red-900/60 text-red-100 border-red-600 shadow-red-500/30 glow-red',
      outline: 'bg-transparent text-red-400 border-red-500 hover:bg-red-900/30',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/40'
    },
    
    // Severity levels - Medium (Yellow/Amber)
    medium: {
      solid: 'bg-amber-900/50 text-amber-100 border-amber-700 shadow-amber-500/20',
      outline: 'bg-transparent text-amber-400 border-amber-600 hover:bg-amber-900/20',
      ghost: 'bg-amber-900/20 text-amber-300 border-transparent hover:bg-amber-900/30'
    },
    major: {
      solid: 'bg-amber-900/50 text-amber-100 border-amber-700 shadow-amber-500/20',
      outline: 'bg-transparent text-amber-400 border-amber-600 hover:bg-amber-900/20',
      ghost: 'bg-amber-900/20 text-amber-300 border-transparent hover:bg-amber-900/30'
    },
    warning: {
      solid: 'bg-amber-900/50 text-amber-100 border-amber-700 shadow-amber-500/20',
      outline: 'bg-transparent text-amber-400 border-amber-600 hover:bg-amber-900/20',
      ghost: 'bg-amber-900/20 text-amber-300 border-transparent hover:bg-amber-900/30'
    },
    
    // Severity levels - Low (Green)
    low: {
      solid: 'bg-green-900/50 text-green-100 border-green-700 shadow-green-500/20',
      outline: 'bg-transparent text-green-400 border-green-600 hover:bg-green-900/20',
      ghost: 'bg-green-900/20 text-green-300 border-transparent hover:bg-green-900/30'
    },
    minor: {
      solid: 'bg-green-900/50 text-green-100 border-green-700 shadow-green-500/20',
      outline: 'bg-transparent text-green-400 border-green-600 hover:bg-green-900/20',
      ghost: 'bg-green-900/20 text-green-300 border-transparent hover:bg-green-900/30'
    },
    success: {
      solid: 'bg-green-900/50 text-green-100 border-green-700 shadow-green-500/20',
      outline: 'bg-transparent text-green-400 border-green-600 hover:bg-green-900/20',
      ghost: 'bg-green-900/20 text-green-300 border-transparent hover:bg-green-900/30'
    },
    
    // Status types
    error: {
      solid: 'bg-red-900/50 text-red-100 border-red-700 shadow-red-500/20',
      outline: 'bg-transparent text-red-400 border-red-600 hover:bg-red-900/20',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/30'
    },
    info: {
      solid: 'bg-blue-900/50 text-blue-100 border-blue-700 shadow-blue-500/20',
      outline: 'bg-transparent text-blue-400 border-blue-600 hover:bg-blue-900/20',
      ghost: 'bg-blue-900/20 text-blue-300 border-transparent hover:bg-blue-900/30'
    },
    resolved: {
      solid: 'bg-green-900/50 text-green-100 border-green-700 shadow-green-500/20',
      outline: 'bg-transparent text-green-400 border-green-600 hover:bg-green-900/20',
      ghost: 'bg-green-900/20 text-green-300 border-transparent hover:bg-green-900/30'
    },
    unresolved: {
      solid: 'bg-red-900/50 text-red-100 border-red-700 shadow-red-500/20',
      outline: 'bg-transparent text-red-400 border-red-600 hover:bg-red-900/20',
      ghost: 'bg-red-900/20 text-red-300 border-transparent hover:bg-red-900/30'
    },
    open: {
      solid: 'bg-blue-900/50 text-blue-100 border-blue-700 shadow-blue-500/20',
      outline: 'bg-transparent text-blue-400 border-blue-600 hover:bg-blue-900/20',
      ghost: 'bg-blue-900/20 text-blue-300 border-transparent hover:bg-blue-900/30'
    },
    closed: {
      solid: 'bg-slate-700/50 text-slate-200 border-slate-600',
      outline: 'bg-transparent text-slate-400 border-slate-600 hover:bg-slate-800/20',
      ghost: 'bg-slate-800/20 text-slate-400 border-transparent hover:bg-slate-800/30'
    }
  };

  return colorMap[type]?.[variant] || colorMap.info[variant];
};

/**
 * Get size classes based on badge size
 */
const getBadgeSize = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5 gap-1';
    case 'md':
      return 'text-sm px-2.5 py-1 gap-1.5';
    case 'lg':
      return 'text-sm px-3 py-1.5 gap-2';
    default:
      return 'text-sm px-2.5 py-1 gap-1.5';
  }
};

/**
 * Get icon component for badge type
 */
const getBadgeIcon = (type: BadgeType, size: 'sm' | 'md' | 'lg') => {
  const iconSize = size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs';
  
  switch (type) {
    case 'bug':
    case 'error':
    case 'high':
    case 'critical':
    case 'fatal':
      return <BugIcon size={iconSize} />;
    case 'security':
      return <ShieldIcon size={iconSize} />;
    case 'performance':
      return <ZapIcon size={iconSize} />;
    case 'style':
    case 'maintainability':
      return <CodeIcon size={iconSize} />;
    case 'success':
    case 'resolved':
      return <TrendUpIcon size={iconSize} />;
    default:
      return null;
  }
};

/**
 * Get display label for badge type
 */
const getBadgeLabel = (type: BadgeType, customLabel?: string): string => {
  if (customLabel) return customLabel;
  
  const labelMap: Record<BadgeType, string> = {
    bug: 'Bug',
    style: 'Style',
    performance: 'Performance',
    security: 'Security',
    maintainability: 'Maintainability',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    critical: 'Critical',
    major: 'Major',
    minor: 'Minor',
    fatal: 'Fatal',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    success: 'Success',
    resolved: 'Resolved',
    unresolved: 'Unresolved',
    open: 'Open',
    closed: 'Closed'
  };

  return labelMap[type] || type;
};

/**
 * Production Badge Component
 * Color-coded badge for displaying issue types, severity levels, and statuses with dark theme
 */
export const Badge: React.FC<BadgeProps> = ({ 
  type, 
  label, 
  size = 'md',
  showIcon = false,
  variant = 'solid',
  className = '',
  onClick
}) => {
  try {
    const colorClasses = getBadgeColors(type, variant);
    const sizeClasses = getBadgeSize(size);
    const displayLabel = getBadgeLabel(type, label);
    const icon = showIcon ? getBadgeIcon(type, size) : null;
    const isClickable = !!onClick;

    const baseClasses = `
      inline-flex items-center font-medium rounded-full border transition-all duration-200
      ${colorClasses}
      ${sizeClasses}
      ${isClickable ? 'cursor-pointer hover-lift' : ''}
      ${className}
    `.trim();

    const Component = isClickable ? 'button' : 'span';

    return (
      <Component
        className={baseClasses}
        onClick={onClick}
        role={isClickable ? 'button' : 'status'}
        aria-label={`${type} badge: ${displayLabel}`}
        tabIndex={isClickable ? 0 : undefined}
      >
        {icon}
        <span>{displayLabel}</span>
      </Component>
    );
  } catch (error) {
    console.error('Error rendering Badge component:', error);
    
    // Fallback badge on error
    return (
      <span 
        className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full border bg-slate-800 text-slate-200 border-slate-600"
        role="status"
        aria-label="Error badge"
      >
        {label || 'Error'}
      </span>
    );
  }
};

export default Badge;
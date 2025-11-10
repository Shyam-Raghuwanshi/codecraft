/**
 * StatCard.tsx - Production-Ready StatCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, dark theme, responsive design, icons, error handling
 */

import React from 'react';
import { TrendUpIcon, TrendDownIcon, Icons } from '../lib/icons';
import type { IconName } from '../lib/icons';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: IconName;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  loading?: boolean;
  variant?: 'default' | 'minimal' | 'highlighted';
  className?: string;
  onClick?: () => void;
}

/**
 * Get color classes based on card color variant for dark theme
 */
const getColorClasses = (color: StatCardProps['color'] = 'primary', variant: 'default' | 'minimal' | 'highlighted' = 'default') => {
  const colorMaps = {
    primary: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/50',
      text: 'text-blue-100',
      accent: 'text-blue-400',
      glow: 'hover:shadow-blue-500/20'
    },
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/50',
      text: 'text-green-100',
      accent: 'text-green-400',
      glow: 'hover:shadow-green-500/20'
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/50',
      text: 'text-red-100',
      accent: 'text-red-400',
      glow: 'hover:shadow-red-500/20'
    },
    warning: {
      bg: 'bg-amber-900/20',
      border: 'border-amber-700/50',
      text: 'text-amber-100',
      accent: 'text-amber-400',
      glow: 'hover:shadow-amber-500/20'
    },
    info: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/50',
      text: 'text-blue-100',
      accent: 'text-blue-400',
      glow: 'hover:shadow-blue-500/20'
    },
    secondary: {
      bg: 'bg-slate-800/50',
      border: 'border-slate-600',
      text: 'text-slate-200',
      accent: 'text-slate-400',
      glow: 'hover:shadow-slate-500/20'
    }
  };

  const baseColors = colorMaps[color] || colorMaps.primary;

  if (variant === 'highlighted') {
    return {
      ...baseColors,
      bg: baseColors.bg.replace('/20', '/40'),
      border: baseColors.border.replace('/50', ''),
      glow: `${baseColors.glow} glow-blue`
    };
  }

  if (variant === 'minimal') {
    return {
      ...baseColors,
      bg: 'bg-transparent',
      border: 'border-transparent',
    };
  }

  return baseColors;
};

/**
 * Format value for display with proper number formatting
 */
const formatValue = (value: string | number): string => {
  try {
    if (typeof value === 'string') return value;
    
    if (typeof value === 'number') {
      // Format large numbers with appropriate suffixes
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting stat value:', error);
    return 'Error';
  }
};

/**
 * Enhanced trend indicator component with icons
 */
const TrendIndicator: React.FC<{ 
  trend: StatCardProps['trend'];
  variant: 'default' | 'minimal' | 'highlighted';
}> = ({ trend, variant }) => {
  if (!trend) return null;

  try {
    const { value, isPositive, label } = trend;
    const TrendIcon = isPositive ? TrendUpIcon : TrendDownIcon;
    const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
    const bgColor = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';
    const formattedValue = Math.abs(value);

    const content = (
      <>
        <TrendIcon size="xs" color={isPositive ? 'success' : 'error'} />
        <span className={`${trendColor} font-medium text-sm`}>
          {formattedValue}%
        </span>
        {label && (
          <span className="text-slate-400 text-xs">{label}</span>
        )}
      </>
    );

    if (variant === 'minimal') {
      return (
        <div className="flex items-center gap-1">
          {content}
        </div>
      );
    }

    return (
      <div className={`
        flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-200
        ${bgColor} border border-current/20
      `}>
        {content}
      </div>
    );
  } catch (error) {
    console.error('Error rendering trend indicator:', error);
    return null;
  }
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC<{ variant: 'default' | 'minimal' | 'highlighted' }> = ({ variant }) => (
  <div className={`
    card animate-pulse
    ${variant === 'minimal' ? 'p-4' : 'p-6'}
  `}>
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-700 rounded w-1/3"></div>
      </div>
      <div className="w-8 h-8 bg-slate-700 rounded ml-4"></div>
    </div>
  </div>
);

/**
 * Production StatCard Component
 * Displays statistics with dark theme, icons, animations, and trend indicators
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  description,
  loading = false,
  variant = 'default',
  className = '',
  onClick
}) => {
  try {
    // Show loading state
    if (loading) {
      return <LoadingSkeleton variant={variant} />;
    }

    // Validate required props
    if (!title || (value === null || value === undefined)) {
      console.warn('StatCard: title and value are required props');
      return null;
    }

    const colorClasses = getColorClasses(color, variant);
    const formattedValue = formatValue(value);
    const IconComponent = icon ? Icons[icon] : null;
    const isClickable = !!onClick;

    const cardClasses = `
      card transition-all duration-300 group animate-fade-in
      ${colorClasses.bg} ${colorClasses.border} ${colorClasses.glow}
      ${variant === 'minimal' ? 'p-4' : 'p-6'}
      ${isClickable ? 'cursor-pointer hover-lift' : ''}
      ${variant === 'highlighted' ? 'ring-2 ring-current/10' : ''}
      ${className}
    `.trim();

    const Component = isClickable ? 'button' : 'div';

    return (
      <Component
        className={cardClasses}
        onClick={onClick}
        role={isClickable ? 'button' : 'article'}
        aria-label={`Statistic: ${title}${isClickable ? ' - Click for details' : ''}`}
        tabIndex={isClickable ? 0 : undefined}
      >
        <div className="flex items-start justify-between h-full">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <p className={`
              text-sm font-medium transition-colors duration-200
              ${colorClasses.text}
              ${isClickable ? 'group-hover:text-current' : ''}
            `}>
              {title}
            </p>
            
            {/* Value */}
            <div className="flex items-baseline gap-2">
              <p className={`
                text-3xl font-bold transition-all duration-200
                ${colorClasses.text}
                ${isClickable ? `group-hover:${colorClasses.accent} group-hover:scale-105` : ''}
              `}>
                {formattedValue}
              </p>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
            
            {/* Trend indicator */}
            {trend && (
              <TrendIndicator trend={trend} variant={variant} />
            )}
          </div>
          
          {/* Icon */}
          {IconComponent && (
            <div className={`
              ml-4 flex-shrink-0 transition-all duration-200
              ${colorClasses.accent}
              ${isClickable ? 'group-hover:scale-110 group-hover:text-current' : ''}
            `}>
              <IconComponent size="lg" />
            </div>
          )}
        </div>

        {/* Highlight effect for clickable cards */}
        {isClickable && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </Component>
    );
  } catch (error) {
    console.error('Error rendering StatCard component:', error);
    
    // Fallback card on error
    return (
      <div className="card p-6 border-red-500/50">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Icons.error size="md" color="error" />
          </div>
          <div>
            <p className="text-sm text-red-300 font-medium">Error loading statistic</p>
            <p className="text-xs text-slate-400 mt-1">{title || 'Unknown statistic'}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default StatCard;
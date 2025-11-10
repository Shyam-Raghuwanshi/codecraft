/**
 * StatCard.tsx - Reusable StatCard Component for CodeCraft
 * Following CodeCraft rules: TypeScript types, responsive design, proper error handling
 */

import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

/**
 * Get color classes based on card color variant
 */
const getColorClasses = (color: StatCardProps['color'] = 'blue'): { 
  bg: string; 
  text: string; 
  accent: string; 
} => {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        accent: 'text-blue-600'
      };
    case 'green':
      return {
        bg: 'bg-green-50',
        text: 'text-green-900',
        accent: 'text-green-600'
      };
    case 'red':
      return {
        bg: 'bg-red-50',
        text: 'text-red-900',
        accent: 'text-red-600'
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-900',
        accent: 'text-yellow-600'
      };
    case 'purple':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-900',
        accent: 'text-purple-600'
      };
    case 'gray':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-900',
        accent: 'text-gray-600'
      };
    default:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        accent: 'text-blue-600'
      };
  }
};

/**
 * Format value for display
 */
const formatValue = (value: string | number): string => {
  try {
    if (typeof value === 'string') return value;
    
    if (typeof value === 'number') {
      // Format large numbers with commas
      if (value >= 1000) {
        return value.toLocaleString();
      }
      return value.toString();
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting stat value:', error);
    return 'Error';
  }
};

/**
 * Trend indicator component
 */
const TrendIndicator: React.FC<{ trend: StatCardProps['trend'] }> = ({ trend }) => {
  if (!trend) return null;

  try {
    const { value, isPositive, label } = trend;
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    const trendIcon = isPositive ? '↗' : '↘';
    const formattedValue = Math.abs(value);

    return (
      <div className="flex items-center space-x-1 text-sm">
        <span className={`${trendColor} font-medium`}>
          {trendIcon} {formattedValue}%
        </span>
        {label && (
          <span className="text-gray-500">{label}</span>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering trend indicator:', error);
    return null;
  }
};

/**
 * StatCard Component
 * Displays statistics with optional icon, color theme, and trend indicator
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  className = ''
}) => {
  try {
    // Validate required props
    if (!title || (value === null || value === undefined)) {
      console.warn('StatCard: title and value are required props');
      return null;
    }

    const colorClasses = getColorClasses(color);
    const formattedValue = formatValue(value);

    return (
      <div
        className={`
          rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-md
          ${colorClasses.bg}
          ${className}
        `.trim()}
        role="article"
        aria-label={`Statistic: ${title}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title */}
            <p className={`text-sm font-medium ${colorClasses.text} mb-1`}>
              {title}
            </p>
            
            {/* Value */}
            <p className={`text-3xl font-bold ${colorClasses.text} mb-2`}>
              {formattedValue}
            </p>
            
            {/* Trend indicator */}
            {trend && <TrendIndicator trend={trend} />}
          </div>
          
          {/* Icon */}
          {icon && (
            <div className={`${colorClasses.accent} ml-4 flex-shrink-0`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering StatCard component:', error);
    
    // Fallback card on error
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-gray-50">
        <p className="text-sm text-gray-500">Error loading statistic</p>
        <p className="text-lg font-medium text-gray-700">{title || 'Unknown'}</p>
      </div>
    );
  }
};

export default StatCard;
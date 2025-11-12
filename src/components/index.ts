/**
 * Components Index - Export all reusable components for CodeCraft
 * Following CodeCraft rules: Clean exports, proper organization
 */

export { default as Badge, type BadgeProps, type BadgeType } from './Badge';
export { default as StatCard, type StatCardProps } from './StatCard';
export { default as ErrorCard, type ErrorCardProps } from './ErrorCard';
export { default as ReviewCard, type ReviewCardProps } from './ReviewCard';
export { default as LoadingSpinner, LoadingDots, InlineSpinner } from './LoadingSpinner';
export { default as ErrorBoundary, useErrorHandler } from './ErrorBoundary';
export { 
  NotificationContainer, 
  NotificationItem, 
  NotificationBell, 
  showNotification, 
  notifications 
} from './NotificationContainer';
export { default as AddRepositoryModal, type AddRepositoryModalProps } from './AddRepositoryModal';
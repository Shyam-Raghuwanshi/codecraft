/**
 * Real-time Notification Component
 * CodeCraft - Hackathon Project
 * 
 * Shows live notifications for new issues, updates, etc.
 * Follow the rules: Include error handling, accessibility, responsive design
 */

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface NotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

/**
 * Individual Notification Component
 */
export function NotificationItem({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-close if enabled
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification.autoClose, notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Match exit animation duration
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'text-green-600 hover:text-green-700',
          IconComponent: CheckCircleIcon
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'text-yellow-600 hover:text-yellow-700',
          IconComponent: ExclamationTriangleIcon
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'text-red-600 hover:text-red-700',
          IconComponent: ExclamationTriangleIcon
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'text-blue-600 hover:text-blue-700',
          IconComponent: InformationCircleIcon
        };
    }
  };

  const styles = getStyles();
  const { IconComponent } = styles;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${styles.bg} border rounded-lg shadow-md p-4 mb-3 max-w-sm w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <IconComponent className="w-5 h-5" aria-hidden="true" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${styles.title}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${styles.message}`}>
            {notification.message}
          </p>
          
          {notification.actionText && notification.onAction && (
            <button
              onClick={notification.onAction}
              className={`text-sm font-medium mt-2 ${styles.button} underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded`}
            >
              {notification.actionText}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 rounded"
          aria-label="Close notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Notification Container
 */
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Add notification function (will be exposed via context)
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      ...notification,
      id,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Expose functions via window for global access (can be improved with context)
  useEffect(() => {
    (window as any).addNotification = addNotification;
    (window as any).clearAllNotifications = clearAll;
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      role="region"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
      
      {notifications.length > 1 && (
        <div className="text-center">
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
          >
            Clear all ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Notification Bell Icon with Count
 */
interface NotificationBellProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ count, onClick, className = '' }: NotificationBellProps) {
  const hasNotifications = count > 0;
  
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full transition-colors ${
        hasNotifications 
          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-label={`Notifications${hasNotifications ? ` (${count} new)` : ''}`}
    >
      <BellIcon className="w-6 h-6" />
      
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
      
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 animate-ping"></span>
      )}
    </button>
  );
}

/**
 * Helper function to show notifications from anywhere in the app
 */
export function showNotification(notification: Omit<NotificationData, 'id'>) {
  if ((window as any).addNotification) {
    return (window as any).addNotification(notification);
  } else {
    // Fallback to browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/vite.svg',
      });
    }
    console.warn('Notification system not initialized');
  }
}

/**
 * Pre-defined notification helpers
 */
export const notifications = {
  success: (title: string, message: string, options?: Partial<NotificationData>) =>
    showNotification({ type: 'success', title, message, ...options }),
    
  error: (title: string, message: string, options?: Partial<NotificationData>) =>
    showNotification({ type: 'error', title, message, autoClose: false, ...options }),
    
  warning: (title: string, message: string, options?: Partial<NotificationData>) =>
    showNotification({ type: 'warning', title, message, ...options }),
    
  info: (title: string, message: string, options?: Partial<NotificationData>) =>
    showNotification({ type: 'info', title, message, ...options }),
    
  newIssues: (count: number, repoName: string) =>
    showNotification({
      type: 'warning',
      title: 'New Issues Detected',
      message: `${count} new issue${count > 1 ? 's' : ''} found in ${repoName}`,
      actionText: 'View Issues',
      onAction: () => {
        // Navigate to repo page
        window.location.href = `/repo?name=${encodeURIComponent(repoName)}`;
      },
    }),
    
  reviewCompleted: (repoName: string) =>
    showNotification({
      type: 'success',
      title: 'Review Completed',
      message: `Code analysis finished for ${repoName}`,
      actionText: 'View Results',
      onAction: () => {
        // Navigate to repo page
        window.location.href = `/repo?name=${encodeURIComponent(repoName)}`;
      },
    }),
};

export default NotificationContainer;
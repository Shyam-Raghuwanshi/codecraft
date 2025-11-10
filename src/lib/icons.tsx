/**
 * icons.tsx - Centralized Icon Configuration for CodeCraft
 * Following CodeCraft rules: TypeScript types, consistent naming, production-ready
 */

import React from 'react';
import { 
  Bug,
  AlertTriangle,
  AlertCircle,
  Star,
  Save,
  Github,
  Code,
  FileCode,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  User,
  LogOut,
  Home,
  Database,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon
} from 'lucide-react';

// Icon size variants
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Icon color variants based on our theme
export type IconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'white';

// Props for icon wrapper
export interface IconProps {
  size?: IconSize;
  color?: IconColor;
  className?: string;
}

/**
 * Get size classes for icons
 */
const getIconSize = (size: IconSize): string => {
  switch (size) {
    case 'xs': return 'w-3 h-3';
    case 'sm': return 'w-4 h-4';
    case 'md': return 'w-5 h-5';
    case 'lg': return 'w-6 h-6';
    case 'xl': return 'w-8 h-8';
    default: return 'w-5 h-5';
  }
};

/**
 * Get color classes for icons
 */
const getIconColor = (color: IconColor): string => {
  switch (color) {
    case 'primary': return 'text-blue-500';
    case 'secondary': return 'text-slate-400';
    case 'success': return 'text-green-500';
    case 'warning': return 'text-amber-500';
    case 'error': return 'text-red-500';
    case 'muted': return 'text-slate-500';
    case 'white': return 'text-white';
    default: return 'text-slate-300';
  }
};

/**
 * Create icon wrapper component
 */
const createIcon = (LucideComponent: LucideIcon, defaultColor: IconColor = 'secondary') => {
  const IconComponent: React.FC<IconProps> = ({ 
    size = 'md', 
    color = defaultColor, 
    className = '' 
  }) => {
    try {
      const sizeClasses = getIconSize(size);
      const colorClasses = getIconColor(color);
      
      return (
        <LucideComponent 
          className={`${sizeClasses} ${colorClasses} ${className}`.trim()} 
          aria-hidden="true"
        />
      );
    } catch (error) {
      console.error('Error rendering icon:', error);
      return null;
    }
  };
  
  IconComponent.displayName = `Icon(${LucideComponent.displayName || 'Unknown'})`;
  return IconComponent;
};

// Main application icons
export const BugIcon = createIcon(Bug, 'error');
export const ErrorIcon = createIcon(AlertCircle, 'error');
export const WarningIcon = createIcon(AlertTriangle, 'warning');
export const StarIcon = createIcon(Star, 'primary');
export const SaveIcon = createIcon(Save, 'primary');

// Development icons
export const CodeIcon = createIcon(Code, 'primary');
export const FileCodeIcon = createIcon(FileCode, 'secondary');
export const GithubIcon = createIcon(Github, 'secondary');

// Status icons
export const CheckIcon = createIcon(CheckCircle, 'success');
export const CloseIcon = createIcon(XCircle, 'error');
export const ClockIcon = createIcon(Clock, 'warning');

// Trend icons
export const TrendUpIcon = createIcon(TrendingUp, 'success');
export const TrendDownIcon = createIcon(TrendingDown, 'error');

// Feature icons
export const ZapIcon = createIcon(Zap, 'warning');
export const ShieldIcon = createIcon(Shield, 'primary');

// UI icons
export const EyeIcon = createIcon(Eye, 'secondary');
export const EyeOffIcon = createIcon(EyeOff, 'secondary');
export const SearchIcon = createIcon(Search, 'secondary');
export const FilterIcon = createIcon(Filter, 'secondary');
export const DownloadIcon = createIcon(Download, 'secondary');
export const UploadIcon = createIcon(Upload, 'secondary');
export const RefreshIcon = createIcon(RefreshCw, 'secondary');
export const SettingsIcon = createIcon(Settings, 'secondary');

// User icons
export const UserIcon = createIcon(User, 'secondary');
export const LogOutIcon = createIcon(LogOut, 'secondary');
export const HomeIcon = createIcon(Home, 'secondary');

// System icons
export const DatabaseIcon = createIcon(Database, 'secondary');
export const ServerIcon = createIcon(Server, 'secondary');

// Device icons
export const MonitorIcon = createIcon(Monitor, 'secondary');
export const SmartphoneIcon = createIcon(Smartphone, 'secondary');
export const TabletIcon = createIcon(Tablet, 'secondary');

// Icon mapping by category for easy access
export const Icons = {
  // Issues & Bugs
  bug: BugIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  
  // Actions
  star: StarIcon,
  save: SaveIcon,
  download: DownloadIcon,
  upload: UploadIcon,
  refresh: RefreshIcon,
  
  // Development
  code: CodeIcon,
  fileCode: FileCodeIcon,
  github: GithubIcon,
  
  // Status
  check: CheckIcon,
  close: CloseIcon,
  clock: ClockIcon,
  
  // Trends
  trendUp: TrendUpIcon,
  trendDown: TrendDownIcon,
  
  // Features
  zap: ZapIcon,
  shield: ShieldIcon,
  
  // UI
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  search: SearchIcon,
  filter: FilterIcon,
  settings: SettingsIcon,
  
  // User
  user: UserIcon,
  logout: LogOutIcon,
  home: HomeIcon,
  
  // System
  database: DatabaseIcon,
  server: ServerIcon,
  monitor: MonitorIcon,
  smartphone: SmartphoneIcon,
  tablet: TabletIcon
} as const;

// Type for icon names
export type IconName = keyof typeof Icons;

/**
 * Dynamic icon component that accepts icon name as prop
 */
export interface DynamicIconProps extends IconProps {
  name: IconName;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  try {
    const IconComponent = Icons[name];
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found`);
      return null;
    }
    return <IconComponent {...props} />;
  } catch (error) {
    console.error('Error rendering dynamic icon:', error);
    return null;
  }
};

/**
 * Icon with tooltip component
 */
export interface IconWithTooltipProps extends IconProps {
  icon: React.ComponentType<IconProps>;
  tooltip: string;
}

export const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ 
  icon: IconComponent, 
  tooltip, 
  ...props 
}) => {
  try {
    return (
      <div className="relative group">
        <IconComponent {...props} />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {tooltip}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering icon with tooltip:', error);
    return <IconComponent {...props} />;
  }
};

export default Icons;
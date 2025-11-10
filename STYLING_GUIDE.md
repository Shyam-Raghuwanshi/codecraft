# CodeCraft Production-Ready Styling Guide

## 🎨 Dark Theme Design System

CodeCraft now features a comprehensive dark theme with blue/purple accents, following modern design principles and accessibility standards.

### Color Palette

#### Primary Colors
- **Primary**: Blue (rgb(59 130 246)) - Main brand color
- **Accent**: Purple (rgb(147 51 234)) - Secondary brand color
- **Background**: Slate-900 (rgb(15 23 42)) - Main background
- **Surface**: Slate-800 (rgb(30 41 59)) - Card backgrounds
- **Text**: Slate-50 (rgb(248 250 252)) - Primary text

#### Severity Colors (Following CodeCraft Rules)
- **High/Critical**: Red (rgb(239 68 68)) - High severity issues
- **Medium/Warning**: Amber (rgb(245 158 11)) - Medium severity issues  
- **Low/Success**: Green (rgb(34 197 94)) - Low severity issues

### Component Library

#### 1. Badge Component (`/src/components/Badge.tsx`)

**Features:**
- Color-coded severity levels (Red, Amber, Green)
- Dark theme variants (solid, outline, ghost)
- Icon support with lucide-react
- Accessibility compliance (ARIA labels, focus management)
- Three sizes (sm, md, lg)

**Usage:**
```tsx
import { Badge } from '../components/Badge'

<Badge type="high" showIcon variant="solid" />
<Badge type="medium" label="Custom Label" size="lg" />
<Badge type="success" variant="ghost" onClick={handleClick} />
```

#### 2. StatCard Component (`/src/components/StatCard.tsx`)

**Features:**
- Dark theme with color variants
- Icon integration from lucide-react
- Trend indicators with up/down arrows
- Loading skeletons
- Hover animations and click handling
- Responsive layout

**Usage:**
```tsx
import { StatCard } from '../components/StatCard'

<StatCard
  title="Total Issues"
  value={142}
  icon="bug"
  color="error"
  trend={{ value: 12, isPositive: false, label: "vs last month" }}
  description="Issues found in code review"
  onClick={handleViewDetails}
/>
```

#### 3. ReviewCard Component (`/src/components/ReviewCard.tsx`)

**Features:**
- Production-ready dark theme styling
- Smooth hover animations
- File path formatting
- Suggestion highlighting
- Code snippet display with syntax styling
- Save functionality with loading states
- Error handling and fallback UI

**Usage:**
```tsx
import { ReviewCard } from '../components/ReviewCard'

<ReviewCard
  review={reviewData}
  onSave={handleSave}
  variant="compact"
  isLoading={false}
/>
```

#### 4. ErrorCard Component (`/src/components/ErrorCard.tsx`)

**Features:**
- Error details with dark theme
- Expandable stack traces
- Environment badges
- Device/browser context
- Severity indicators
- User and occurrence statistics

**Usage:**
```tsx
import { ErrorCard } from '../components/ErrorCard'

<ErrorCard
  error={sentryError}
  variant="compact"
  showActions={true}
/>
```

### Icon System (`/src/lib/icons.tsx`)

**Features:**
- Centralized icon management with lucide-react
- Consistent sizing (xs, sm, md, lg, xl)
- Color variants matching theme
- Type-safe icon names
- Dynamic icon component
- Icon with tooltip support

**Usage:**
```tsx
import { BugIcon, Icons, DynamicIcon } from '../lib/icons'

// Direct icon usage
<BugIcon size="lg" color="error" />

// Dynamic icon usage
<DynamicIcon name="star" size="md" color="primary" />

// Icon with tooltip
<IconWithTooltip 
  icon={SaveIcon} 
  tooltip="Save this review" 
  size="sm" 
/>
```

### CSS Classes & Utilities

#### Component Classes
```css
/* Buttons */
.btn - Base button styles
.btn-primary - Primary button with blue background
.btn-secondary - Secondary button with slate background
.btn-danger - Error/danger button with red background
.btn-ghost - Transparent button
.btn-sm/.btn-md/.btn-lg - Button sizes

/* Cards */
.card - Base card with dark background
.card-hover - Card with hover effects
.card-glow - Card with blue glow effect

/* Badges */
.badge-high - High severity (red)
.badge-medium - Medium severity (amber)
.badge-low - Low severity (green)

/* Status indicators */
.status-success/.status-warning/.status-error - Color-coded status dots
```

#### Utility Classes
```css
/* Animations */
.animate-fade-in - Fade in animation
.animate-slide-in-left/.animate-slide-in-right - Slide animations
.animate-scale-in - Scale in animation
.animate-pulse-glow - Pulsing glow effect
.animate-float - Floating animation

/* Effects */
.glow-blue/.glow-purple/.glow-green/.glow-red - Colored glow effects
.hover-lift - Lift effect on hover
.glass/.glass-strong - Glass morphism effects

/* Typography */
.heading-1/.heading-2/.heading-3 - Heading styles with gradient text
.text-primary/.text-secondary/.text-muted - Text color variants
.gradient-text - Gradient text effect
```

### Responsive Design

#### Breakpoints
- Mobile: < 640px
- Tablet: 641px - 1024px  
- Desktop: > 1024px

#### Responsive Features
- Container with proper padding
- Grid layouts that stack on mobile
- Responsive typography scaling
- Touch-friendly button sizes
- Safe area support for mobile devices

### Animations & Transitions

#### Performance Optimized
- GPU-accelerated transforms
- Reduced motion support
- Efficient CSS animations
- Staggered loading animations

#### Animation Types
```css
/* Entrance animations */
.animate-fade-in - 600ms fade in
.animate-slide-in-left - 500ms slide from left
.animate-scale-in - 400ms scale up

/* Interactive animations */
.hover-lift - Smooth transform on hover
.card-hover - Shadow and border transitions
.animate-pulse-glow - Infinite pulsing glow

/* Loading animations */
.loading-skeleton - Skeleton loading
.loading-spinner - Spinning loader
```

### Accessibility Features

#### WCAG Compliance
- High contrast ratios for dark theme
- Focus management with visible focus rings
- Screen reader support (ARIA labels)
- Keyboard navigation
- Reduced motion support

#### Focus Management
```css
.focus-ring - Standard focus ring
.focus-visible - Focus visible only for keyboard users
```

### Usage Examples

#### Complete Dashboard Layout
```tsx
function Dashboard() {
  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="heading-1 mb-2">Dashboard</h1>
          <p className="text-secondary">Welcome back, developer!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Issues"
            value={42}
            icon="bug"
            color="error"
            trend={{ value: 15, isPositive: false }}
          />
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReviewCard
            review={reviewData}
            onSave={handleSave}
            className="animate-fade-in"
          />
          <ErrorCard
            error={errorData}
            variant="compact"
          />
        </div>
      </div>
    </div>
  )
}
```

### Mobile-First Responsive Design

All components are designed mobile-first with proper scaling:

- Cards stack vertically on mobile
- Text sizes scale appropriately
- Touch targets are 44px minimum
- Proper spacing and padding
- Safe area support for notched devices

### Performance Considerations

- CSS custom properties for theming
- Efficient animations using transforms
- Lazy loading for heavy components
- Optimized bundle sizes
- Reduced motion preferences respected

## 🚀 Production Deployment

The styling system is production-ready with:

1. **Cross-browser compatibility**
2. **High performance animations**
3. **Accessibility compliance**
4. **Mobile optimization**
5. **Dark theme support**
6. **Consistent design language**

Use this styling system across all CodeCraft components for a cohesive, professional user experience.
/**
 * Loading skeleton component for displaying loading states
 */

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className = '', lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-gray-200 dark:bg-slate-700"
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <div className={`animate-pulse rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

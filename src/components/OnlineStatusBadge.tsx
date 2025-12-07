import React from 'react';

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OnlineStatusBadge: React.FC<OnlineStatusBadgeProps> = ({
  isOnline,
  lastSeen,
  size = 'md',
}) => {
  const formatLastSeen = (date: string) => {
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <div
          className={`${sizeClasses[size]} rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-slate-400'
          } animate-pulse`}
        />
        {isOnline && (
          <div className={`${sizeClasses[size]} absolute inset-0 rounded-full border-2 border-green-400`} />
        )}
      </div>
      <span className={`${badgeClasses[size]} font-medium ${isOnline ? 'text-green-600' : 'text-slate-600'}`}>
        {isOnline ? 'Online' : lastSeen ? `Offline - ${formatLastSeen(lastSeen)}` : 'Offline'}
      </span>
    </div>
  );
};

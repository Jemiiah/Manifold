'use client';

import { LayoutGrid, Clock } from 'lucide-react';
import { MarketFilter } from '@/types';
import { cn } from '@/lib/utils';

interface MarketFiltersProps {
  activeFilter: MarketFilter;
  onFilterChange: (filter: MarketFilter) => void;
  liveCount: number;
  upcomingCount: number;
}

export function MarketFilters({ activeFilter, onFilterChange, liveCount, upcomingCount }: MarketFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      <FilterButton
        isActive={activeFilter === 'all'}
        onClick={() => onFilterChange('all')}
        icon={<LayoutGrid className="w-4 h-4" />}
        label="All Markets"
      />
      <FilterButton
        isActive={activeFilter === 'live'}
        onClick={() => onFilterChange('live')}
        variant="success"
        icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        label="Live Markets"
        count={liveCount}
      />
      <FilterButton
        isActive={activeFilter === 'upcoming'}
        onClick={() => onFilterChange('upcoming')}
        variant="warning"
        icon={<Clock className="w-4 h-4" />}
        label="Upcoming"
        count={upcomingCount}
      />
    </div>
  );
}

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  variant?: 'default' | 'success' | 'warning';
}

function FilterButton({ isActive, onClick, icon, label, count, variant = 'default' }: FilterButtonProps) {
  const activeStyles = {
    default: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border',
        isActive ? activeStyles[variant] : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:text-white hover:border-zinc-700'
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </button>
  );
}

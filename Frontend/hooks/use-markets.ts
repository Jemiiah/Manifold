'use client';

import { useState, useMemo } from 'react';
import { Market, MarketFilter } from '@/types';
import { filterMarkets, countMarketsByStatus } from '@/lib/utils';

export function useMarkets(initialMarkets: Market[]) {
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = useMemo(() => {
    let markets = filterMarkets(initialMarkets, filter);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      markets = markets.filter(
        (market) =>
          market.title.toLowerCase().includes(query) ||
          market.description?.toLowerCase().includes(query) ||
          market.category?.toLowerCase().includes(query)
      );
    }

    return markets;
  }, [initialMarkets, filter, searchQuery]);

  const counts = useMemo(
    () => countMarketsByStatus(initialMarkets),
    [initialMarkets]
  );

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredMarkets,
    liveCount: counts.live,
    upcomingCount: counts.upcoming,
  };
}

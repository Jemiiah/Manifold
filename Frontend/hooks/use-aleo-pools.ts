'use client';

import { useState, useEffect, useCallback } from 'react';
import { Market, MarketCategory } from '@/types';
import { fetchAllMarkets, fetchPendingMarkets, fetchLockedMarkets, ApiMarket } from '@/lib/api-client';

// Dummy pools to show when no real pools exist (Polymarket-style markets)
const DUMMY_POOLS: Market[] = [
  {
    id: 'dummy-1',
    title: 'Bitcoin above $100K on Feb 28?',
    subtitle: 'ABOVE vs BELOW',
    category: 'Price',
    endDate: 'Feb 28, 2026',
    volume: '$12.5K',
    traders: 234,
    yesPrice: 72,
    noPrice: 28,
    change: 5.2,
    status: 'live',
    description: 'This market will resolve to Yes if Bitcoin price is above $100,000 USD at 11:59 PM ET on February 28, 2026.',
    resolution: 'Resolves based on the Coinbase BTC-USD spot price.',
    history: [65, 67, 68, 70, 69, 71, 70, 72, 71, 72],
  },
  {
    id: 'dummy-2',
    title: 'ETH above $4,000 by March?',
    subtitle: 'ABOVE vs BELOW',
    category: 'Price',
    endDate: 'Mar 31, 2026',
    volume: '$8.2K',
    traders: 156,
    yesPrice: 45,
    noPrice: 55,
    change: -2.1,
    status: 'live',
    description: 'Will Ethereum price exceed $4,000 USD at any point before March 31, 2026?',
    resolution: 'Resolves based on Binance ETH-USDT price data.',
    history: [52, 50, 48, 47, 46, 48, 47, 45, 46, 45],
  },
  {
    id: 'dummy-3',
    title: 'Bitcoin ATH by Q1 2026?',
    subtitle: 'YES vs NO',
    category: 'Price',
    endDate: 'Mar 31, 2026',
    volume: '$25.8K',
    traders: 412,
    yesPrice: 68,
    noPrice: 32,
    change: 3.5,
    status: 'live',
    description: 'Will Bitcoin reach a new all-time high (above $109,000) before the end of Q1 2026?',
    resolution: 'Resolves based on CoinGecko ATH data.',
    history: [60, 62, 64, 65, 66, 67, 66, 68, 67, 68],
  },
  {
    id: 'dummy-4',
    title: 'Solana above $300 in 2026?',
    subtitle: 'ABOVE vs BELOW',
    category: 'Token',
    endDate: 'Dec 31, 2026',
    volume: '$5.1K',
    traders: 89,
    yesPrice: 38,
    noPrice: 62,
    change: 1.8,
    status: 'live',
    description: 'Will Solana (SOL) price exceed $300 USD at any point during 2026?',
    resolution: 'Resolves based on Coinbase SOL-USD spot price.',
    history: [35, 34, 36, 37, 36, 38, 37, 38, 39, 38],
  },
  {
    id: 'dummy-5',
    title: 'Ethereum Flips Bitcoin',
    subtitle: 'FLIPPED vs REMAINS',
    category: 'DeFi',
    endDate: 'Dec 31, 2026',
    volume: '$15.3K',
    traders: 278,
    yesPrice: 18,
    noPrice: 82,
    change: -0.5,
    status: 'live',
    description: 'Will Ethereum market cap exceed Bitcoin market cap at any point in 2026?',
    resolution: 'Resolves based on CoinGecko market cap data.',
    history: [20, 19, 18, 19, 18, 19, 18, 18, 19, 18],
  },
  {
    id: 'dummy-6',
    title: 'Gas fees above 50 gwei today?',
    subtitle: 'SPIKE vs STABLE',
    category: 'Network',
    endDate: 'Today',
    volume: '$2.1K',
    traders: 45,
    yesPrice: 55,
    noPrice: 45,
    change: 8.3,
    status: 'live',
    description: 'Will Ethereum average gas fees exceed 50 gwei at any point today?',
    resolution: 'Resolves based on Etherscan gas tracker.',
    history: [40, 42, 45, 48, 50, 52, 54, 53, 55, 55],
  },
  {
    id: 'dummy-7',
    title: 'Aleo Top 50 by June?',
    subtitle: 'YES vs NO',
    category: 'Token',
    endDate: 'Jun 30, 2026',
    volume: '$3.4K',
    traders: 67,
    yesPrice: 62,
    noPrice: 38,
    change: 4.1,
    status: 'live',
    description: 'Will Aleo (ALEO) enter the top 50 cryptocurrencies by market cap before June 30, 2026?',
    resolution: 'Resolves based on CoinGecko rankings.',
    history: [55, 56, 58, 59, 60, 61, 60, 62, 61, 62],
  },
  {
    id: 'dummy-8',
    title: 'BTC Dominance above 60%?',
    subtitle: 'ABOVE vs BELOW',
    category: 'DeFi',
    endDate: 'Mar 31, 2026',
    volume: '$7.8K',
    traders: 134,
    yesPrice: 48,
    noPrice: 52,
    change: -1.2,
    status: 'live',
    description: 'Will Bitcoin dominance exceed 60% at any point before end of Q1 2026?',
    resolution: 'Resolves based on CoinGecko dominance data.',
    history: [52, 51, 50, 49, 50, 49, 48, 49, 48, 48],
  },
];

// Convert API market to Market type
function apiMarketToMarket(market: ApiMarket): Market {
  // Parse stakes from string to number
  const optionAStakes = parseInt(market.option_a_stakes || '0', 10);
  const optionBStakes = parseInt(market.option_b_stakes || '0', 10);
  const totalStakes = optionAStakes + optionBStakes;

  let yesPrice = 50;
  let noPrice = 50;

  if (totalStakes > 0) {
    yesPrice = Math.round((optionAStakes / totalStakes) * 100);
    noPrice = 100 - yesPrice;
  }

  // Determine status based on API status
  let status: 'live' | 'upcoming' | 'resolved' = 'upcoming';
  if (market.status === 'pending') {
    status = 'live';
  } else if (market.status === 'locked') {
    status = 'upcoming';
  } else if (market.status === 'resolved') {
    status = 'resolved';
  }

  // Convert deadline to readable date (deadline is Unix timestamp as string)
  const deadlineTimestamp = parseInt(market.deadline || '0', 10);
  const deadline = deadlineTimestamp ? new Date(deadlineTimestamp * 1000) : new Date();
  const endDate = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Convert total staked to volume string (microcredits to Aleo)
  const totalStaked = parseInt(market.total_staked || '0', 10);
  const volumeInAleo = totalStaked / 1_000_000;
  const volume = volumeInAleo >= 1000
    ? `$${(volumeInAleo / 1000).toFixed(1)}K`
    : `$${volumeInAleo.toFixed(2)}`;

  // Create subtitle from option labels
  const subtitle = `${market.option_a_label} vs ${market.option_b_label}`;

  return {
    id: market.market_id,
    title: market.title || `Market`,
    subtitle: subtitle,
    category: 'DeFi' as MarketCategory,
    endDate,
    volume,
    traders: 0,
    yesPrice,
    noPrice,
    change: 0,
    status,
    description: market.description || `A prediction market on Manifold.`,
    resolution: `This market resolves based on the ${market.metric_type} oracle. Threshold: ${market.threshold}`,
    history: [yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice],
  };
}

export function useAleoPools() {
  // Start with dummy pools so UI is immediately responsive
  const [pools, setPools] = useState<Market[]>(DUMMY_POOLS);
  const [pendingPools, setPendingPools] = useState<Market[]>([]);
  const [lockedPools, setLockedPools] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Don't show loading since we have dummy data
  const [isBackendLoading, setIsBackendLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    setIsBackendLoading(true);
    setError(null);

    try {
      // Fetch all markets from backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const [allMarkets, pending, locked] = await Promise.all([
        fetchAllMarkets(),
        fetchPendingMarkets(),
        fetchLockedMarkets(),
      ]);

      clearTimeout(timeoutId);

      // Convert API markets to Market type
      const allPools = allMarkets.map(apiMarketToMarket);
      const pendingMarkets = pending.map(apiMarketToMarket);
      const lockedMarkets = locked.map(apiMarketToMarket);

      if (allPools.length > 0) {
        // Combine backend markets with dummy pools for more content
        setPools([...allPools, ...DUMMY_POOLS]);
        setPendingPools(pendingMarkets);
        setLockedPools(lockedMarkets);
        return;
      }

      // No real pools found, keep dummy pools
      console.log('No markets found from backend, using dummy data');
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      // Keep dummy pools on error - no change needed
    } finally {
      setIsBackendLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const refetch = useCallback(() => {
    fetchPools();
  }, [fetchPools]);

  return {
    pools,
    pendingPools,
    lockedPools,
    isLoading,
    isBackendLoading,
    error,
    refetch,
    isDummyData: pools.length === DUMMY_POOLS.length && pools[0]?.id === DUMMY_POOLS[0]?.id,
  };
}

// Export dummy pools for use in other places
export { DUMMY_POOLS };

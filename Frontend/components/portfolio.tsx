'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Search, X, Trophy, DollarSign, Hash, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserPredictions } from '@/hooks/use-user-predictions';

interface PortfolioStats {
  totalValue: number;
  netPL: number;
  netPLPercent: number;
  totalVolume: number;
  biggestWin: number;
  totalTrades: number;
  activePositions: number;
  closedPositions: number;
}

interface Position {
  id: string;
  marketId: string;
  market: string;
  outcome: 'Yes' | 'No';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pl: number;
  plPercent: number;
  status: 'active' | 'closed';
  result?: 'won' | 'lost' | 'pending';
  closedAt?: string;
}

interface PortfolioProps {
  isConnected?: boolean;
}

// Mock data for active positions (linked to actual markets)
const mockActivePositions: Position[] = [
  {
    id: '1',
    marketId: '3',
    market: 'Bitcoin $150K',
    outcome: 'Yes',
    shares: 150,
    avgPrice: 0.65,
    currentPrice: 0.72,
    value: 108.0,
    pl: 10.5,
    plPercent: 10.77,
    status: 'active',
  },
  {
    id: '2',
    marketId: '1',
    market: 'Ethereum ETF Approval',
    outcome: 'No',
    shares: 200,
    avgPrice: 0.45,
    currentPrice: 0.38,
    value: 76.0,
    pl: 14.0,
    plPercent: 22.58,
    status: 'active',
  },
  {
    id: '3',
    marketId: '2',
    market: 'Aleo Mainnet TVL',
    outcome: 'Yes',
    shares: 500,
    avgPrice: 0.82,
    currentPrice: 0.79,
    value: 395.0,
    pl: -15.0,
    plPercent: -3.66,
    status: 'active',
  },
  {
    id: '4',
    marketId: '4',
    market: 'Solana Outage',
    outcome: 'No',
    shares: 100,
    avgPrice: 0.25,
    currentPrice: 0.22,
    value: 22.0,
    pl: 3.0,
    plPercent: 13.64,
    status: 'active',
  },
  {
    id: '5',
    marketId: '9',
    market: 'Base Chain Dominance',
    outcome: 'Yes',
    shares: 300,
    avgPrice: 0.55,
    currentPrice: 0.61,
    value: 183.0,
    pl: 18.0,
    plPercent: 10.91,
    status: 'active',
  },
];

// Mock data for closed positions (linked to actual markets)
const mockClosedPositions: Position[] = [
  {
    id: '6',
    marketId: '5',
    market: 'zkSync Token Launch',
    outcome: 'Yes',
    shares: 1000,
    avgPrice: 0.52,
    currentPrice: 1.0,
    value: 1000.0,
    pl: 480.0,
    plPercent: 92.31,
    status: 'closed',
    result: 'won',
    closedAt: '2024-11-06',
  },
  {
    id: '7',
    marketId: '6',
    market: 'Uniswap v4 Launch',
    outcome: 'Yes',
    shares: 250,
    avgPrice: 0.78,
    currentPrice: 1.0,
    value: 250.0,
    pl: 55.0,
    plPercent: 28.21,
    status: 'closed',
    result: 'won',
    closedAt: '2025-01-01',
  },
  {
    id: '8',
    marketId: '7',
    market: 'Aleo ZK Proving',
    outcome: 'Yes',
    shares: 400,
    avgPrice: 0.35,
    currentPrice: 0.0,
    value: 0.0,
    pl: -140.0,
    plPercent: -100.0,
    status: 'closed',
    result: 'lost',
    closedAt: '2024-12-31',
  },
  {
    id: '9',
    marketId: '1',
    market: 'Ethereum ETF Approval',
    outcome: 'No',
    shares: 600,
    avgPrice: 0.42,
    currentPrice: 0.0,
    value: 0.0,
    pl: -252.0,
    plPercent: -100.0,
    status: 'closed',
    result: 'lost',
    closedAt: '2024-05-23',
  },
  {
    id: '10',
    marketId: '8',
    market: 'ETH Staking Rate',
    outcome: 'No',
    shares: 180,
    avgPrice: 0.68,
    currentPrice: 1.0,
    value: 180.0,
    pl: 57.6,
    plPercent: 47.06,
    status: 'closed',
    result: 'won',
    closedAt: '2024-12-31',
  },
  {
    id: '11',
    marketId: '9',
    market: 'Base Chain Dominance',
    outcome: 'Yes',
    shares: 320,
    avgPrice: 0.71,
    currentPrice: 1.0,
    value: 320.0,
    pl: 92.8,
    plPercent: 40.88,
    status: 'closed',
    result: 'won',
    closedAt: '2024-11-15',
  },
];

const defaultStats: PortfolioStats = {
  totalValue: 784.0,
  netPL: 324.9,
  netPLPercent: 41.4,
  totalVolume: 4722.55,
  biggestWin: 480.0,
  totalTrades: 11,
  activePositions: 5,
  closedPositions: 6,
};

type TabType = 'active' | 'closed';

// Convert user predictions to Position format
function predictionsToPositions(predictions: ReturnType<typeof useUserPredictions>['predictions']): Position[] {
  return predictions.map((pred, index) => ({
    id: pred.id,
    marketId: pred.poolId,
    market: pred.poolName,
    outcome: pred.outcome,
    shares: 0,
    avgPrice: 0.5,
    currentPrice: 0.5,
    value: pred.amountUsd,
    pl: 0,
    plPercent: 0,
    status: pred.status === 'active' ? 'active' : 'closed',
    result: pred.status === 'won' ? 'won' : pred.status === 'lost' ? 'lost' : 'pending',
  }));
}

export function Portfolio({ isConnected = false }: PortfolioProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real predictions from the user's wallet
  const {
    predictions: userPredictions,
    isLoading: isLoadingPredictions,
    hasPredictions,
    refetch: refetchPredictions,
  } = useUserPredictions();

  // Convert predictions to positions, or use mock data as fallback
  const realPositions = useMemo(() => predictionsToPositions(userPredictions), [userPredictions]);

  // Use real positions if available, otherwise use mock data
  const activePositions = hasPredictions
    ? realPositions.filter((p) => p.status === 'active')
    : mockActivePositions;

  const closedPositions = hasPredictions
    ? realPositions.filter((p) => p.status === 'closed')
    : mockClosedPositions;

  // Calculate stats from real data or use defaults
  const stats = useMemo(() => {
    if (hasPredictions) {
      const totalValue = realPositions.reduce((sum, p) => sum + p.value, 0);
      return {
        totalValue,
        netPL: 0,
        netPLPercent: 0,
        totalVolume: totalValue,
        biggestWin: 0,
        totalTrades: realPositions.length,
        activePositions: activePositions.length,
        closedPositions: closedPositions.length,
      };
    }
    return defaultStats;
  }, [hasPredictions, realPositions, activePositions.length, closedPositions.length]);

  const filteredPositions = useMemo(() => {
    const positions = activeTab === 'active' ? activePositions : closedPositions;

    if (!searchQuery.trim()) {
      return positions;
    }

    const query = searchQuery.toLowerCase();
    return positions.filter(
      (position) =>
        position.market.toLowerCase().includes(query) ||
        position.outcome.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery, activePositions, closedPositions]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Portfolio
          </h1>
          <p className="text-zinc-400 text-lg">
            Track your predictions and performance across all markets.
          </p>
          {!hasPredictions && isConnected && (
            <p className="text-amber-400/70 text-sm mt-2">
              Showing sample data. Sync wallet to see your predictions.
            </p>
          )}
        </div>

        {/* Sync Button */}
        {isConnected && (
          <button
            onClick={() => refetchPredictions()}
            disabled={isLoadingPredictions}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {isLoadingPredictions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoadingPredictions ? 'Syncing...' : 'Sync Wallet'}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Portfolio Value */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-zinc-500">Portfolio Value</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${stats.totalValue.toFixed(2)}
          </div>
        </div>

        {/* Net P&L */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {stats.netPL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs font-medium text-zinc-500">Net P&L</span>
          </div>
          <div className={cn(
            "text-xl font-bold font-mono",
            stats.netPL >= 0 ? "text-emerald-400" : "text-red-400"
          )}>
            {stats.netPL >= 0 ? '+' : ''}${stats.netPL.toFixed(2)}
          </div>
          <span className={cn(
            "text-xs",
            stats.netPL >= 0 ? "text-emerald-400/70" : "text-red-400/70"
          )}>
            ({stats.netPLPercent >= 0 ? '+' : ''}{stats.netPLPercent.toFixed(1)}%)
          </span>
        </div>

        {/* Biggest Win */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-zinc-500">Biggest Win</span>
          </div>
          <div className="text-xl font-bold text-yellow-400 font-mono">
            +${stats.biggestWin.toFixed(2)}
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-zinc-500">Volume Traded</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${stats.totalVolume.toFixed(2)}
          </div>
        </div>

        {/* Total Trades */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Total Trades</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {stats.totalTrades}
          </div>
        </div>

        {/* Positions Count */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-zinc-500">Positions</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {stats.activePositions} <span className="text-sm text-zinc-500">active</span>
          </div>
        </div>
      </div>

      {/* Positions Section */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl overflow-hidden">
        {/* Tabs and Search */}
        <div className="px-6 py-4 border-b border-zinc-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'active'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Active
                <span className={cn(
                  'ml-2 px-1.5 py-0.5 rounded text-xs',
                  activeTab === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-500'
                )}>
                  {stats.activePositions}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'closed'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Closed
                <span className={cn(
                  'ml-2 px-1.5 py-0.5 rounded text-xs',
                  activeTab === 'closed' ? 'bg-zinc-600 text-zinc-300' : 'bg-zinc-700 text-zinc-500'
                )}>
                  {stats.closedPositions}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 sm:mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Positions Table */}
        {!isConnected ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 mb-2">Connect your wallet to view positions</p>
            <p className="text-sm text-zinc-500">Your portfolio data will appear here</p>
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 mb-2">
              {searchQuery ? 'No positions match your search' : `No ${activeTab} positions`}
            </p>
            <p className="text-sm text-zinc-500">
              {searchQuery ? 'Try a different search term' : 'Start trading to see your positions here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-800/30">
                  <th className="px-6 py-3">Market</th>
                  <th className="px-6 py-3">Outcome</th>
                  <th className="px-6 py-3 text-right">Avg Price</th>
                  {activeTab === 'active' && <th className="px-6 py-3 text-right">Current</th>}
                  <th className="px-6 py-3 text-right">Value</th>
                  <th className="px-6 py-3 text-right">P/L</th>
                  {activeTab === 'closed' && <th className="px-6 py-3 text-center">Result</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPositions.map((position) => (
                  <tr key={position.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link
                        href={`/market/${position.marketId}`}
                        className="flex items-center gap-2 text-sm text-white font-medium max-w-xs hover:text-blue-400 transition-colors"
                      >
                        <span className="truncate">{position.market}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                      {activeTab === 'closed' && position.closedAt && (
                        <div className="text-xs text-zinc-500 mt-1">
                          Closed {position.closedAt}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        position.outcome === 'Yes'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-zinc-600/30 text-zinc-300'
                      )}>
                        {position.outcome}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 text-right font-mono">
                      {(position.avgPrice * 100).toFixed(0)}¢
                    </td>
                    {activeTab === 'active' && (
                      <td className="px-6 py-4 text-sm text-white text-right font-mono">
                        {(position.currentPrice * 100).toFixed(0)}¢
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-white text-right font-mono">
                      ${position.value.toFixed(2)}
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm text-right font-mono font-medium",
                      position.pl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      <div>
                        {position.pl >= 0 ? '+' : ''}${position.pl.toFixed(2)}
                      </div>
                      <div className="text-xs opacity-70">
                        ({position.plPercent >= 0 ? '+' : ''}{position.plPercent.toFixed(1)}%)
                      </div>
                    </td>
                    {activeTab === 'closed' && (
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          position.result === 'won'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : position.result === 'lost'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-zinc-600/30 text-zinc-400'
                        )}>
                          {position.result === 'won' ? 'Won' : position.result === 'lost' ? 'Lost' : 'Pending'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

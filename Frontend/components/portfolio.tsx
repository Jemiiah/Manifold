'use client';

import { TrendingUp, TrendingDown, Wallet, Activity, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioStats {
  totalValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  activePositions: number;
}

interface Position {
  id: string;
  market: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pl: number;
  plPercent: number;
}

interface PortfolioProps {
  stats?: PortfolioStats;
  positions?: Position[];
  isConnected?: boolean;
}

const defaultStats: PortfolioStats = {
  totalValue: 0,
  unrealizedPL: 0,
  unrealizedPLPercent: 0,
  activePositions: 0,
};

const mockPositions: Position[] = [];

export function Portfolio({
  stats = defaultStats,
  positions = mockPositions,
  isConnected = false,
}: PortfolioProps) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Portfolio
        </h1>
        <p className="text-zinc-400 text-lg">
          Track your active positions and performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Portfolio Value Card */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-zinc-400">Portfolio Value</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            ${stats.totalValue.toFixed(2)}
          </div>
        </div>

        {/* Unrealized P/L Card */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              stats.unrealizedPL >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {stats.unrealizedPL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <span className="text-sm font-medium text-zinc-400">Unrealized P/L</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-bold font-mono",
              stats.unrealizedPL >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {stats.unrealizedPL >= 0 ? '+' : ''}${stats.unrealizedPL.toFixed(2)}
            </span>
            <span className={cn(
              "text-sm font-medium",
              stats.unrealizedPL >= 0 ? "text-emerald-400/70" : "text-red-400/70"
            )}>
              ({stats.unrealizedPLPercent >= 0 ? '+' : ''}{stats.unrealizedPLPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Active Positions Card */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-zinc-400">Active Positions</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {stats.activePositions}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/60">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-400" />
            Active Positions
          </h2>
        </div>

        {!isConnected ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 mb-2">Connect your wallet to view positions</p>
            <p className="text-sm text-zinc-500">Your portfolio data will appear here</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-zinc-400 mb-2">No active positions</p>
            <p className="text-sm text-zinc-500">Start trading to see your positions here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Market</th>
                  <th className="px-6 py-3">Outcome</th>
                  <th className="px-6 py-3 text-right">Shares</th>
                  <th className="px-6 py-3 text-right">Avg Price</th>
                  <th className="px-6 py-3 text-right">Current</th>
                  <th className="px-6 py-3 text-right">Value</th>
                  <th className="px-6 py-3 text-right">P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {positions.map((position) => (
                  <tr key={position.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {position.market}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {position.outcome}
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-right font-mono">
                      {position.shares}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 text-right font-mono">
                      ${position.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-right font-mono">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-right font-mono">
                      ${position.value.toFixed(2)}
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm text-right font-mono font-medium",
                      position.pl >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {position.pl >= 0 ? '+' : ''}${position.pl.toFixed(2)}
                      <span className="text-xs ml-1 opacity-70">
                        ({position.plPercent >= 0 ? '+' : ''}{position.plPercent.toFixed(1)}%)
                      </span>
                    </td>
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

'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Users, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Badge } from '@/components/ui';
import { TradingPanel } from '@/components/market/trading-panel';
import { ActivityFeed } from '@/components/market/activity-feed';
import { mockActivities } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import { useAleoPools } from '@/hooks';

export default function MarketPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  // Fetch pools from Aleo network (with dummy fallback)
  const { pools, isLoading } = useAleoPools();

  // Find the market by ID
  const market = pools.find((m) => m.id === marketId);

  const handleBack = () => {
    router.push('/');
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar
          activeTab="market"
          onTabChange={() => router.push('/')}
          onLogoClick={() => router.push('/')}
        />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </>
    );
  }

  if (!market) {
    return (
      <>
        <Navbar
          activeTab="market"
          onTabChange={() => router.push('/')}
          onLogoClick={() => router.push('/')}
        />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-4">Market Not Found</h1>
            <p className="text-zinc-400 mb-6">The market you're looking for doesn't exist.</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Back to Markets
            </button>
          </div>
        </main>
      </>
    );
  }

  const isPositive = market.change >= 0;

  return (
    <>
      <Navbar
        activeTab="market"
        onTabChange={(tab) => {
          if (tab === 'portfolio') {
            router.push('/?tab=portfolio');
          } else {
            router.push('/');
          }
        }}
        onLogoClick={() => router.push('/')}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-fade-in">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Markets</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge>{market.category}</Badge>
                  <div className="flex items-center gap-4">
                    {market.status === 'live' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Live Market
                      </span>
                    )}
                    <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isPositive ? '+' : ''}{market.change}% today
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{market.title}</h1>
                <p className="text-zinc-400 text-lg mb-6">{market.subtitle}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    Ends {market.endDate}
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Users className="w-4 h-4" />
                    {formatNumber(market.traders)} traders
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400">
                    <BarChart3 className="w-4 h-4" />
                    {market.volume} volume
                  </span>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">About this Market</h2>
                <p className="text-zinc-400 leading-relaxed mb-6">{market.description}</p>

                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full" />
                  Resolution Criteria
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{market.resolution}</p>
              </div>

              {/* Activity Feed */}
              <ActivityFeed activities={mockActivities} />
            </div>

            {/* Trading Panel */}
            <div className="lg:col-span-1">
              <TradingPanel market={market} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

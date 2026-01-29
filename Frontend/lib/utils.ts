import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Market, MarketFilter, OrderSummary, OutcomeType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterMarkets(markets: Market[], filter: MarketFilter): Market[] {
  if (filter === 'all') return markets;
  return markets.filter((m) => m.status === filter);
}

export function countMarketsByStatus(markets: Market[]) {
  return {
    live: markets.filter((m) => m.status === 'live').length,
    upcoming: markets.filter((m) => m.status === 'upcoming').length,
  };
}

export function calculateOrderSummary(
  amount: string,
  selectedOutcome: OutcomeType,
  market: Market
): OrderSummary {
  const price = selectedOutcome === 'yes' ? market.yesPrice : market.noPrice;
  const amountNum = parseFloat(amount) || 0;
  const shares = amountNum ? ((amountNum / price) * 100).toFixed(2) : '0.00';
  const potentialReturn = amountNum ? (parseFloat(shares) * 1).toFixed(2) : '0.00';

  return { shares, avgPrice: price, potentialReturn };
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

import { formatNumber } from '@/lib/utils';

interface FooterStatsProps {
  totalVolume: string;
  activeTraders: number;
  totalMarkets: number;
  zkPrivacy: string;
}

export function FooterStats({ totalVolume, activeTraders, totalMarkets, zkPrivacy }: FooterStatsProps) {
  const stats = [
    { label: 'Total Volume', value: totalVolume },
    { label: 'Active Traders', value: formatNumber(activeTraders) },
    { label: 'Markets', value: totalMarkets.toString() },
    { label: 'ZK Private', value: zkPrivacy },
  ];

  return (
    <div className="mt-16 pt-10 border-t border-zinc-800/60">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Activity } from '@/types';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <ActivityItem key={i} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const isYes = activity.type === 'yes';

  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/40 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs text-zinc-400 font-mono">
          {activity.user.slice(0, 4)}
        </div>
        <div>
          <span className="text-zinc-300 text-sm">
            {activity.action === 'bought' ? 'Bought' : 'Sold'}{' '}
            <span className={cn(isYes ? 'text-blue-400' : 'text-zinc-400')}>
              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </span>
          </span>
          <div className="text-xs text-zinc-500">{activity.time}</div>
        </div>
      </div>
      <span className="text-sm font-medium text-zinc-300">{activity.amount}</span>
    </div>
  );
}

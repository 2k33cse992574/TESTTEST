import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { type TimelineEvent } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  events: TimelineEvent[];
  maxItems?: number;
}

const iconMap = {
  info:    { Icon: Info, cls: 'text-blue-500 bg-blue-50' },
  success: { Icon: CheckCircle2, cls: 'text-emerald-500 bg-emerald-50' },
  warning: { Icon: AlertCircle, cls: 'text-amber-500 bg-amber-50' },
  danger:  { Icon: XCircle, cls: 'text-red-500 bg-red-50' },
};

export function ActivityTimeline({ events, maxItems = 8 }: Props) {
  const displayed = events.slice(0, maxItems);

  return (
    <div className="space-y-0">
      {displayed.map((evt, i) => {
        const { Icon, cls } = iconMap[evt.type];
        return (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="flex gap-3 relative"
          >
            {/* Connector line */}
            {i < displayed.length - 1 && (
              <div className="absolute left-[18px] top-8 bottom-0 w-px bg-border" />
            )}

            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cls}`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="pb-5 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-text-primary">{evt.actor}</span>
                  <span className="text-sm text-text-secondary ml-1.5">{evt.action}</span>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(evt.at), { addSuffix: true })}
                </span>
              </div>
              {evt.detail && (
                <p className="text-xs text-text-secondary mt-0.5">{evt.detail}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

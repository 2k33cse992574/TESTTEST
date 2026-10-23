import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type MetricCardData } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';

interface Props extends MetricCardData {
  index?: number;
  onClick?: () => void;
}

const colorAccents: Record<string, string> = {
  brand:   'bg-brand-soft text-brand',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger:  'bg-red-50 text-red-600',
  info:    'bg-blue-50 text-blue-600',
  neutral: 'bg-gray-100 text-gray-500',
};

const barColors: Record<string, string> = {
  brand:   'bg-brand',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  neutral: 'bg-gray-400',
};

export function MetricCard({
  label, value, delta, deltaType = 'neutral', sublabel, color = 'brand',
  clickable, index = 0, onClick,
}: Props) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
  const displayValue = typeof value === 'number' ? value : value;
  const animated = useCountUp(numericValue, 700);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`card ${clickable ? 'cursor-pointer card-hover group' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">{label}</p>
          <p className="text-[2rem] font-bold text-text-primary tabular-nums leading-none">
            {typeof value === 'number'
              ? animated.toLocaleString()
              : displayValue}
          </p>
          {sublabel && (
            <p className="text-xs text-text-muted mt-1.5">{sublabel}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-card flex items-center justify-center flex-shrink-0 ${colorAccents[color]}`}>
          <div className={`w-2 h-2 rounded-full ${barColors[color]}`} />
        </div>
      </div>

      {delta && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {deltaType === 'up'   && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
          {deltaType === 'down' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          {deltaType === 'neutral' && <Minus className="w-3.5 h-3.5 text-text-muted" />}
          <span className={
            deltaType === 'up'   ? 'text-emerald-600' :
            deltaType === 'down' ? 'text-red-600' : 'text-text-muted'
          }>{delta}</span>
        </div>
      )}

      {/* Bottom accent bar */}
      <div className="mt-4 progress-bar">
        <motion.div
          className={`progress-fill ${barColors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ duration: 0.8, delay: index * 0.06 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

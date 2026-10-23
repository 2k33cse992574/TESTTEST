import { motion } from 'framer-motion';
import { type TrustLevel } from '@/types';

interface Props {
  level: TrustLevel;
  showLabel?: boolean;
  compact?: boolean;
}

const levels = [
  { label: 'L0', name: 'Claimed',           color: 'bg-gray-300' },
  { label: 'L1', name: 'Format-Valid',       color: 'bg-gray-400' },
  { label: 'L2', name: 'Identity-Verified',  color: 'bg-blue-500' },
  { label: 'L3', name: 'Cross-Checked',      color: 'bg-emerald-500' },
  { label: 'L4', name: 'AICTE-Certified',    color: 'bg-brand' },
];

export function TrustLadder({ level, showLabel = true, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {levels.map((l, i) => (
          <div
            key={i}
            title={`${l.label}: ${l.name}`}
            className={`rounded-full transition-all ${i <= level ? l.color : 'bg-border'} ${
              compact ? 'w-2 h-2' : 'w-3 h-3'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {levels.map((l, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            style={{ transformOrigin: 'left' }}
            className={`h-2 flex-1 rounded-full ${i <= level ? l.color : 'bg-border'}`}
          />
        ))}
      </div>
      {showLabel && (
        <p className="text-xs text-text-secondary">
          <span className="font-semibold">{levels[level].label}</span> — {levels[level].name}
        </p>
      )}
    </div>
  );
}

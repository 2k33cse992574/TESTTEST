import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface RailItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
}

interface Props {
  items: RailItem[];
}

export function IconRail({ items }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <aside className="w-16 bg-surface border-r border-border flex flex-col items-center py-4 gap-1 flex-shrink-0">
      {items.map(item => {
        const Icon = item.icon;
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        const hovered = hoveredPath === item.path;

        return (
          <div key={item.path} className="relative group w-full px-2">
            <button
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              className={`relative w-full flex items-center justify-center h-10 rounded-control transition-all duration-fast
                ${active
                  ? 'bg-brand-soft text-brand'
                  : 'text-text-muted hover:bg-canvas hover:text-text-secondary'}`}
              aria-label={item.label}
            >
              {active && (
                <motion.div
                  layoutId="rail-active"
                  className="absolute inset-0 bg-brand-soft rounded-control"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center z-20">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </button>

            {/* Tooltip */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-text-primary text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-dropdown"
                >
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </aside>
  );
}

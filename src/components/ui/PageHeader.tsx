import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: string[];
  demo?: boolean;
}

export function PageHeader({ title, subtitle, actions, breadcrumb, demo = true }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mb-6"
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-text-secondary font-medium' : ''}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}

      {demo && (
        <div className="demo-banner mb-4 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          Demo data — simulated APAAR integration. Not a live government system.
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockTimeline, mockDocuments } from '@/data/mockData';
import { CheckCircle2, Clock, FileCheck, QrCode, ShieldCheck, AlertCircle } from 'lucide-react';

const metrics = [
  { label: 'Enrolment Status',    value: 'Enrolled',  sublabel: 'AY 2026-27 · B.Tech CSE', color: 'success' as const, index: 0 },
  { label: 'Trust Level',         value: 'L3',        sublabel: 'Cross-Checked · 3 of 4 verified', color: 'brand' as const, index: 1 },
  { label: 'Open Requests',       value: 0,           sublabel: 'No pending action required', color: 'neutral' as const, index: 2 },
  { label: 'Documents Verified',  value: 4,           sublabel: '1 pending · 1 uploaded', color: 'info' as const, index: 3 },
];

export default function StudentOverview() {
  const verifiedDocs = mockDocuments.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs  = mockDocuments.filter(d => d.status !== 'VERIFIED').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="My Academic Overview"
        subtitle="Your enrolment status, trust level, and documents at a glance."
        breadcrumb={['Student Portal', 'Overview']}
      />

      {/* Metric row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity & Enrolment card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card lg:col-span-2 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Enrolment Record</h2>
            <StatusBadge type="enrolment" value="ENROLLED" />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {[
              ['Student Reference', 'STU-***-4821'],
              ['APAAR ID',          '1234-****-****'],
              ['Institution',       'SIET Mumbai'],
              ['Programme',         'B.Tech CSE'],
              ['Academic Year',     '2026-27'],
              ['Pool',              'REGULAR'],
              ['Admission Date',    '1 Aug 2026'],
              ['Mode',              'Full-Time'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-medium text-text-primary">{val}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Trust Level</p>
            <TrustLadder level={3} showLabel />
            <p className="text-xs text-text-muted mt-2">
              Your record is verified against APAAR and has passed all seat and identity checks.
              Reach L4 by completing annual institution affirmation.
            </p>
          </div>
        </motion.div>

        {/* Quick status card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="card space-y-4"
        >
          <h2 className="text-sm font-semibold text-text-primary">Status Checklist</h2>
          {[
            { icon: CheckCircle2,  color: 'text-emerald-500', label: 'APAAR ID verified',       done: true  },
            { icon: CheckCircle2,  color: 'text-emerald-500', label: 'Seat claim successful',   done: true  },
            { icon: CheckCircle2,  color: 'text-emerald-500', label: 'Identity cross-checked',  done: true  },
            { icon: Clock,         color: 'text-amber-500',   label: 'Category cert pending',   done: false },
            { icon: AlertCircle,   color: 'text-blue-400',    label: 'L4 certification (annual)',done: false },
          ].map(({ icon: Icon, color, label, done }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className={`w-4 h-4 flex-shrink-0 ${done ? color : 'text-text-muted'}`} />
              <span className={done ? 'text-text-primary' : 'text-text-secondary'}>{label}</span>
            </div>
          ))}

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-text-muted mb-3">Documents ({verifiedDocs}/{mockDocuments.length} verified)</p>
            <div className="progress-bar">
              <motion.div
                className="progress-fill bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(verifiedDocs / mockDocuments.length) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </div>

          <button className="btn btn-secondary w-full text-xs mt-1">
            <QrCode className="w-3.5 h-3.5" />
            View Verifiable Credential
          </button>
        </motion.div>
      </div>

      {/* Verification QR panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-card bg-brand-soft flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-text-primary mb-1">Verifiable Credential (Demo)</h2>
            <p className="text-xs text-text-secondary">
              Your enrolment credential is available for employer verification via the Pramaan Consent Handshake.
              When an employer scans their request QR, you approve sharing — they receive only the fields you consent to.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button className="btn btn-primary btn-sm">
                <QrCode className="w-3.5 h-3.5" /> Generate Wallet QR
              </button>
              <button className="btn btn-secondary btn-sm">
                <FileCheck className="w-3.5 h-3.5" /> View Access Log
              </button>
            </div>
          </div>
          <div className="hidden sm:flex w-16 h-16 bg-canvas border border-border rounded-card items-center justify-center flex-shrink-0">
            <QrCode className="w-8 h-8 text-text-muted" />
          </div>
        </div>
      </motion.div>

      {/* Activity timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-5">Record Timeline</h2>
        <ActivityTimeline events={mockTimeline} maxItems={7} />
      </motion.div>
    </div>
  );
}

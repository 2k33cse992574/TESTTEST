import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Shield, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { useState } from 'react';

const fields = [
  { section: 'Personal Identity',
    note: 'Sensitive values are masked. Contact your institution to correct any errors.',
    rows: [
      { label: 'Full Name',         value: 'Arjun Sharma',        masked: false },
      { label: 'Date of Birth',     value: '**/**/2004',          masked: true },
      { label: 'APAAR ID',          value: '1234-****-****',      masked: true },
      { label: 'Gender',            value: 'Male',                masked: false },
      { label: 'Nationality',       value: 'Indian',              masked: false },
      { label: 'Category',          value: 'General',             masked: false },
    ]
  },
  { section: 'Enrolment Details',
    note: "These values are drawn from your institution's submission. Discrepancies should be reported.",
    rows: [
      { label: 'Institution',       value: 'Shri Institute of Engineering & Technology, Mumbai', masked: false },
      { label: 'AICTE Inst. Code',  value: 'INST-MH-0042',        masked: false },
      { label: 'Programme',         value: 'B.Tech Computer Science & Engineering',              masked: false },
      { label: 'Academic Year',     value: '2026-27',             masked: false },
      { label: 'Mode',              value: 'Full-Time',           masked: false },
      { label: 'Seat Pool',         value: 'REGULAR (Slot 47)',   masked: false },
      { label: 'Admission Route',   value: 'JEE Main 2026',       masked: false },
      { label: 'Admission Date',    value: '1 August 2026',       masked: false },
    ]
  },
];

export default function StudentDetails() {
  const [revealAll, setRevealAll] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="My Details"
        subtitle="Your personal and enrolment information as recorded in the AICTE repository."
        breadcrumb={['Student Portal', 'My Details']}
        actions={
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setRevealAll(r => !r)}
          >
            {revealAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {revealAll ? 'Hide sensitive' : 'Reveal masked'}
          </button>
        }
      />

      {/* Trust panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-5"
      >
        <div className="w-10 h-10 rounded-card bg-brand-soft flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-semibold text-text-primary">Trust Level</p>
            <StatusBadge type="trust" value="3" />
          </div>
          <TrustLadder level={3} showLabel />
        </div>
      </motion.div>

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800"
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Your data is stored with purpose-limitation and minimisation controls under the DPDP Act framework.
          Sensitive fields are masked by default. Your APAAR ID is never exposed to verifiers directly —
          only a consent-gated minimal result is shared.
        </p>
      </motion.div>

      {fields.map((section, si) => (
        <motion.div
          key={section.section}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + si * 0.08 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-text-primary">{section.section}</h2>
            <Lock className="w-3.5 h-3.5 text-text-muted" />
          </div>
          <p className="text-xs text-text-muted mb-5">{section.note}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {section.rows.map(row => (
              <div key={row.label}>
                <p className="label">{row.label}</p>
                <p className="text-sm font-medium text-text-primary">
                  {row.masked && !revealAll ? row.value : row.value.replace(/\*/g, '•')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Correction notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card border-amber-200 bg-amber-50/30"
      >
        <h3 className="text-sm font-semibold text-text-primary mb-2">Need to correct a detail?</h3>
        <p className="text-xs text-text-secondary mb-4">
          If any information is incorrect, raise a correction request. Your institution or an AICTE officer
          will review it. You cannot modify records directly — all changes are logged and audited.
        </p>
        <button className="btn btn-secondary btn-sm">
          Raise a Correction Request
        </button>
      </motion.div>
    </div>
  );
}

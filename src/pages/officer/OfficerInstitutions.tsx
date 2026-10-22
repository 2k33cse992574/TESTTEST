import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { mockInstitutions } from '@/data/mockData';
import type { Institution } from '@/types';
import { X, Building2, MapPin, Users, ShieldCheck, AlertTriangle } from 'lucide-react';

const columns: Column<Institution>[] = [
  {
    key: 'name', header: 'Institution', sortable: true,
    render: r => (
      <div>
        <p className="text-sm font-semibold text-text-primary">{r.name}</p>
        <p className="text-xs text-text-muted">{r.id}</p>
      </div>
    ),
  },
  { key: 'state',    header: 'State',   sortable: true, render: r => <span className="text-sm">{r.state}</span> },
  { key: 'type',     header: 'Type',    sortable: true, render: r => <span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{r.type}</span> },
  {
    key: 'enrolledCount', header: 'Enrolment', sortable: true,
    render: r => (
      <div>
        <span className="tabular-nums font-semibold text-sm">{r.enrolledCount}</span>
        <span className="text-text-muted text-xs">/{r.approvedIntake}</span>
      </div>
    ),
  },
  {
    key: 'verifiedCount', header: 'Verified', sortable: true,
    render: r => {
      const pct = Math.round((r.verifiedCount / r.enrolledCount) * 100);
      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-sm font-medium">{pct}%</span>
          <div className="w-16 progress-bar">
            <div className="progress-fill bg-brand" style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    },
  },
  { key: 'openCases', header: 'Open Cases', sortable: true,
    render: r => r.openCases > 0
      ? <span className="badge badge-danger">{r.openCases}</span>
      : <span className="text-text-muted text-xs">—</span>,
  },
  {
    key: 'integrityBand', header: 'Integrity', sortable: true,
    render: r => (
      <div className="flex items-center gap-2">
        <StatusBadge type="integrity" value={r.integrityBand} size="sm" />
        <span className="text-xs text-text-muted tabular-nums">{r.integrityScore}</span>
      </div>
    ),
  },
  { key: 'lastSubmission', header: 'Last Sub.', sortable: true,
    render: r => <span className="text-xs text-text-muted">{r.lastSubmission}</span>,
  },
];

export default function OfficerInstitutions() {
  const [selected, setSelected] = useState<Institution | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Institutions"
        subtitle="Monitor all AICTE-approved institutions, their enrolment status, and integrity scores."
        breadcrumb={['AICTE Officer Portal', 'Institutions']}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Institutions', value: mockInstitutions.length, color: 'text-text-primary' },
          { label: 'Band A (Excellent)',  value: mockInstitutions.filter(i => i.integrityBand === 'A').length, color: 'text-emerald-600' },
          { label: 'Band C–E (Attention)',value: mockInstitutions.filter(i => ['C','D','E'].includes(i.integrityBand)).length, color: 'text-amber-600' },
          { label: 'With Open Cases',     value: mockInstitutions.filter(i => i.openCases > 0).length, color: 'text-danger' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <DataTable<Institution>
          columns={columns}
          data={mockInstitutions}
          keyField="id"
          searchPlaceholder="Search by name, state, type…"
          onRowClick={row => setSelected(row)}
          pageSize={8}
        />
      </div>

      {/* Institution detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{selected.id}</p>
                    <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge type="integrity" value={selected.integrityBand} />
                  <span className="badge badge-neutral">{selected.status}</span>
                  <span className="badge badge-info">{selected.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['State',    selected.state],
                    ['District', selected.district],
                    ['Region',   selected.region],
                    ['Last Sub', selected.lastSubmission],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="font-medium text-text-primary">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Enrolment breakdown */}
                <div>
                  <p className="label mb-3">Enrolment Status</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Approved', value: selected.approvedIntake, color: 'text-text-primary' },
                      { label: 'Enrolled', value: selected.enrolledCount,  color: 'text-brand' },
                      { label: 'Verified', value: selected.verifiedCount,  color: 'text-emerald-600' },
                    ].map(s => (
                      <div key={s.label} className="p-3 bg-canvas rounded-card">
                        <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-muted">Verified rate</span>
                        <span className="font-semibold">{Math.round(selected.verifiedCount / selected.enrolledCount * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-emerald-500" style={{ width: `${(selected.verifiedCount / selected.enrolledCount) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-muted">Intake utilisation</span>
                        <span className={`font-semibold ${selected.enrolledCount > selected.approvedIntake ? 'text-danger' : ''}`}>
                          {Math.round(selected.enrolledCount / selected.approvedIntake * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${selected.enrolledCount > selected.approvedIntake ? 'bg-danger' : 'bg-brand'}`}
                          style={{ width: `${Math.min((selected.enrolledCount / selected.approvedIntake) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrity score */}
                <div>
                  <p className="label mb-2">Integrity Index</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-text-primary tabular-nums">{selected.integrityScore}</span>
                    <div>
                      <StatusBadge type="integrity" value={selected.integrityBand} />
                      <p className="text-xs text-text-muted mt-1">Cohort-relative score · Confidence: Medium</p>
                    </div>
                  </div>
                  <TrustLadder level={selected.integrityScore > 80 ? 3 : selected.integrityScore > 60 ? 2 : 1} showLabel />
                </div>

                {/* Open cases */}
                {selected.openCases > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-card flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">{selected.openCases} open case{selected.openCases > 1 ? 's' : ''}</span>
                      {' '}requiring officer attention.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <button className="btn btn-primary w-full">View Integrity Queue for Institution</button>
                  <button className="btn btn-secondary w-full">
                    <Users className="w-3.5 h-3.5" /> View Student Records
                  </button>
                  <button className="btn btn-secondary w-full">
                    <MapPin className="w-3.5 h-3.5" /> View on Map
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockCases, mockTimeline } from '@/data/mockData';
import type { Case } from '@/types';
import { X, FileText, Clock, AlertTriangle } from 'lucide-react';

const instCases = mockCases.filter(c => c.institutionId === 'INST-MH-0042');

const columns: Column<Case>[] = [
  { key: 'id',         header: 'Case ID',   render: r => <span className="font-mono text-xs text-brand">{r.id}</span> },
  { key: 'caseType',   header: 'Type',      sortable: true, render: r => <span className="text-xs font-medium">{r.caseType.replace(/_/g,' ')}</span> },
  { key: 'severity',   header: 'Severity',  sortable: true, render: r => <StatusBadge type="severity" value={r.severity} size="sm" /> },
  { key: 'status',     header: 'Status',    sortable: true, render: r => <StatusBadge type="case" value={r.status} size="sm" /> },
  { key: 'openedAt',   header: 'Opened',    sortable: true, render: r => <span className="text-xs text-text-muted">{r.openedAt.slice(0,10)}</span> },
  { key: 'slaDueAt',   header: 'SLA Due',   sortable: true, render: r => {
      const overdue = new Date(r.slaDueAt) < new Date() && r.status !== 'Resolved' && r.status !== 'Closed';
      return <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-text-secondary'}`}>{r.slaDueAt}</span>;
  }},
  { key: 'description', header: 'Summary',  render: r => <span className="text-xs text-text-secondary line-clamp-2 max-w-xs">{r.description}</span> },
];

export default function InstitutionCases() {
  const [selected, setSelected] = useState<Case | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Cases"
        subtitle="Review and respond to integrity cases raised against your institution."
        breadcrumb={['Institution Portal', 'Cases']}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: instCases.length,                                          color: 'text-text-primary' },
          { label: 'Open',        value: instCases.filter(c => c.status === 'Open').length,         color: 'text-blue-600' },
          { label: 'Awaiting You',value: instCases.filter(c => c.status === 'AwaitingInstitution').length, color: 'text-amber-600' },
          { label: 'Resolved',    value: instCases.filter(c => c.status === 'Resolved').length,     color: 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <DataTable<Case>
          columns={columns}
          data={instCases}
          keyField="id"
          searchPlaceholder="Search cases…"
          onRowClick={row => setSelected(row)}
          pageSize={8}
        />
      </div>

      {/* Case detail drawer */}
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
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-xs text-text-muted font-mono">{selected.id}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{selected.caseType.replace(/_/g,' ')}</p>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge type="case" value={selected.status} />
                  <StatusBadge type="severity" value={selected.severity} />
                </div>

                {/* Description */}
                <div>
                  <p className="label mb-1">What was flagged</p>
                  <p className="text-sm text-text-secondary">{selected.description}</p>
                </div>

                {/* Reason codes */}
                <div>
                  <p className="label mb-2">Reason Codes</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.reasonCodes.map(rc => (
                      <span key={rc} className="px-2.5 py-1 bg-canvas border border-border rounded-control text-xs font-mono text-text-primary">
                        {rc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SLA */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-card">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">SLA due:</span> {selected.slaDueAt} · Opened: {selected.openedAt.slice(0,10)}
                  </p>
                </div>

                {/* Important notice */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-card">
                  <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Only an authorised AICTE officer can record the final outcome. Your institution can respond,
                    provide clarification, or appeal the case. All responses are audited.
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <p className="label mb-3">Case Timeline</p>
                  <ActivityTimeline events={mockTimeline.slice(0, 4)} />
                </div>

                {/* Actions */}
                {(selected.status === 'AwaitingInstitution' || selected.status === 'Open') && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <button className="btn btn-primary w-full">Submit Response</button>
                    <button className="btn btn-secondary w-full">Upload Evidence</button>
                    <button className="btn btn-ghost w-full">
                      <FileText className="w-3.5 h-3.5" /> Download Evidence Pack
                    </button>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

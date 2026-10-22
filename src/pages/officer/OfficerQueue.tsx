import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockCases, mockTimeline } from '@/data/mockData';
import type { Case } from '@/types';
import {
  AlertTriangle, Clock, X, CheckCircle2, MessageSquare,
  FileText, ChevronRight, Shield, Filter,
} from 'lucide-react';

const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const sortedCases = [...mockCases].sort(
  (a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
);

const severityBorder: Record<string, string> = {
  CRITICAL: 'border-l-red-600 bg-red-50/20',
  HIGH:     'border-l-danger bg-red-50/10',
  MEDIUM:   'border-l-amber-400 bg-amber-50/10',
  LOW:      'border-l-blue-300 bg-blue-50/5',
};

const caseTypeLabel: Record<string, string> = {
  INTAKE_BREACH:         'Intake Breach',
  DUP_ENROLMENT:         'Duplicate Enrolment',
  POSSIBLE_SAME_PERSON:  'Possible Same Person',
  INVALID_ID:            'Invalid / Missing ID',
  DATA_MISMATCH:         'Data Mismatch',
  DECLARATION_MISMATCH:  'Declaration Mismatch',
  ANOMALY:               'Anomaly',
  STALE_ACTIVE:          'Stale Active',
};

export default function OfficerQueue() {
  const [selected, setSelected] = useState<Case | null>(null);
  const [filter, setFilter]     = useState<string>('all');
  const [decision, setDecision] = useState('');
  const [rationale, setRationale] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const filtered = sortedCases.filter(c => {
    if (filter === 'open')     return !['Resolved','Closed'].includes(c.status);
    if (filter === 'critical') return ['CRITICAL','HIGH'].includes(c.severity);
    if (filter === 'awaiting') return c.status === 'AwaitingInstitution';
    return true;
  });

  const handleSubmitDecision = () => {
    if (!rationale.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Integrity Queue"
        subtitle="Prioritised cases for officer review. Each case carries an explainable evidence pack."
        breadcrumb={['AICTE Officer Portal', 'Integrity Queue']}
        actions={
          <button className="btn btn-secondary btn-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-canvas rounded-card w-fit border border-border">
        {[
          { key: 'all',      label: 'All',          count: mockCases.length },
          { key: 'open',     label: 'Open',         count: mockCases.filter(c => !['Resolved','Closed'].includes(c.status)).length },
          { key: 'critical', label: 'High / Critical', count: mockCases.filter(c => ['HIGH','CRITICAL'].includes(c.severity)).length },
          { key: 'awaiting', label: 'Awaiting Institution', count: mockCases.filter(c => c.status === 'AwaitingInstitution').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors
              ${filter === tab.key ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              filter === tab.key ? 'bg-brand-soft text-brand' : 'bg-border text-text-muted'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Case list */}
      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`card border-l-4 cursor-pointer hover:shadow-card-hover transition-all duration-standard
              ${severityBorder[c.severity] ?? ''} ${['Resolved','Closed'].includes(c.status) ? 'opacity-60' : ''}`}
            onClick={() => { setSelected(c); setSubmitted(false); setDecision(''); setRationale(''); }}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                c.severity === 'CRITICAL' || c.severity === 'HIGH' ? 'text-danger' :
                c.severity === 'MEDIUM' ? 'text-amber-500' : 'text-blue-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs text-brand font-semibold">{c.id}</span>
                  <span className="text-xs font-semibold text-text-primary">{caseTypeLabel[c.caseType] ?? c.caseType}</span>
                  <StatusBadge type="severity" value={c.severity} size="sm" />
                  <StatusBadge type="case" value={c.status} size="sm" />
                </div>
                <p className="text-xs text-text-secondary mb-1.5 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />{c.institutionName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />Due {c.slaDueAt}
                  </span>
                  {c.assignedTo && (
                    <span className="text-brand font-medium">→ {c.assignedTo}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-wrap gap-1.5 max-w-[180px] justify-end">
                  {c.reasonCodes.slice(0, 2).map(rc => (
                    <span key={rc} className="text-xs px-1.5 py-0.5 bg-canvas border border-border rounded font-mono text-text-muted">
                      {rc}
                    </span>
                  ))}
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Case detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-xs font-mono text-text-muted">{selected.id}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{caseTypeLabel[selected.caseType] ?? selected.caseType}</p>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge type="case"     value={selected.status} />
                  <StatusBadge type="severity" value={selected.severity} />
                </div>

                {/* Institution */}
                <div className="p-3 bg-canvas rounded-card border border-border text-sm">
                  <p className="text-xs text-text-muted mb-0.5">Institution</p>
                  <p className="font-semibold text-text-primary">{selected.institutionName}</p>
                  <p className="text-xs text-text-muted">{selected.institutionId}</p>
                </div>

                {/* What was flagged */}
                <div>
                  <p className="label mb-1">Why this was flagged</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{selected.description}</p>
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Opened',      selected.openedAt.slice(0,10)],
                    ['SLA Due',     selected.slaDueAt],
                    ['Assigned to', selected.assignedTo ?? 'Unassigned'],
                    ['Subject',     selected.subjectType + ' · ' + selected.subjectId],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="text-sm text-text-primary font-medium">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <p className="label mb-3">Evidence Timeline</p>
                  <ActivityTimeline events={mockTimeline.slice(0, 4)} />
                </div>

                {/* Evidence pack */}
                <div className="p-3 bg-canvas border border-border rounded-card flex items-center gap-3">
                  <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <div className="flex-1 text-xs text-text-secondary">
                    Signed evidence pack available — arithmetic, linked records, rule version, hashes.
                  </div>
                  <button className="btn btn-secondary btn-sm">Download</button>
                </div>

                {/* Officer decision */}
                {!['Resolved','Closed'].includes(selected.status) && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="label">Record Decision</p>
                    <p className="text-xs text-text-muted">
                      Only authorised AICTE officers may record outcomes. Decisions are permanent, audited, and cannot be reversed without a formal appeal.
                    </p>

                    {!submitted ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          {['Resolved — no issue', 'Resolved — action taken', 'Escalate'].map(d => (
                            <button
                              key={d}
                              onClick={() => setDecision(d)}
                              className={`p-2 rounded-card border text-xs font-medium transition-colors text-center
                                ${decision === d ? 'border-brand bg-brand-soft text-brand' : 'border-border hover:border-brand hover:bg-brand-soft/30'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="label">Rationale (required)</label>
                          <textarea
                            className="input h-20 resize-none text-xs"
                            placeholder="Describe what was reviewed, what evidence was considered, and why this decision was made…"
                            value={rationale}
                            onChange={e => setRationale(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="btn btn-primary flex-1"
                            disabled={!decision || !rationale.trim()}
                            onClick={handleSubmitDecision}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Record Decision
                          </button>
                          <button className="btn btn-secondary">
                            <MessageSquare className="w-3.5 h-3.5" /> Request Clarification
                          </button>
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">Decision recorded</p>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            "{decision}" — audit event written, receipt signed, case updated.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {['Resolved','Closed'].includes(selected.status) && selected.outcome && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card">
                    <p className="text-xs font-semibold text-emerald-800 mb-1">Outcome recorded</p>
                    <p className="text-xs text-emerald-700">{selected.outcome}</p>
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

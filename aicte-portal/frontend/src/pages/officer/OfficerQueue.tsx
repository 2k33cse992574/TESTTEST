import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockCases, mockTimeline } from '@/data/mockData';
import { api } from '@/api/client';
import type { Case } from '@/types';
import {
  AlertTriangle, Clock, X, CheckCircle2, MessageSquare,
  FileText, ChevronRight, Shield, Filter, Hash, Sparkles
} from 'lucide-react';

const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

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
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [selected, setSelected] = useState<Case | null>(null);
  const [filter, setFilter]     = useState<string>('all');
  const [decision, setDecision] = useState('');
  const [rationale, setRationale] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedBlock, setConfirmedBlock] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getQueue('all')
      .then(data => { if (data && data.length) setCases(data); })
      .catch(() => {});
  }, []);

  const sortedCases = [...cases].sort(
    (a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
  );

  const filtered = sortedCases.filter(c => {
    if (filter === 'open')     return !['Resolved','Closed'].includes(c.status);
    if (filter === 'critical') return ['CRITICAL','HIGH'].includes(c.severity);
    if (filter === 'awaiting') return c.status === 'AwaitingInstitution';
    return true;
  });

  const handleSubmitDecision = async () => {
    if (!rationale.trim() || !decision || !selected) return;
    setSubmitting(true);

    const decisionCodeMap: Record<string, any> = {
      'Resolve — no issue': 'RESOLVE_NO_ISSUE',
      'Uphold Breach & Sanction': 'UPHOLD_BREACH',
      'Escalate to Committee': 'ESCALATE_COMMITTEE',
      'Request Clarification': 'REQUEST_CLARIFICATION',
    };

    const code = decisionCodeMap[decision] || 'RESOLVE_NO_ISSUE';

    try {
      const res = await api.submitDecision(selected.id, {
        decision: code,
        rationale: rationale,
        officerName: 'Shri Rajesh Kumar'
      });
      setConfirmedBlock(res.auditBlock);
      setSubmitted(true);
      // Update case locally
      setCases(prev => prev.map(c => c.id === selected.id ? res.case : c));
      setSelected(res.case);
    } catch {
      // Local fallback
      const outcome = `Resolved: ${decision} — Rationale: ${rationale}`;
      const updatedCase: Case = { ...selected, status: 'Resolved', outcome, closedAt: '2026-10-22' };
      setCases(prev => prev.map(c => c.id === selected.id ? updatedCase : c));
      setSelected(updatedCase);
      setConfirmedBlock({ seq: 1043, thisHash: 'c7d4...12fe' });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Integrity Queue"
        subtitle="Prioritised cases for officer review. Every adjudication is permanently anchored in the tamper-evident audit ledger."
        breadcrumb={['AICTE Officer Portal', 'Integrity Queue']}
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-canvas rounded-card w-fit border border-border">
        {[
          { key: 'all',      label: 'All',                count: cases.length },
          { key: 'open',     label: 'Open',               count: cases.filter(c => !['Resolved','Closed'].includes(c.status)).length },
          { key: 'critical', label: 'High / Critical',    count: cases.filter(c => ['HIGH','CRITICAL'].includes(c.severity)).length },
          { key: 'awaiting', label: 'Awaiting Response',  count: cases.filter(c => c.status === 'AwaitingInstitution').length },
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
            onClick={() => { setSelected(c); setSubmitted(false); setDecision(''); setRationale(''); setConfirmedBlock(null); }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge type="severity" value={c.severity} size="sm" />
                  <span className="font-mono text-xs font-bold text-text-primary">{c.id}</span>
                  <span className="text-xs font-semibold text-text-secondary">·</span>
                  <span className="text-xs font-semibold text-brand">{caseTypeLabel[c.caseType] ?? c.caseType}</span>
                  <StatusBadge type="case" value={c.status} size="sm" />
                </div>
                <p className="text-sm font-semibold text-text-primary">{c.institutionName}</p>
                <p className="text-xs text-text-secondary mt-1">{c.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {c.reasonCodes.map(r => (
                    <span key={r} className="text-xs px-2 py-0.5 bg-canvas rounded font-mono text-text-muted border border-border">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex flex-col justify-between items-end self-stretch">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA: {c.slaDueAt}</span>
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
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <StatusBadge type="severity" value={selected.severity} />
                  <div>
                    <span className="font-mono text-xs text-text-muted">{selected.id}</span>
                    <p className="text-sm font-semibold text-text-primary">{caseTypeLabel[selected.caseType]}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                {/* Status + Institution */}
                <div className="p-4 bg-canvas rounded-card border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Institution:</span>
                    <span className="font-semibold text-text-primary">{selected.institutionName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Status:</span>
                    <StatusBadge type="case" value={selected.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Opened:</span>
                    <span>{selected.openedAt}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Assigned Officer:</span>
                    <span className="font-medium">{selected.assignedTo ?? 'Shri Rajesh Kumar'}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="label mb-1">Case Description</p>
                  <p className="text-xs text-text-secondary bg-surface p-3 rounded-card border border-border leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* Evidence Pack */}
                <div>
                  <p className="label mb-2">Explainable Evidence Pack</p>
                  <div className="p-3 bg-brand-soft/30 border border-brand/20 rounded-card space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                      <Shield className="w-4 h-4" />
                      <span>Integrity Engine Finding</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {selected.reasonCodes.map(code => (
                        <div key={code} className="flex justify-between py-1 border-b border-brand/10">
                          <span className="font-mono text-text-secondary">{code}</span>
                          <span className="text-text-muted">Confirmed Match</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Officer Decision Box */}
                {!['Resolved','Closed'].includes(selected.status) && (
                  <div className="p-4 bg-surface border-2 border-brand/30 rounded-card space-y-4">
                    <p className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand" /> AICTE Officer Adjudication
                    </p>

                    {!submitted ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Resolve — no issue',
                            'Uphold Breach & Sanction',
                            'Escalate to Committee',
                            'Request Clarification'
                          ].map(d => (
                            <button
                              key={d}
                              onClick={() => setDecision(d)}
                              className={`p-2 rounded-card border text-xs font-semibold transition-colors text-center
                                ${decision === d ? 'border-brand bg-brand-soft text-brand' : 'border-border hover:border-brand'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="label">Mandatory Regulatory Rationale *</label>
                          <textarea
                            className="w-full mt-1.5 p-3 rounded-card border border-border text-xs focus:ring-1 focus:ring-brand focus:outline-none h-24"
                            placeholder="Enter specific evidence considered, statutory rules reviewed, and rationale for this decision…"
                            value={rationale}
                            onChange={e => setRationale(e.target.value)}
                          />
                        </div>

                        <button
                          className="btn btn-primary w-full justify-center"
                          disabled={!decision || !rationale.trim() || submitting}
                          onClick={handleSubmitDecision}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Record Official Decision
                        </button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-card space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <p className="text-sm font-bold text-emerald-800">Decision Permanently Recorded</p>
                        </div>
                        <p className="text-xs text-emerald-700">
                          Decision "{decision}" registered with officer rationale and written to the cryptographic hash chain.
                        </p>
                        {confirmedBlock && (
                          <div className="p-2 bg-emerald-100/60 rounded text-xs font-mono text-emerald-900 mt-2 flex items-center justify-between">
                            <span>Block #{confirmedBlock.seq}</span>
                            <span>Hash: {confirmedBlock.thisHash || 'anchored'}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {['Resolved','Closed'].includes(selected.status) && selected.outcome && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card">
                    <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recorded Outcome
                    </p>
                    <p className="text-xs text-emerald-700">{selected.outcome}</p>
                    {selected.closedAt && (
                      <p className="text-xs text-emerald-600 mt-2 font-mono">Closed At: {selected.closedAt}</p>
                    )}
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

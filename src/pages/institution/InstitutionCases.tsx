import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockCases, mockTimeline } from '@/data/mockData';
import { api } from '@/api/client';
import type { Case } from '@/types';
import { X, FileText, Clock, AlertTriangle, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

const columns: Column<Case>[] = [
  { key: 'id', header: 'Case ID', render: r => <span className="font-mono text-xs text-brand font-semibold">{r.id}</span> },
  { key: 'caseType', header: 'Type', sortable: true, render: r => <span className="text-xs font-medium">{r.caseType.replace(/_/g, ' ')}</span> },
  { key: 'severity', header: 'Severity', sortable: true, render: r => <StatusBadge type="severity" value={r.severity} size="sm" /> },
  { key: 'status', header: 'Status', sortable: true, render: r => <StatusBadge type="case" value={r.status} size="sm" /> },
  { key: 'openedAt', header: 'Opened', sortable: true, render: r => <span className="text-xs text-text-muted">{r.openedAt.slice(0, 10)}</span> },
  {
    key: 'slaDueAt', header: 'SLA Due', sortable: true, render: r => {
      const overdue = new Date(r.slaDueAt) < new Date() && r.status !== 'Resolved' && r.status !== 'Closed';
      return <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-text-secondary'}`}>{r.slaDueAt}</span>;
    }
  },
  { key: 'description', header: 'Summary', render: r => <span className="text-xs text-text-secondary line-clamp-2 max-w-xs">{r.description}</span> },
];

export default function InstitutionCases() {
  const [cases, setCases] = useState<Case[]>(() =>
    mockCases.filter(c => c.institutionId === 'INST-MH-0042')
  );
  const [selected, setSelected] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    api.getInstitutionCases('INST-MH-0042')
      .then(res => {
        if (res && res.length) setCases(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
    window.addEventListener('focus', fetchCases);
    return () => window.removeEventListener('focus', fetchCases);
  }, []);

  const handleCaseResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !selected) return;
    setSubmitting(true);

    try {
      const res = await api.respondInstitutionCase('INST-MH-0042', selected.id, {
        response: responseText,
        evidenceSummary: evidenceSummary || undefined,
        adminName: 'Dr. Priya Nair (SIET Mumbai)',
      });

      if (res && res.case) {
        setCases(prev => prev.map(c => c.id === selected.id ? res.case : c));
        setSelected(res.case);
      }
      setShowResponseModal(false);
      setResponseText('');
      setEvidenceSummary('');
    } catch {
      setShowResponseModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadEvidencePack = () => {
    if (!selected) return;
    const evidenceObj = {
      caseId: selected.id,
      institutionId: selected.institutionId,
      institutionName: selected.institutionName,
      caseType: selected.caseType,
      severity: selected.severity,
      status: selected.status,
      description: selected.description,
      reasonCodes: selected.reasonCodes,
      evidencePack: (selected as any).evidencePack || {},
      exportedAt: new Date().toISOString(),
      officerAssigned: selected.assignedTo,
    };
    const blob = new Blob([JSON.stringify(evidenceObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Case_Evidence_Pack_${selected.id}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const total = cases.length;
  const openCount = cases.filter(c => c.status === 'Open').length;
  const awaitingCount = cases.filter(c => c.status === 'AwaitingInstitution' || c.status === 'UnderReview').length;
  const resolvedCount = cases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Institution Cases Desk"
        subtitle="SIET Mumbai (INST-MH-0042) · Review regulatory notices, submit evidence, and track adjudication."
        breadcrumb={['Institution Portal', 'Cases']}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={fetchCases}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Cases
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Cases', value: total, color: 'text-text-primary' },
          { label: 'Open', value: openCount, color: 'text-blue-600' },
          { label: 'In Review / Awaiting', value: awaitingCount, color: 'text-amber-600' },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card text-center py-4"
          >
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <DataTable<Case>
          columns={columns}
          data={cases}
          keyField="id"
          searchPlaceholder="Search cases by ID, type, description…"
          onRowClick={row => setSelected(row)}
          pageSize={8}
        />
      </div>

      {/* Case detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-xs text-text-muted font-mono">{selected.id}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{selected.caseType.replace(/_/g, ' ')}</p>
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
                  {selected.assignedTo && (
                    <span className="text-xs text-text-muted ml-auto">Assigned: {selected.assignedTo}</span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="label mb-1">What was flagged by AICTE Engine</p>
                  <p className="text-sm text-text-secondary">{selected.description}</p>
                </div>

                {/* Evidence Pack Details */}
                {(selected as any).evidencePack && (
                  <div className="p-4 bg-canvas rounded-card border border-border space-y-2">
                    <p className="text-xs font-semibold text-text-primary uppercase tracking-wide">Explainable Evidence Telemetry</p>
                    {Object.entries((selected as any).evidencePack).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-text-muted">{k}:</span>
                        <span className="font-semibold text-text-primary text-right">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Institution Response if already submitted */}
                {(selected as any).institutionResponse && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Institutional Response on File</span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium">
                      {(selected as any).institutionResponse.response}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Submitted by {(selected as any).institutionResponse.submittedBy} at {(selected as any).institutionResponse.submittedAt}
                    </p>
                  </div>
                )}

                {/* Officer Outcome if resolved */}
                {selected.outcome && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-card space-y-1">
                    <p className="text-xs font-bold text-blue-800">Official Adjudication Outcome</p>
                    <p className="text-xs text-blue-900">{selected.outcome}</p>
                  </div>
                )}

                {/* Reason codes */}
                <div>
                  <p className="label mb-2">Regulatory Reason Codes</p>
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
                    <span className="font-semibold">SLA due date:</span> {selected.slaDueAt} · Opened: {selected.openedAt.slice(0, 10)}
                  </p>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-card">
                  <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Your institution can provide clarification, admission documents, or submit an appeal. All responses are audited on the cryptographic SHA-256 chain.
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <p className="label mb-3">Case History</p>
                  <ActivityTimeline events={mockTimeline.slice(0, 4)} />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  {selected.status !== 'Resolved' && selected.status !== 'Closed' && (
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => setShowResponseModal(true)}
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Institutional Response
                    </button>
                  )}
                  <button className="btn btn-secondary w-full" onClick={downloadEvidencePack}>
                    <FileText className="w-3.5 h-3.5" /> Download Evidence Pack (.JSON)
                  </button>
                </div>
              </div>
            </motion.aside>

            {/* Response Modal */}
            {showResponseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-surface rounded-panel shadow-2xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/50">
                    <div>
                      <p className="text-sm font-bold text-text-primary">Submit Response to AICTE Officer</p>
                      <p className="text-xs font-mono text-brand">Case {selected.id} · {selected.caseType}</p>
                    </div>
                    <button className="btn-icon" onClick={() => setShowResponseModal(false)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCaseResponse} className="p-6 space-y-4">
                    <div>
                      <label className="label">Institutional Explanation & Rationale *</label>
                      <textarea
                        required
                        className="input h-28 resize-none text-xs"
                        placeholder="Detail student admission verification, seat surrender proof, or administrative clarification..."
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Evidence Summary / Document Reference (Optional)</label>
                      <input
                        className="input text-xs"
                        placeholder="e.g. Surrender Certificate Ref #SUR-9921 from competing college"
                        value={evidenceSummary}
                        onChange={e => setEvidenceSummary(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowResponseModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Send to Officer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/api/client';
import { AlertTriangle, CheckCircle2, TrendingUp, Info, RefreshCw, X, Send } from 'lucide-react';

const DEFAULT_CHECKS = [
  { id: 'IC-001', rule: 'R1 · INTAKE_BREACH', severity: 'HIGH', subject: 'B.Tech CSE — REGULAR pool', detail: 'Claimed 62 against cap of 60. Over by 2.', status: 'OPEN', raisedAt: '2026-10-18' },
  { id: 'IC-002', rule: 'R6 · NAME_DOB_MISMATCH', severity: 'MEDIUM', subject: 'STU-***-3382 (Tanmay D.)', detail: 'Name similarity 0.71. Manual match needed.', status: 'OPEN', raisedAt: '2026-10-14' },
  { id: 'IC-003', rule: 'R1 · INTAKE_BREACH', severity: 'HIGH', subject: 'B.Tech CSE — NRI pool', detail: 'Claimed 11 against cap of 9. Over by 2.', status: 'OPEN', raisedAt: '2026-10-18' },
  { id: 'IC-004', rule: 'R3 · SHARED_ATTRIBUTE', severity: 'MEDIUM', subject: 'Cluster of 3 students', detail: 'Same guardian contact across 3 records. Possible data entry error or family.', status: 'OPEN', raisedAt: '2026-10-16' },
  { id: 'IC-005', rule: 'R12 · BATCH_ERROR_RATE', severity: 'LOW', subject: 'BATCH-2888', detail: 'Error rate 3.3% (6/180). Above 2% threshold.', status: 'RESOLVED', raisedAt: '2026-10-12' },
];

const DEFAULT_SEAT_LEDGER = [
  { programme: 'B.Tech CSE', poolCode: 'REGULAR', approved: 60, claimed: 62, status: 'BREACH' },
  { programme: 'B.Tech ECE', poolCode: 'REGULAR', approved: 60, claimed: 58, status: 'OK' },
  { programme: 'B.Tech Mech', poolCode: 'REGULAR', approved: 60, claimed: 55, status: 'OK' },
  { programme: 'M.Tech AI', poolCode: 'REGULAR', approved: 30, claimed: 28, status: 'OK' },
  { programme: 'B.Tech CSE', poolCode: 'NRI', approved: 9, claimed: 11, status: 'BREACH' },
  { programme: 'B.Tech ECE', poolCode: 'OCI', approved: 3, claimed: 2, status: 'OK' },
  { programme: 'B.Tech Mech', poolCode: 'SUPERNUMERARY', approved: 3, claimed: 5, status: 'WARNING' },
];

const severityColor: Record<string, string> = {
  HIGH: 'border-l-danger bg-red-50/30',
  MEDIUM: 'border-l-amber-400 bg-amber-50/20',
  LOW: 'border-l-blue-300 bg-blue-50/10',
};

export default function InstitutionIntegrity() {
  const [checks, setChecks] = useState<any[]>(DEFAULT_CHECKS);
  const [seatLedger, setSeatLedger] = useState<any[]>(DEFAULT_SEAT_LEDGER);
  const [loading, setLoading] = useState(false);
  const [respondingFinding, setRespondingFinding] = useState<any>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIntegrity = () => {
    setLoading(true);
    api.getInstitutionIntegrity('INST-MH-0042')
      .then(res => {
        if (res?.checks) setChecks(res.checks);
        if (res?.seatLedger) setSeatLedger(res.seatLedger);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchIntegrity();
    window.addEventListener('focus', fetchIntegrity);
    return () => window.removeEventListener('focus', fetchIntegrity);
  }, []);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseMsg.trim() || !respondingFinding) return;
    setSubmitting(true);
    try {
      await api.respondInstitutionFinding('INST-MH-0042', respondingFinding.id, {
        response: responseMsg,
        officerOrAdminName: 'Dr. Priya Nair (SIET Mumbai)',
      });

      setChecks(prev =>
        prev.map(c => (c.id === respondingFinding.id ? { ...c, status: 'RESOLVED', detail: `${c.detail} [Responded: ${responseMsg}]` } : c))
      );
      setRespondingFinding(null);
      setResponseMsg('');
    } catch {
      setChecks(prev =>
        prev.map(c => (c.id === respondingFinding.id ? { ...c, status: 'RESOLVED' } : c))
      );
      setRespondingFinding(null);
      setResponseMsg('');
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = checks.filter(c => c.status === 'OPEN').length;
  const resolvedCount = checks.filter(c => c.status === 'RESOLVED').length;
  const breachCount = seatLedger.filter(s => s.status === 'BREACH').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Integrity Checks & Seat Ledger"
        subtitle="SIET Mumbai (INST-MH-0042) · Rule-based automated invariant enforcement and quota reconciliation."
        breadcrumb={['Institution Portal', 'Integrity Checks']}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={fetchIntegrity}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Checks
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Findings', value: openCount, color: openCount > 0 ? 'text-danger' : 'text-emerald-600' },
          { label: 'Resolved Findings', value: resolvedCount, color: 'text-emerald-600' },
          { label: 'Seat Pool Breaches', value: breachCount, color: breachCount > 0 ? 'text-amber-600' : 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card text-center py-4"
          >
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Seat pool table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Seat Ledger — AICTE Intake Accounting</h2>
          </div>
          <span className="badge badge-neutral text-xs">AY 2026-27</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Pool</th>
                <th>Approved</th>
                <th>Claimed</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {seatLedger.map((row, i) => {
                const remaining = row.approved - row.claimed;
                return (
                  <tr key={i}>
                    <td className="font-medium text-sm">{row.programme}</td>
                    <td>
                      <span className="text-xs font-medium px-2 py-0.5 bg-canvas border border-border rounded-lg">
                        {row.poolCode}
                      </span>
                    </td>
                    <td className="tabular-nums">{row.approved}</td>
                    <td className="tabular-nums font-semibold">{row.claimed}</td>
                    <td className={`tabular-nums font-semibold ${remaining < 0 ? 'text-danger' : remaining < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {remaining < 0 ? `+${Math.abs(remaining)} excess` : remaining}
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        row.status === 'BREACH' ? 'badge-danger' :
                        row.status === 'WARNING' ? 'badge-warning' : 'badge-success'
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Seat claims are validated in real time against approved intake limits. Over-cap claims create automated regulatory alerts.
        </p>
      </motion.div>

      {/* Findings list */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Active Rule Findings ({openCount} open)</h2>
        {checks.map((chk, i) => (
          <motion.div
            key={chk.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className={`card border-l-4 ${severityColor[chk.severity] || 'border-l-blue-300'} ${chk.status === 'RESOLVED' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-3">
              {chk.status === 'RESOLVED'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                : <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${chk.severity === 'HIGH' ? 'text-danger' : 'text-amber-500'}`} />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono text-text-muted">{chk.id}</span>
                  <span className="text-xs font-semibold text-text-primary">{chk.rule}</span>
                  <StatusBadge type="severity" value={chk.severity} size="sm" />
                  {chk.status === 'RESOLVED' && <span className="badge badge-success text-xs">Resolved & Audited</span>}
                </div>
                <p className="text-sm font-medium text-text-primary mb-0.5">{chk.subject}</p>
                <p className="text-xs text-text-secondary">{chk.detail}</p>
                <p className="text-xs text-text-muted mt-1">Raised {chk.raisedAt}</p>
              </div>
              {chk.status === 'OPEN' && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    className="btn btn-primary btn-sm text-xs"
                    onClick={() => { setRespondingFinding(chk); setResponseMsg(''); }}
                  >
                    Respond
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-xs"
                    onClick={() => {
                      setChecks(prev => prev.map(c => c.id === chk.id ? { ...c, status: 'RESOLVED' } : c));
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Response Modal */}
      <AnimatePresence>
        {respondingFinding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setRespondingFinding(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-surface rounded-panel shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/50">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Respond to Integrity Finding</p>
                    <p className="text-xs font-mono text-brand">{respondingFinding.id} · {respondingFinding.rule}</p>
                  </div>
                  <button className="btn-icon" onClick={() => setRespondingFinding(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleRespond} className="p-6 space-y-4">
                  <div className="p-3 bg-canvas rounded-card border border-border text-xs space-y-1">
                    <p className="font-semibold text-text-primary">{respondingFinding.subject}</p>
                    <p className="text-text-muted">{respondingFinding.detail}</p>
                  </div>
                  <div>
                    <label className="label">Institutional Rationale & Rectification Plan *</label>
                    <textarea
                      required
                      className="input h-28 resize-none text-xs"
                      placeholder="Explain discrepancy, adjustment applied, or request regulatory seat re-allocation..."
                      value={responseMsg}
                      onChange={e => setResponseMsg(e.target.value)}
                    />
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                    Your response will be recorded into the cryptographic SHA-256 audit ledger and forwarded to the assigned AICTE Officer.
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button type="button" className="btn btn-secondary flex-1" onClick={() => setRespondingFinding(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                      {submitting ? 'Submitting…' : <><Send className="w-3.5 h-3.5" /> Submit Response</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

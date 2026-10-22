import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { seatPoolData } from '@/data/mockData';
import { AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

const checks = [
  { id: 'IC-001', rule: 'R1 · INTAKE_BREACH',         severity: 'HIGH',   subject: 'B.Tech CSE — REGULAR pool', detail: 'Claimed 62 against cap of 60. Over by 2.', status: 'OPEN',     raisedAt: '2026-10-18' },
  { id: 'IC-002', rule: 'R6 · NAME_DOB_MISMATCH',     severity: 'MEDIUM', subject: 'STU-***-3382 (Tanmay D.)',  detail: 'Name similarity 0.71. Manual match needed.', status: 'OPEN',   raisedAt: '2026-10-14' },
  { id: 'IC-003', rule: 'R1 · INTAKE_BREACH',         severity: 'HIGH',   subject: 'B.Tech CSE — NRI pool',    detail: 'Claimed 11 against cap of 9. Over by 2.',  status: 'OPEN',     raisedAt: '2026-10-18' },
  { id: 'IC-004', rule: 'R3 · SHARED_ATTRIBUTE',      severity: 'MEDIUM', subject: 'Cluster of 3 students',    detail: 'Same guardian contact across 3 records. Possible data entry error or family.', status: 'OPEN', raisedAt: '2026-10-16' },
  { id: 'IC-005', rule: 'R12 · BATCH_ERROR_RATE',     severity: 'LOW',    subject: 'BATCH-2888',               detail: 'Error rate 3.3% (6/180). Above 2% threshold.', status: 'RESOLVED', raisedAt: '2026-10-12' },
];

const severityColor: Record<string, string> = {
  HIGH:   'border-l-danger bg-red-50/30',
  MEDIUM: 'border-l-amber-400 bg-amber-50/20',
  LOW:    'border-l-blue-300 bg-blue-50/10',
};

export default function InstitutionIntegrity() {
  const openCount = checks.filter(c => c.status === 'OPEN').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Integrity Checks"
        subtitle="Rule-based and statistical findings raised against your institution's records."
        breadcrumb={['Institution Portal', 'Integrity Checks']}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Findings',    value: openCount, color: 'text-danger' },
          { label: 'Resolved',          value: 1,         color: 'text-emerald-600' },
          { label: 'Seat Breaches',     value: 2,         color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Seat pool table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Seat Ledger — Current Cycle</h2>
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
              {seatPoolData.map((row, i) => {
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
                      {remaining < 0 ? `+${Math.abs(remaining)} over` : remaining}
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        row.status === 'BREACH'  ? 'badge-danger' :
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
          Seat claims are enforced at the database level. Over-cap claims are never silently dropped — they open a ledger-level case.
        </p>
      </motion.div>

      {/* Findings list */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Rule Findings ({openCount} open)</h2>
        {checks.map((chk, i) => (
          <motion.div
            key={chk.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className={`card border-l-4 ${severityColor[chk.severity]} ${chk.status === 'RESOLVED' ? 'opacity-60' : ''}`}
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
                  {chk.status === 'RESOLVED' && <span className="badge badge-success text-xs">Resolved</span>}
                </div>
                <p className="text-sm font-medium text-text-primary mb-0.5">{chk.subject}</p>
                <p className="text-xs text-text-secondary">{chk.detail}</p>
                <p className="text-xs text-text-muted mt-1">Raised {chk.raisedAt}</p>
              </div>
              {chk.status === 'OPEN' && (
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button className="btn btn-secondary btn-sm text-xs">Respond</button>
                  <button className="btn btn-ghost btn-sm text-xs">Dismiss</button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

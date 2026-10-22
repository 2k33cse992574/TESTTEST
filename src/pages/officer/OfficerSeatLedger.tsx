import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { seatPoolData, mockInstitutions } from '@/data/mockData';
import { BarChartComponent } from '@/components/charts/BarChart';
import { AlertTriangle, CheckCircle2, Info, TrendingUp } from 'lucide-react';

const nationalSeats = mockInstitutions.reduce(
  (acc, inst) => ({
    approved: acc.approved + inst.approvedIntake,
    enrolled: acc.enrolled + inst.enrolledCount,
  }),
  { approved: 0, enrolled: 0 }
);

const breachInstitutions = mockInstitutions.filter(i => i.enrolledCount > i.approvedIntake);

const utilData = mockInstitutions.map(inst => ({
  name: inst.name.split(' ').slice(0, 2).join(' '),
  value: Math.round((inst.enrolledCount / inst.approvedIntake) * 100),
  color: inst.enrolledCount > inst.approvedIntake ? '#C53B45' : inst.enrolledCount / inst.approvedIntake > 0.95 ? '#B7791F' : '#198754',
}));

export default function OfficerSeatLedger() {
  const overallUtil = Math.round((nationalSeats.enrolled / nationalSeats.approved) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Seat Ledger"
        subtitle="National seat accounting — approved intake vs claimed seats across all institutions."
        breadcrumb={['AICTE Officer Portal', 'Seat Ledger']}
      />

      {/* National summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Approved Intake',  value: nationalSeats.approved.toLocaleString(), color: 'text-text-primary',   sub: 'All programmes · AY 2026-27' },
          { label: 'Total Enrolled',          value: nationalSeats.enrolled.toLocaleString(), color: 'text-brand',           sub: `${overallUtil}% utilisation` },
          { label: 'Seat Breaches',           value: breachInstitutions.length,               color: 'text-danger',          sub: `${breachInstitutions.map(i=>i.name.split(' ')[0]).join(', ')}` },
          { label: 'Seats Remaining',         value: Math.max(nationalSeats.approved - nationalSeats.enrolled, 0).toLocaleString(), color: 'text-emerald-600', sub: 'Across all institutions' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1 truncate">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Utilisation bar chart */}
      <BarChartComponent
        title="Seat Utilisation by Institution"
        subtitle="Percentage of approved intake enrolled — red bars indicate over-intake"
        data={utilData}
        height={220}
      />

      {/* Seat pool detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold text-text-primary">Pool-Level Breakdown (SIET Mumbai demo)</h2>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Pool</th>
                  <th>Cap</th>
                  <th>Claimed</th>
                  <th>Over By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {seatPoolData.map((row, i) => (
                  <tr key={i}>
                    <td className="text-sm font-medium">{row.programme}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{row.poolCode}</span>
                    </td>
                    <td className="tabular-nums">{row.approved}</td>
                    <td className={`tabular-nums font-semibold ${row.claimed > row.approved ? 'text-danger' : 'text-text-primary'}`}>
                      {row.claimed}
                    </td>
                    <td className={`tabular-nums font-bold ${row.overBy > 0 ? 'text-danger' : 'text-text-muted'}`}>
                      {row.overBy > 0 ? `+${row.overBy}` : '—'}
                    </td>
                    <td>
                      <span className={`badge text-xs ${
                        row.status === 'BREACH'  ? 'badge-danger' :
                        row.status === 'WARNING' ? 'badge-warning' : 'badge-success'
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Breach details + explanatory notes */}
        <div className="space-y-4">
          {/* Breach details */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="card"
          >
            <h2 className="text-sm font-semibold text-text-primary mb-4">Active Intake Breaches</h2>
            {breachInstitutions.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">No intake breaches across all institutions.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {breachInstitutions.map(inst => (
                  <div key={inst.id} className="p-3 bg-red-50 border border-red-200 rounded-card">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-danger">{inst.name}</p>
                        <p className="text-xs text-red-700 mt-0.5">
                          Enrolled {inst.enrolledCount} against approved intake of {inst.approvedIntake}.
                          <span className="font-bold"> Over by {inst.enrolledCount - inst.approvedIntake}.</span>
                        </p>
                        <p className="text-xs text-red-600 mt-1">{inst.openCases} open case{inst.openCases !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* How the ledger works */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="card bg-brand-soft/20 border-brand/20"
          >
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-text-secondary">
                <p className="font-semibold text-text-primary">How the Seat Ledger works</p>
                <p>Each admission is a <span className="font-medium text-text-primary">claim</span> with a unique slot number. Claims are never silently dropped — slot numbers above the cap mark overflow.</p>
                <p>A single ledger-level <span className="font-medium text-text-primary">INTAKE_BREACH</span> case tracks the delta per programme-pool, rather than raising 25 accusations against individual students.</p>
                <p>The nightly invariant check verifies <code className="bg-canvas px-1 rounded">claimed = count(active enrolments)</code>. Any drift raises a P1 finding.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Institution-level table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-4">All Institutions — Seat Summary</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Approved</th>
                <th>Enrolled</th>
                <th>Verified</th>
                <th>Utilisation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInstitutions.map(inst => {
                const util = Math.round((inst.enrolledCount / inst.approvedIntake) * 100);
                const breach = inst.enrolledCount > inst.approvedIntake;
                return (
                  <tr key={inst.id}>
                    <td>
                      <p className="text-sm font-semibold text-text-primary">{inst.name}</p>
                      <p className="text-xs text-text-muted">{inst.state}</p>
                    </td>
                    <td className="tabular-nums">{inst.approvedIntake}</td>
                    <td className={`tabular-nums font-semibold ${breach ? 'text-danger' : ''}`}>{inst.enrolledCount}</td>
                    <td className="tabular-nums text-emerald-600">{inst.verifiedCount}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tabular-nums ${breach ? 'text-danger' : util > 95 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {util}%
                        </span>
                        <div className="w-16 progress-bar">
                          <div
                            className={`progress-fill ${breach ? 'bg-danger' : util > 95 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs ${breach ? 'badge-danger' : util > 95 ? 'badge-warning' : 'badge-success'}`}>
                        {breach ? 'BREACH' : util > 95 ? 'NEAR CAP' : 'OK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

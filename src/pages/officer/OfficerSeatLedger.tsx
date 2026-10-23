import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { seatPoolData, mockInstitutions } from '@/data/mockData';
import { api } from '@/api/client';
import { BarChartComponent } from '@/components/charts/BarChart';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Building2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OfficerSeatLedger() {
  const navigate = useNavigate();
  const [pools, setPools] = useState<any[]>(seatPoolData);
  const [instSeats, setInstSeats] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalApproved: 2840,
    totalEnrolled: 2885,
    seatBreaches: 2,
    seatsRemaining: 0,
    overallUtil: 101.6
  });

  useEffect(() => {
    api.getSeatSummary()
      .then(res => {
        if (res) {
          setSummary({
            totalApproved: res.totalApprovedIntake,
            totalEnrolled: res.totalEnrolled,
            seatBreaches: res.seatBreachesCount,
            seatsRemaining: res.seatsRemaining,
            overallUtil: res.overallUtilizationPercent
          });
        }
      })
      .catch(() => {});

    api.getSeatPools()
      .then(res => { if (res && res.length) setPools(res); })
      .catch(() => {});

    api.getInstitutionSeats()
      .then(res => { if (res && res.length) setInstSeats(res); })
      .catch(() => {});
  }, []);

  const breachInstitutions = mockInstitutions.filter(i => i.enrolledCount > i.approvedIntake);

  const utilData = (instSeats.length ? instSeats : mockInstitutions).map(inst => {
    const enrolled = inst.enrolledCount;
    const approved = inst.approvedIntake;
    const pct = Math.round((enrolled / approved) * 100);
    return {
      name: inst.name.split(' ').slice(0, 2).join(' '),
      value: pct,
      color: enrolled > approved ? '#C53B45' : pct > 95 ? '#B7791F' : '#198754',
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Seat Ledger"
        subtitle="National seat accounting — approved intake vs claimed seats, pool-wise balances, and excess-admission breach alerts."
        breadcrumb={['AICTE Officer Portal', 'Seat Ledger']}
      />

      {/* Excess Admission Alert Banner */}
      {summary.seatBreaches > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900">
                Excess-Admission Breach Detected in {summary.seatBreaches} Institution{summary.seatBreaches > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Enrolled students exceed statutory approved cap by {summary.totalEnrolled - summary.totalApproved} seats. Show-cause notices triggered.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/officer/institutions')}
            className="btn btn-secondary btn-sm text-xs text-danger border-red-300"
          >
            Review Breach Institutions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* National summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Approved Intake',  value: summary.totalApproved.toLocaleString(), color: 'text-text-primary',   sub: 'All programmes · AY 2026-27' },
          { label: 'Total Enrolled',          value: summary.totalEnrolled.toLocaleString(), color: 'text-brand',           sub: `${summary.overallUtil}% national utilisation` },
          { label: 'Seat Breaches',           value: summary.seatBreaches,                  color: 'text-danger',          sub: 'Exceeded statutory cap' },
          { label: 'Seats Remaining',         value: summary.seatsRemaining.toLocaleString(), color: 'text-emerald-600', sub: 'Across compliant institutions' },
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
        subtitle="Percentage of approved intake enrolled — red bars indicate over-intake breach"
        data={utilData}
        height={220}
      />

      {/* Pool Breakdown & Institution Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-title text-text-primary">Quota Pool Status</p>
              <p className="text-xs text-text-muted">National aggregation by reservation & intake pool</p>
            </div>
            <span className="badge badge-success flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Invariant Verified
            </span>
          </div>

          <div className="space-y-3">
            {pools.map((p, i) => {
              const pct = Math.round((p.claimed / p.approved) * 100);
              const isBreach = p.status === 'BREACH' || p.claimed > p.approved;
              return (
                <div key={i} className="p-3 bg-canvas rounded-card border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-text-primary">{p.programme}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBreach ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isBreach ? `BREACH (+${p.overBy || p.claimed - p.approved})` : 'OK'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted mb-1.5">
                    <span>Pool: {p.poolCode}</span>
                    <span>{p.claimed} / {p.approved} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${isBreach ? 'bg-danger' : pct > 95 ? 'bg-amber-500' : 'bg-brand'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institution-level tracking */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-title text-text-primary">Institution Seat Balances</p>
              <p className="text-xs text-text-muted">Enrolment accounting by institution</p>
            </div>
            <button
              onClick={() => navigate('/officer/institutions')}
              className="text-xs text-brand font-semibold hover:underline"
            >
              View table →
            </button>
          </div>

          <div className="space-y-3">
            {mockInstitutions.map((inst, i) => {
              const breach = inst.enrolledCount > inst.approvedIntake;
              const pct = Math.round((inst.enrolledCount / inst.approvedIntake) * 100);
              return (
                <div key={i} className="p-3 bg-canvas rounded-card border border-border flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{inst.name}</p>
                    <p className="text-xs text-text-muted">{inst.state} · {inst.type}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm tabular-nums">{inst.enrolledCount}</span>
                      <span className="text-xs text-text-muted">/{inst.approvedIntake}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${breach ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-emerald-700'}`}>
                        {pct}%
                      </span>
                    </div>
                    {breach && (
                      <span className="text-xs text-danger font-semibold block mt-0.5">
                        +{inst.enrolledCount - inst.approvedIntake} Over-Intake
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

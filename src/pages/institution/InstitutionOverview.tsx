import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { mockCases, mockSubmissions, institutionComplianceData, mockTimeline } from '@/data/mockData';
import { api } from '@/api/client';
import { Upload, ArrowRight, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_METRICS = [
  { label: 'Total Enrolment Records', value: 231, sublabel: '240 approved intake', color: 'brand' as const, delta: '+12 this cycle', deltaType: 'up' as const },
  { label: 'Ready for Submission', value: 218, sublabel: '13 records need attention', color: 'success' as const, delta: '94% ready rate', deltaType: 'neutral' as const },
  { label: 'Needs Attention', value: 13, sublabel: '8 data issues · 5 held', color: 'warning' as const, delta: '5 held', deltaType: 'neutral' as const },
  { label: 'Open Cases', value: 3, sublabel: '1 high · 1 medium · 1 low', color: 'danger' as const, delta: 'SLA due in 2 days', deltaType: 'neutral' as const },
];

export default function InstitutionOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchOverview = () => {
    api.getInstitutionOverview('INST-MH-0042')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
    window.addEventListener('focus', fetchOverview);
    return () => window.removeEventListener('focus', fetchOverview);
  }, []);

  const metrics = data?.metrics || DEFAULT_METRICS;
  const trustDistribution = data?.trustDistribution || [
    { name: 'L4 Certified', value: 42, color: '#6558D3' },
    { name: 'L3 Cross-Checked', value: 156, color: '#198754' },
    { name: 'L2 ID-Verified', value: 21, color: '#2F6FED' },
    { name: 'L1 Format', value: 10, color: '#8791A5' },
    { name: 'L0 Claimed', value: 2, color: '#D0D5E2' },
  ];
  const complianceTrend = data?.complianceTrend || institutionComplianceData;
  const seatSummary = data?.seatSummary || [
    { pool: 'REGULAR', approved: 240, claimed: 229, status: 'OK' },
    { pool: 'NRI', approved: 36, claimed: 2, status: 'OK' },
    { pool: 'OCI', approved: 12, claimed: 0, status: 'OK' },
    { pool: 'SUPERNUMERARY', approved: 12, claimed: 0, status: 'OK' },
  ];
  const instCases = data?.openCases || mockCases.filter(c => c.institutionId === 'INST-MH-0042').slice(0, 3);
  const recentSubmissions = data?.recentSubmissions || mockSubmissions.filter(s => s.institutionId === 'INST-MH-0042').slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Institution Overview"
        subtitle="SIET Mumbai (INST-MH-0042) · Real-time admissions, integrity checks, and seat ledger status."
        breadcrumb={['Institution Portal', 'Overview']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={fetchOverview}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/institution/submissions')}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Records
            </button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m: any, i: number) => (
          <MetricCard
            key={i}
            {...m}
            index={i}
            clickable={m.label === 'Needs Attention' || m.label === 'Open Cases'}
            onClick={() => {
              if (m.label === 'Needs Attention') navigate('/institution/integrity');
              if (m.label === 'Open Cases') navigate('/institution/cases');
            }}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Submission & Validation Trend"
            subtitle="Records submitted vs flagged issues this academic cycle"
            data={complianceTrend}
            lines={[
              { key: 'submissions', label: 'Submitted', color: '#6558D3' },
              { key: 'errors', label: 'Needs Attention', color: '#C53B45' },
            ]}
            height={240}
          />
        </div>
        <DonutChart
          title="Trust Distribution"
          subtitle="Enrolment records by proof tier"
          data={trustDistribution}
          centerLabel="Records"
          centerValue={metrics[0]?.value || 231}
          height={200}
        />
      </div>

      {/* Seat summary + cases row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seat summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Seat Summary</h2>
            <button
              className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
              onClick={() => navigate('/institution/integrity')}
            >
              Full breakdown <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {seatSummary.map((row: any) => {
              const pct = Math.min((row.claimed / Math.max(row.approved, 1)) * 100, 100);
              const over = row.claimed > row.approved;
              return (
                <div key={row.pool}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-text-primary">{row.pool}</span>
                    <span className={`tabular-nums font-semibold ${over ? 'text-danger' : 'text-text-secondary'}`}>
                      {row.claimed}/{row.approved}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className={`progress-fill ${over ? 'bg-danger' : pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-text-secondary">AICTE Single-Seat Lock & Invariant Ledger active</span>
          </div>
        </motion.div>

        {/* Open cases */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Open Cases Requiring Action</h2>
            <button
              className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
              onClick={() => navigate('/institution/cases')}
            >
              All cases <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {instCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
              <p className="text-sm text-text-muted">No open cases for this institution</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instCases.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-3 rounded-card border border-border hover:bg-canvas cursor-pointer transition-colors"
                  onClick={() => navigate('/institution/cases')}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    c.severity === 'HIGH' || c.severity === 'CRITICAL' ? 'text-danger' : 'text-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-text-primary">{c.id}</span>
                      <StatusBadge type="severity" value={c.severity} size="sm" />
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">Due {c.slaDueAt}</span>
                    </div>
                  </div>
                  <StatusBadge type="case" value={c.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent submissions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.30 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Recent Enrolment Batches</h2>
          <button
            className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
            onClick={() => navigate('/institution/submissions')}
          >
            All submissions <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Submitted</th>
                <th>Total</th>
                <th>Accepted</th>
                <th>Rejected</th>
                <th>Held</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((s: any) => (
                <tr key={s.id} className="cursor-pointer hover:bg-canvas transition-colors" onClick={() => navigate('/institution/submissions')}>
                  <td className="font-mono text-xs text-brand">{s.batchId}</td>
                  <td className="text-xs text-text-secondary">{new Date(s.submittedAt).toLocaleDateString('en-IN')}</td>
                  <td className="tabular-nums font-semibold">{s.totalRows}</td>
                  <td className="tabular-nums text-emerald-600 font-medium">{s.accepted}</td>
                  <td className="tabular-nums text-red-500 font-medium">{s.rejected}</td>
                  <td className="tabular-nums text-amber-600 font-medium">{s.held}</td>
                  <td><StatusBadge type="submission" value={s.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="card"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-5">Institutional Activity & Audit Ledger</h2>
        <ActivityTimeline events={mockTimeline} maxItems={5} />
      </motion.div>
    </div>
  );
}

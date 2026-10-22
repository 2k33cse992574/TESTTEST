import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import {
  enrolmentTrendData, trustDistributionData, casesByTypeData,
  mockCases, mockInstitutions, mockTimeline, regionWiseData,
} from '@/data/mockData';
import { ArrowRight, AlertTriangle, Clock, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const metrics = [
  { label: 'Total Enrolment Records',  value: 18400, sublabel: '15,600 identity-verified',    color: 'brand'   as const, delta: '+1,240 this week', deltaType: 'up'     as const },
  { label: 'Institutions Onboarded',   value: 8,     sublabel: '6 active submissions',        color: 'info'    as const, delta: '100% onboarded',   deltaType: 'neutral' as const },
  { label: 'Open Cases',               value: 7,     sublabel: '2 critical · 3 high',         color: 'danger'  as const, delta: '−3 since last week',deltaType: 'down'   as const },
  { label: 'Seat Breaches Detected',   value: 3,     sublabel: '2 REGULAR · 1 NRI pool',      color: 'warning' as const, delta: '1 new today',      deltaType: 'neutral' as const },
];

const criticalCases = mockCases.filter(c =>
  ['HIGH','CRITICAL'].includes(c.severity) && !['Resolved','Closed'].includes(c.status)
).slice(0, 3);

const topRiskInstitutions = [...mockInstitutions]
  .sort((a, b) => b.openCases - a.openCases)
  .slice(0, 4);

export default function OfficerOverview() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="AICTE Command Centre"
        subtitle="National enrolment integrity overview — AY 2026-27"
        breadcrumb={['AICTE Officer Portal', 'Overview']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm">
              <Shield className="w-3.5 h-3.5" /> Policy Studio
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/officer/queue')}>
              <AlertTriangle className="w-3.5 h-3.5" /> Review Queue
            </button>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} index={i} clickable
            onClick={() => {
              if (m.label === 'Open Cases') navigate('/officer/queue');
              else if (m.label === 'Seat Breaches Detected') navigate('/officer/seats');
            }}
          />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="National Enrolment Trend"
            subtitle="Total records submitted vs identity-verified over the academic cycle"
            data={enrolmentTrendData}
            lines={[
              { key: 'enrolled', label: 'Submitted',       color: '#6558D3' },
              { key: 'verified', label: 'ID-Verified (L2+)',color: '#198754' },
              { key: 'cases',    label: 'Cases Opened',    color: '#C53B45' },
            ]}
            height={250}
          />
        </div>
        <DonutChart
          title="Trust Distribution"
          subtitle="All records by proof level"
          data={trustDistributionData}
          centerLabel="Total Records"
          centerValue="18.4K"
          height={210}
        />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarChartComponent
          title="Cases by Type"
          subtitle="Open cases across all institutions"
          data={casesByTypeData.map(d => ({ ...d }))}
          height={200}
        />
        <BarChartComponent
          title="Enrolment by Region"
          subtitle="Student records by AICTE region"
          data={regionWiseData.map(d => ({ ...d, color: '#2F6FED' }))}
          color="#2F6FED"
          height={200}
        />

        {/* Critical cases panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Critical Cases</h2>
            <button
              className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
              onClick={() => navigate('/officer/queue')}
            >
              All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {criticalCases.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-card border border-border hover:bg-canvas cursor-pointer transition-colors"
                onClick={() => navigate('/officer/queue')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-brand">{c.id}</span>
                  <StatusBadge type="severity" value={c.severity} size="sm" />
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-3 h-3 text-text-muted" />
                  <span className="text-xs text-text-muted">Due {c.slaDueAt}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Institution risk + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institution risk table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-semibold text-text-primary">Institutions Needing Attention</h2>
            </div>
            <button
              className="text-xs text-brand font-medium hover:underline flex items-center gap-1"
              onClick={() => navigate('/officer/institutions')}
            >
              All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {topRiskInstitutions.map((inst, i) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-card hover:bg-canvas cursor-pointer transition-colors"
                onClick={() => navigate('/officer/institutions')}
              >
                <div className={`w-8 h-8 rounded-card flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${inst.integrityBand === 'A' ? 'bg-emerald-50 text-emerald-700' :
                    inst.integrityBand === 'B' ? 'bg-blue-50 text-blue-700' :
                    inst.integrityBand === 'C' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'}`}>
                  {inst.integrityBand}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{inst.name}</p>
                  <p className="text-xs text-text-muted">{inst.state} · {inst.enrolledCount}/{inst.approvedIntake} enrolled</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {inst.openCases > 0 && (
                    <span className="badge badge-danger text-xs">{inst.openCases} cases</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="card"
        >
          <h2 className="text-sm font-semibold text-text-primary mb-5">System Activity</h2>
          <ActivityTimeline events={mockTimeline} maxItems={6} />
        </motion.div>
      </div>
    </div>
  );
}

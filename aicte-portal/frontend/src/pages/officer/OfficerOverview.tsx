import { useState, useEffect } from 'react';
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
import { api } from '@/api/client';
import { ArrowRight, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const defaultMetrics = [
  { label: 'Total Enrolment Records',  value: 18400, sublabel: '15,600 identity-verified',    color: 'brand'   as const, delta: '+1,240 this week', deltaType: 'up'     as const },
  { label: 'Institutions Onboarded',   value: 8,     sublabel: '6 active submissions',        color: 'info'    as const, delta: '100% onboarded',   deltaType: 'neutral' as const },
  { label: 'Open Cases',               value: 7,     sublabel: '2 critical · 3 high',         color: 'danger'  as const, delta: '−3 since last week',deltaType: 'down'   as const },
  { label: 'Seat Breaches Detected',   value: 3,     sublabel: '2 REGULAR · 1 NRI pool',      color: 'warning' as const, delta: '1 new today',      deltaType: 'neutral' as const },
];

export default function OfficerOverview() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [timeline, setTimeline] = useState(mockTimeline);
  const [casesByType, setCasesByType] = useState(casesByTypeData);
  const [criticalCases, setCriticalCases] = useState(
    mockCases.filter(c => ['HIGH', 'CRITICAL'].includes(c.severity) && !['Resolved', 'Closed'].includes(c.status)).slice(0, 3)
  );
  const [riskInstitutions, setRiskInstitutions] = useState(
    [...mockInstitutions].sort((a, b) => b.openCases - a.openCases).slice(0, 4)
  );

  useEffect(() => {
    // Attempt live fetch from backend
    api.getOverviewMetrics()
      .then(data => { if (data && data.length) setMetrics(data); })
      .catch(() => {});

    api.getTimeline()
      .then(data => { if (data && data.length) setTimeline(data); })
      .catch(() => {});

    api.getCasesByType()
      .then(data => { if (data && data.length) setCasesByType(data); })
      .catch(() => {});

    api.getCriticalCases()
      .then(data => { if (data && data.length) setCriticalCases(data); })
      .catch(() => {});

    api.getRiskInstitutions()
      .then(data => { if (data && data.length) setRiskInstitutions(data); })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="AICTE Command Centre"
        subtitle="National enrolment integrity overview — AY 2026-27"
        breadcrumb={['AICTE Officer Portal', 'Overview']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/officer/policy')}>
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
          <MetricCard
            key={i}
            {...m}
            index={i}
            clickable
            onClick={() => {
              if (m.label === 'Open Cases') navigate('/officer/queue');
              else if (m.label === 'Seat Breaches Detected') navigate('/officer/seats');
              else if (m.label === 'Institutions Onboarded') navigate('/officer/institutions');
              else navigate('/officer/enrolments');
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
              { key: 'enrolled', label: 'Submitted',        color: '#6558D3' },
              { key: 'verified', label: 'ID-Verified (L2+)', color: '#198754' },
              { key: 'cases',    label: 'Cases Opened',     color: '#C53B45' },
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
          data={casesByType}
          height={200}
        />
        <BarChartComponent
          title="Enrolment by Region"
          subtitle="Student records by AICTE region"
          data={regionWiseData.map(d => ({ ...d, color: '#2F6FED' }))}
          height={200}
        />
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-card-title text-text-primary">Single-Seat Lock Invariant</p>
            <p className="text-xs text-text-muted mt-1">Cross-institution duplicate prevention</p>
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-control">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-800">Ledger Invariant PASS</span>
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Zero double-seated students active. All 2 conflict candidates placed on CONFLICT_HOLD.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/officer/seats')}
            className="btn btn-secondary btn-sm w-full mt-4 justify-center"
          >
            Inspect Seat Ledger <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Critical cases + High-risk institutions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical cases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-title text-text-primary">Critical & High Priority Cases</p>
              <p className="text-xs text-text-muted">Requires officer adjudication</p>
            </div>
            <button
              onClick={() => navigate('/officer/queue')}
              className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {criticalCases.map(c => (
              <div
                key={c.id}
                onClick={() => navigate('/officer/queue')}
                className="p-3 bg-canvas rounded-card border border-border hover:border-brand/40 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={c.severity} size="sm" />
                    <span className="font-mono text-xs text-text-secondary">{c.id}</span>
                    <span className="text-xs font-medium text-text-primary">{c.caseType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0">Due {c.slaDueAt}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1.5 line-clamp-1">{c.description}</p>
                <p className="text-xs text-text-muted mt-1 font-medium">{c.institutionName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top risk institutions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-title text-text-primary">Institutions with Open Cases</p>
              <p className="text-xs text-text-muted">Ranked by case volume and integrity score</p>
            </div>
            <button
              onClick={() => navigate('/officer/institutions')}
              className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {riskInstitutions.map(inst => (
              <div
                key={inst.id}
                onClick={() => navigate('/officer/institutions')}
                className="p-3 bg-canvas rounded-card border border-border flex items-center justify-between hover:border-brand/40 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{inst.name}</p>
                  <p className="text-xs text-text-muted">{inst.state} · {inst.type}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-danger">{inst.openCases} cases</span>
                    <p className="text-xs text-text-muted">Score: {inst.integrityScore}</p>
                  </div>
                  <StatusBadge type="integrity" value={inst.integrityBand} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="card">
        <p className="text-card-title text-text-primary mb-1">Live Cryptographic Audit Activity</p>
        <p className="text-xs text-text-muted mb-4">Immutable hash-chained system events</p>
        <ActivityTimeline events={timeline} />
      </div>
    </div>
  );
}

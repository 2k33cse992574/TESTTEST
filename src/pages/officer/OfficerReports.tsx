import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import {
  enrolmentTrendData, trustDistributionData, casesByTypeData, regionWiseData,
} from '@/data/mockData';
import { Download, FileText, FileSpreadsheet, RefreshCw, Calendar } from 'lucide-react';

const reports = [
  { name: 'National Enrolment Summary',       desc: 'Aggregate enrolment across all institutions by programme, state and pool — AY 2026-27', updated: '21 Oct 2026', type: 'PDF' },
  { name: 'Integrity Risk Report',             desc: 'Open cases, breach institutions, integrity index distribution',                        updated: '21 Oct 2026', type: 'PDF' },
  { name: 'Trust Distribution Report',         desc: 'L0–L4 breakdown with verification evidence coverage',                                  updated: '20 Oct 2026', type: 'PDF' },
  { name: 'Seat Ledger Audit Export',          desc: 'All seat claims with slot numbers, pool status and nightly invariant results',         updated: '21 Oct 2026', type: 'XLSX' },
  { name: 'Case Resolution Performance',       desc: 'SLA compliance, case age, officer assignments, resolution outcomes',                   updated: '19 Oct 2026', type: 'PDF' },
  { name: 'Cross-Institution Duplicate Log',   desc: 'All CONFLICT_HOLD events, mediation outcomes and identity merge journal',             updated: '18 Oct 2026', type: 'XLSX' },
  { name: 'Policy Back-test Report',           desc: 'Impact analysis of policy version 7 vs version 6 — newly flagged institutions',      updated: '15 Oct 2026', type: 'PDF' },
  { name: 'Full Data Export (Anonymised)',     desc: 'Complete dataset with PII removed — for authorised policy research',                  updated: '01 Oct 2026', type: 'XLSX' },
];

export default function OfficerReports() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="National-level summaries for governance, policy and regulatory oversight."
        breadcrumb={['AICTE Officer Portal', 'Reports']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm">
              <Calendar className="w-3.5 h-3.5" /> Date Range
            </button>
            <button className="btn btn-primary btn-sm">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        }
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="National Enrolment & Verification Trend"
            subtitle="Monthly record intake across all institutions — AY 2026-27"
            data={enrolmentTrendData}
            lines={[
              { key: 'enrolled', label: 'Submitted',        color: '#6558D3' },
              { key: 'verified', label: 'ID-Verified (L2+)',color: '#198754' },
              { key: 'cases',    label: 'Cases Opened',     color: '#C53B45' },
            ]}
            height={260}
          />
        </div>
        <DonutChart
          title="National Trust Mix"
          subtitle="All records by proof level"
          data={trustDistributionData}
          centerLabel="Records"
          centerValue="18.4K"
          height={220}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="Cases by Type"
          subtitle="Distribution of open case types across all institutions"
          data={casesByTypeData.map(d => ({ ...d }))}
          height={220}
        />
        <BarChartComponent
          title="Enrolment by Region"
          subtitle="Total enrolled students per AICTE region"
          data={regionWiseData.map(d => ({ ...d, color: '#2F6FED' }))}
          color="#2F6FED"
          height={220}
        />
      </div>

      {/* Report list */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Available Reports</h2>
          <button className="btn-icon">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-card border border-border hover:bg-canvas transition-colors group cursor-pointer"
            >
              <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                <p className="text-xs text-text-muted truncate">{r.desc} · Updated {r.updated}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium px-2 py-0.5 bg-canvas border border-border rounded">{r.type}</span>
                <button className="btn-icon w-7 h-7">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { institutionComplianceData } from '@/data/mockData';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const programmeData = [
  { name: 'B.Tech CSE',   value: 62 },
  { name: 'B.Tech ECE',   value: 58 },
  { name: 'B.Tech Mech',  value: 55 },
  { name: 'M.Tech AI',    value: 28 },
  { name: 'B.Tech Civil', value: 22 },
  { name: 'MBA',          value: 6  },
];

const reports = [
  { name: 'Enrolment Summary Report',        desc: 'Total enrolment by programme and pool — AY 2026-27', updated: '20 Oct 2026', type: 'PDF' },
  { name: 'Integrity Status Report',          desc: 'Open findings, resolved cases, seat ledger snapshot', updated: '18 Oct 2026', type: 'PDF' },
  { name: 'Submission History Export',        desc: 'All batches with row counts and status — full export',  updated: '20 Oct 2026', type: 'XLSX' },
  { name: 'Trust Distribution Report',        desc: 'Breakdown of L0–L4 records with verification evidence',updated: '15 Oct 2026', type: 'PDF' },
  { name: 'Seat Ledger Reconciliation',       desc: 'Declared vs derived totals per pool — current cycle',  updated: '20 Oct 2026', type: 'XLSX' },
];

export default function InstitutionReports() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Enrolment summaries, integrity status and seat ledger reports for your institution."
        breadcrumb={['Institution Portal', 'Reports']}
        actions={
          <button className="btn btn-primary btn-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Generate Custom Report
          </button>
        }
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Submission Volume & Error Rate"
            subtitle="Records submitted per month with error count overlay"
            data={institutionComplianceData}
            lines={[
              { key: 'submissions', label: 'Submitted', color: '#6558D3' },
              { key: 'errors',      label: 'Errors',    color: '#C53B45' },
            ]}
          />
        </div>
        <BarChartComponent
          title="Students by Programme"
          subtitle="Enrolled count per programme"
          data={programmeData}
          color="#6558D3"
          height={220}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Report list */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="card"
          >
            <h2 className="text-sm font-semibold text-text-primary mb-4">Available Reports</h2>
            <div className="space-y-2">
              {reports.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-card border border-border hover:bg-canvas transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                    <p className="text-xs text-text-muted">{r.desc} · Updated {r.updated}</p>
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

        <DonutChart
          title="Pool Utilisation"
          subtitle="Claimed seats by pool type"
          data={[
            { name: 'REGULAR',       value: 229, color: '#6558D3' },
            { name: 'NRI',           value: 2,   color: '#2F6FED' },
            { name: 'OCI',           value: 0,   color: '#198754' },
            { name: 'SUPERNUMERARY', value: 0,   color: '#8791A5' },
          ]}
          centerLabel="Total Seats"
          centerValue={231}
          height={220}
        />
      </div>
    </div>
  );
}

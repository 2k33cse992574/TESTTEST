import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import { api } from '@/api/client';
import {
  enrolmentTrendData, trustDistributionData, casesByTypeData, regionWiseData,
} from '@/data/mockData';
import { Download, FileText, FileSpreadsheet, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

interface ReportItem {
  id: string;
  name: string;
  desc: string;
  updated: string;
  type: string;
  filename: string;
}

const reports: ReportItem[] = [
  { id: 'national-enrolment-summary',     name: 'National Enrolment Summary',       desc: 'Aggregate enrolment across all institutions by programme, state and pool — AY 2026-27', updated: '21 Oct 2026', type: 'CSV',  filename: 'AICTE_National_Enrolment_Summary.csv' },
  { id: 'integrity-risk-report',           name: 'Integrity Risk Report',             desc: 'Open cases, breach institutions, integrity index distribution',                        updated: '21 Oct 2026', type: 'CSV',  filename: 'AICTE_Integrity_Risk_Report.csv' },
  { id: 'trust-distribution-report',       name: 'Trust Distribution Report',         desc: 'L0–L4 breakdown with verification evidence coverage',                                  updated: '20 Oct 2026', type: 'CSV',  filename: 'AICTE_Trust_Distribution_Report.csv' },
  { id: 'seat-ledger-audit-export',        name: 'Seat Ledger Audit Export',          desc: 'All seat claims with slot numbers, pool status and nightly invariant results',         updated: '21 Oct 2026', type: 'CSV',  filename: 'AICTE_Seat_Ledger_Audit_Ledger.csv' },
  { id: 'case-resolution-performance',     name: 'Case Resolution Performance',       desc: 'SLA compliance, case age, officer assignments, resolution outcomes',                   updated: '19 Oct 2026', type: 'CSV',  filename: 'AICTE_Case_Resolution_SLA_Report.csv' },
  { id: 'cross-institution-duplicate-log', name: 'Cross-Institution Duplicate Log',   desc: 'All CONFLICT_HOLD events, mediation outcomes and identity merge journal',             updated: '18 Oct 2026', type: 'CSV',  filename: 'AICTE_Cross_Institution_Duplicate_Log.csv' },
  { id: 'policy-backtest-report',         name: 'Policy Back-test Report',           desc: 'Impact analysis of policy version 7 vs version 6 — newly flagged institutions',      updated: '15 Oct 2026', type: 'CSV',  filename: 'AICTE_Policy_Studio_Backtest_v7.csv' },
  { id: 'full-data-export-anonymised',     name: 'Full Data Export (Anonymised)',     desc: 'Complete dataset with PII removed — for authorised policy research',                  updated: '01 Oct 2026', type: 'JSON', filename: 'AICTE_Full_Anonymised_Dataset_2026.json' },
];

export default function OfficerReports() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const handleDownload = async (report: ReportItem) => {
    setDownloadingId(report.id);
    setDownloadMessage(null);
    try {
      await api.downloadReport(report.id, report.filename);
      setDownloadMessage(`Downloaded: ${report.filename}`);
    } catch {
      // Client-side fallback generation
      const csv = `Report Name: ${report.name}\nExported By: AICTE Central Directorate\nDate: 2026-10-22\nStatus: Official Regulatory Record\n`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setDownloadMessage(`Downloaded (Client Fallback): ${report.filename}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="National-level summaries for governance, policy, statutory filings, and regulatory oversight."
        breadcrumb={['AICTE Officer Portal', 'Reports']}
      />

      {/* Download Alert Banner */}
      {downloadMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-card flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadMessage}</span>
          </div>
          <button className="text-text-muted hover:text-text-primary" onClick={() => setDownloadMessage(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Charts row 1 */}
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

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="Cases by Type"
          subtitle="Distribution of open case types across all institutions"
          data={casesByTypeData.map(d => ({ ...d }))}
          height={220}
        />
        <BarChartComponent
          title="Enrolment by Region"
          subtitle="Regional distribution of submitted enrolment records"
          data={regionWiseData.map(d => ({ ...d, color: '#2F6FED' }))}
          height={220}
        />
      </div>

      {/* Downloadable Reports Grid */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-card-title text-text-primary">8 Statutory & Operational Reports</p>
            <p className="text-xs text-text-muted">Click Download on any report to generate and download file</p>
          </div>
          <span className="badge badge-success text-xs">AY 2026-27 Datasets Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 bg-canvas rounded-card border border-border flex items-start justify-between gap-4 hover:border-brand/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {r.type === 'JSON' ? (
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
                  <span className="badge badge-neutral text-xs">{r.type}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{r.desc}</p>
                <p className="text-xs text-text-muted mt-2">Updated: {r.updated}</p>
              </div>

              <button
                onClick={() => handleDownload(r)}
                disabled={downloadingId === r.id}
                className="btn btn-secondary btn-sm flex-shrink-0 text-xs self-center"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadingId === r.id ? 'Generating…' : 'Download'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

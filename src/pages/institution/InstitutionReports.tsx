import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrendChart } from '@/components/charts/AreaTrendChart';
import { BarChartComponent } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { institutionComplianceData } from '@/data/mockData';
import { api } from '@/api/client';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const programmeData = [
  { name: 'B.Tech CSE', value: 122 },
  { name: 'B.Tech ECE', value: 58 },
  { name: 'B.Tech Mech', value: 51 },
  { name: 'M.Tech AI', value: 28 },
];

const reports = [
  { id: 'REP-001', name: 'Enrolment Summary Report', desc: 'Total enrolment by programme and seat pool — AY 2026-27', updated: '20 Oct 2026', type: 'CSV' },
  { id: 'REP-003', name: 'Integrity Risk Status Report', desc: 'Open findings, resolved cases, and seat ledger snapshot', updated: '18 Oct 2026', type: 'CSV' },
  { id: 'REP-005', name: 'Batch Submission History Export', desc: 'All batches with row counts, acceptances, and errors', updated: '20 Oct 2026', type: 'CSV' },
  { id: 'REP-004', name: 'Trust Distribution & Proof Tier Audit', desc: 'Breakdown of L0–L4 records with verification evidence', updated: '15 Oct 2026', type: 'CSV' },
  { id: 'REP-002', name: 'Seat Ledger Reconciliation & Breaches', desc: 'Declared vs derived totals per pool — current cycle', updated: '20 Oct 2026', type: 'CSV' },
  { id: 'REP-008', name: 'Full Institution Audit Trail (SHA-256 Ledger)', desc: 'Cryptographic block chain events and tamper checks', updated: '22 Oct 2026', type: 'JSON' },
];

export default function InstitutionReports() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (reportId: string, name: string) => {
    setDownloadingId(reportId);
    try {
      await api.downloadReport(reportId, `${name.replace(/\s+/g, '_')}.csv`);
    } catch {
      // Fallback client-side synthetic CSV
      const dummyCsv = `Report: ${name}\nGenerated: ${new Date().toISOString()}\nInstitution: SIET Mumbai (INST-MH-0042)\nTotal Enrolled: 231\nApproved Intake: 240\nStatus: Active`;
      const blob = new Blob([dummyCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Institution Reports & Exports"
        subtitle="SIET Mumbai (INST-MH-0042) · Download statutory reports, enrolment reconciliations, and audit receipts."
        breadcrumb={['Institution Portal', 'Reports']}
        actions={
          <button
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            onClick={() => handleDownload('REP-001', 'SIET_Complete_Enrolment_Report')}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Download Master Enrolment Report
          </button>
        }
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            title="Submission Volume & Issue Telemetry"
            subtitle="Records submitted per cycle with issue count overlay"
            data={institutionComplianceData}
            lines={[
              { key: 'submissions', label: 'Submitted', color: '#6558D3' },
              { key: 'errors', label: 'Flagged', color: '#C53B45' },
            ]}
          />
        </div>
        <BarChartComponent
          title="Students by Programme"
          subtitle="Enrolled count per programme at SIET Mumbai"
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
            <h2 className="text-sm font-semibold text-text-primary mb-4">Statutory Downloadable Exports</h2>
            <div className="space-y-2">
              {reports.map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => handleDownload(r.id, r.name)}
                  className="flex items-center gap-3 p-3 rounded-card border border-border hover:bg-canvas transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center flex-shrink-0 text-brand">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">{r.name}</p>
                    <p className="text-xs text-text-muted">{r.desc} · Updated {r.updated}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-0.5 bg-canvas border border-border rounded font-mono">{r.type}</span>
                    <button
                      className="btn btn-secondary btn-sm text-xs flex items-center gap-1"
                      disabled={downloadingId === r.id}
                      onClick={(e) => { e.stopPropagation(); handleDownload(r.id, r.name); }}
                    >
                      {downloadingId === r.id ? (
                        'Generating…'
                      ) : (
                        <><Download className="w-3.5 h-3.5" /> Download</>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <DonutChart
          title="Pool Utilisation"
          subtitle="Claimed seats by pool category"
          data={[
            { name: 'REGULAR', value: 229, color: '#6558D3' },
            { name: 'NRI', value: 2, color: '#2F6FED' },
            { name: 'OCI', value: 0, color: '#198754' },
            { name: 'SUPERNUMERARY', value: 0, color: '#8791A5' },
          ]}
          centerLabel="Seats Claimed"
          centerValue={231}
          height={220}
        />
      </div>
    </div>
  );
}

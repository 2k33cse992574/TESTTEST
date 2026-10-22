import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { mockSubmissions } from '@/data/mockData';
import type { Submission } from '@/types';
import {
  Upload, FileText, CheckCircle2, XCircle, AlertCircle,
  CloudUpload, X, FilePlus,
} from 'lucide-react';

const instSubs = mockSubmissions.filter(s => s.institutionId === 'INST-MH-0042');

const columns: Column<Submission>[] = [
  { key: 'batchId', header: 'Batch ID', render: r => <span className="font-mono text-xs text-brand">{r.batchId}</span> },
  { key: 'submittedAt', header: 'Submitted', sortable: true, render: r => <span className="text-xs text-text-secondary">{new Date(r.submittedAt).toLocaleString('en-IN')}</span> },
  { key: 'totalRows', header: 'Total', sortable: true, render: r => <span className="tabular-nums font-semibold">{r.totalRows}</span> },
  { key: 'accepted', header: 'Accepted', render: r => <span className="tabular-nums text-emerald-600 font-medium">{r.accepted}</span> },
  { key: 'rejected', header: 'Rejected', render: r => <span className="tabular-nums text-danger font-medium">{r.rejected}</span> },
  { key: 'held', header: 'Held', render: r => <span className="tabular-nums text-amber-600 font-medium">{r.held}</span> },
  { key: 'policyVersion', header: 'Policy', render: r => <span className="text-xs text-text-muted">v{r.policyVersion}</span> },
  { key: 'status', header: 'Status', render: r => <StatusBadge type="submission" value={r.status} size="sm" /> },
];

type UploadStep = 'idle' | 'selected' | 'validating' | 'done';

export default function InstitutionSubmissions() {
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = () => {
    setUploadStep('selected');
    setTimeout(() => setUploadStep('validating'), 800);
    setTimeout(() => setUploadStep('done'), 2800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Submissions"
        subtitle="Upload student enrolment batches and track validation outcomes."
        breadcrumb={['Institution Portal', 'Submissions']}
        actions={
          <button className="btn btn-primary" onClick={simulateUpload}>
            <FilePlus className="w-4 h-4" /> New Submission
          </button>
        }
      />

      {/* Upload panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-4">Upload Enrolment Records</h2>

        <AnimatePresence mode="wait">
          {uploadStep === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`border-2 border-dashed rounded-card p-10 text-center transition-colors cursor-pointer
                ${isDragging ? 'border-brand bg-brand-soft/30' : 'border-border hover:border-brand hover:bg-brand-soft/10'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); simulateUpload(); }}
              onClick={simulateUpload}
            >
              <CloudUpload className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-text-primary mb-1">Drop your CSV or Excel file here</p>
              <p className="text-xs text-text-muted mb-4">
                Supported: .csv, .xlsx · Max size: 10 MB · Required columns: student_id, apaar_id, programme, pool_code, admission_date…
              </p>
              <div className="flex items-center justify-center gap-3">
                <button className="btn btn-primary btn-sm">
                  <Upload className="w-3.5 h-3.5" /> Select File
                </button>
                <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); simulateUpload(); }}>
                  Dry Run (preview only)
                </button>
              </div>
            </motion.div>
          )}

          {uploadStep === 'selected' && (
            <motion.div
              key="selected"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="border border-border rounded-card p-6 flex items-center gap-4"
            >
              <FileText className="w-8 h-8 text-brand flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">enrolment_batch_oct2026.csv</p>
                <p className="text-xs text-text-muted">2.4 MB · 245 rows detected</p>
                <div className="mt-3 progress-bar">
                  <motion.div
                    className="progress-fill bg-brand"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <button className="btn-icon" onClick={() => setUploadStep('idle')}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {uploadStep === 'validating' && (
            <motion.div
              key="validating"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="border border-border rounded-card p-6 space-y-3"
            >
              <p className="text-sm font-semibold text-text-primary">Running validation pipeline…</p>
              {[
                'Schema & type checks',
                'APAAR format verification',
                'Seat Ledger claim (dry run)',
                'Duplicate detection',
                'Integrity scoring',
              ].map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-3 text-xs"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full"
                  />
                  <span className="text-text-secondary">{step}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {uploadStep === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="border border-emerald-200 bg-emerald-50/50 rounded-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <p className="text-sm font-semibold text-text-primary">Submission complete — Batch BATCH-2901</p>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Total Rows', value: 245, color: 'text-text-primary' },
                  { label: 'Accepted',   value: 231, color: 'text-emerald-600' },
                  { label: 'Rejected',   value: 8,   color: 'text-danger' },
                  { label: 'Held',       value: 6,   color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-control text-xs text-amber-800 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">8 rows rejected — action required</p>
                  <p>3 invalid APAAR formats · 2 missing required fields · 3 duplicate student IDs in batch</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn btn-primary btn-sm">Download Error Report</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setUploadStep('idle')}>New Submission</button>
                <p className="text-xs text-text-muted ml-auto">Signed receipt issued · Policy v7</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submission history */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-4">Submission History</h2>
        <DataTable<Submission>
          columns={columns}
          data={instSubs}
          keyField="id"
          searchPlaceholder="Search submissions…"
          emptyMessage="No submissions found."
          pageSize={8}
        />
      </motion.div>
    </div>
  );
}

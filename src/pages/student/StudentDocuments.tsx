import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockDocuments } from '@/data/mockData';
import { format } from 'date-fns';
import { Upload, FileText, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  VERIFIED: CheckCircle2,
  UPLOADED: Clock,
  PENDING:  Clock,
  REJECTED: XCircle,
};
const iconColor: Record<string, string> = {
  VERIFIED: 'text-emerald-500',
  UPLOADED: 'text-blue-400',
  PENDING:  'text-amber-500',
  REJECTED: 'text-red-500',
};

export default function StudentDocuments() {
  const verified = mockDocuments.filter(d => d.status === 'VERIFIED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="My Documents"
        subtitle="Documents submitted and verified for your enrolment record."
        breadcrumb={['Student Portal', 'Documents']}
        actions={
          <button className="btn btn-primary btn-sm">
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: mockDocuments.length, color: 'text-text-primary' },
          { label: 'Verified', value: verified,             color: 'text-emerald-600' },
          { label: 'Pending',  value: mockDocuments.length - verified, color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card text-center py-4"
          >
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {mockDocuments.map((doc, i) => {
          const Icon = iconMap[doc.status] ?? FileText;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="card flex items-center gap-4 group hover:shadow-card-hover transition-all duration-standard"
            >
              <div className="w-10 h-10 bg-canvas rounded-card flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-text-secondary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-text-primary truncate">{doc.name}</p>
                  <StatusBadge type="document" value={doc.status} size="sm" />
                </div>
                <p className="text-xs text-text-muted">{doc.type}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Uploaded {format(new Date(doc.uploadedAt), 'd MMM yyyy')}
                  {doc.verifiedAt && ` · Verified ${format(new Date(doc.verifiedAt), 'd MMM yyyy')}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Icon className={`w-4 h-4 ${iconColor[doc.status]}`} />
                <button className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upload guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card border-dashed border-2 border-border hover:border-brand transition-colors cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <Upload className="w-8 h-8 text-text-muted" />
          <p className="text-sm font-semibold text-text-primary">Upload a new document</p>
          <p className="text-xs text-text-muted">PDF, JPG, PNG up to 5 MB. Documents are reviewed by your institution.</p>
          <button className="btn btn-secondary btn-sm mt-1">Select file</button>
        </div>
      </motion.div>
    </div>
  );
}

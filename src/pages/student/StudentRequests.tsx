import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MessageSquarePlus, CheckCircle2, Info } from 'lucide-react';

const requests = [
  { id: 'R-001', type: 'Clarification',     title: 'Category Certificate — Pending Verification', status: 'Awaiting Review', date: '15 Sep 2026', detail: 'Your category certificate has been uploaded and is awaiting officer review.' },
  { id: 'R-002', type: 'Correction',         title: 'Mobile number update request',               status: 'Resolved',       date: '02 Aug 2026', detail: 'Mobile number updated successfully. Change recorded and audited.' },
];

const statusStyle: Record<string, string> = {
  'Awaiting Review': 'badge-warning',
  'Resolved':        'badge-success',
  'Open':            'badge-info',
};

export default function StudentRequests() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Requests"
        subtitle="Track clarification requests and corrections related to your record."
        breadcrumb={['Student Portal', 'Requests']}
        actions={
          <button className="btn btn-primary btn-sm">
            <MessageSquarePlus className="w-3.5 h-3.5" /> New Request
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800"
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Requests are reviewed by your institution or an authorised AICTE officer.
          You will be notified when a response is recorded. All requests and outcomes are audited.
        </p>
      </motion.div>

      <div className="space-y-3">
        {requests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide">{req.type}</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{req.title}</p>
              </div>
              <span className={`${statusStyle[req.status] ?? 'badge-neutral'} flex-shrink-0`}>{req.status}</span>
            </div>
            <p className="text-xs text-text-secondary">{req.detail}</p>
            <p className="text-xs text-text-muted mt-2">Submitted: {req.date} · Ref: {req.id}</p>
          </motion.div>
        ))}
      </div>

      {/* Empty state if no requests */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card flex flex-col items-center justify-center py-10 text-center gap-3"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-300" />
        <p className="text-sm font-semibold text-text-primary">No open requests</p>
        <p className="text-xs text-text-muted max-w-xs">
          You have no pending actions. If you notice an error in your record, raise a correction request.
        </p>
        <button className="btn btn-secondary btn-sm">Raise a Request</button>
      </motion.div>
    </div>
  );
}

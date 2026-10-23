import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockTimeline } from '@/data/mockData';
import { api } from '@/api/client';
import {
  MessageSquarePlus, CheckCircle2, Info, X, ChevronRight,
  Clock, AlertCircle, FileText, Send, Upload,
} from 'lucide-react';

interface Request {
  id: string; type: string; title: string;
  status: 'Awaiting Review' | 'Resolved' | 'Open' | 'Rejected';
  date: string; detail: string; response?: string;
}

const INITIAL_REQUESTS: Request[] = [
  {
    id: 'R-001', type: 'Clarification', title: 'Category Certificate — Pending Verification',
    status: 'Awaiting Review', date: '15 Sep 2026',
    detail: 'Category certificate uploaded on 15 Sep 2026. Awaiting officer review and verification.',
  },
  {
    id: 'R-002', type: 'Correction', title: 'Mobile number update request',
    status: 'Resolved', date: '02 Aug 2026',
    detail: 'Requested update to registered mobile number from +91-98XX-XXXX12 to +91-98XX-XXXX77.',
    response: 'Mobile number updated successfully on 05 Aug 2026. Change recorded in audit log. Ref: AUDIT-7821.',
  },
];

const REQUEST_TYPES = [
  { value: 'CORRECTION',     label: 'Data Correction',      desc: 'Fix incorrect name, DOB, or contact details' },
  { value: 'CLARIFICATION',  label: 'Clarification Request', desc: 'Ask about a finding or case on your record' },
  { value: 'DOCUMENT',       label: 'Document Issue',        desc: 'Re-submit or dispute a document verification' },
  { value: 'APPEAL',         label: 'Appeal a Decision',     desc: 'Contest an AICTE officer decision on your record' },
  { value: 'OTHER',          label: 'Other',                 desc: 'Any other query about your record' },
];

const statusStyle: Record<string, string> = {
  'Awaiting Review': 'badge-warning',
  'Resolved':        'badge-success',
  'Open':            'badge-info',
  'Rejected':        'badge-danger',
};

const statusIcon: Record<string, React.ElementType> = {
  'Awaiting Review': Clock,
  'Resolved':        CheckCircle2,
  'Open':            AlertCircle,
  'Rejected':        AlertCircle,
};

// ── New Request Modal ─────────────────────────────────────────────
function NewRequestModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Request) => void }) {
  const [step,        setStep]        = useState<'type' | 'form' | 'review' | 'done'>('type');
  const [reqType,     setReqType]     = useState('');
  const [field,       setField]       = useState('');
  const [currentVal,  setCurrentVal]  = useState('');
  const [correctVal,  setCorrectVal]  = useState('');
  const [description, setDescription] = useState('');
  const [attachFile,  setAttachFile]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const selectedType = REQUEST_TYPES.find(r => r.value === reqType);

  const handleSubmit = () => {
    setSubmitting(true);
    const newReq: Request = {
      id: `R-00${Math.floor(Math.random() * 900 + 100)}`,
      type: selectedType?.label ?? reqType,
      title: field ? `${selectedType?.label}: ${field}` : description.slice(0, 60),
      status: 'Awaiting Review',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      detail: description,
    };
    api.createStudentRequest({
      studentId: 's1',
      type: newReq.type,
      title: newReq.title,
      detail: newReq.detail,
    }).then(res => {
      if (res?.request?.id) newReq.id = res.request.id;
    }).catch(() => {});

    setTimeout(() => {
      setSubmitting(false);
      setStep('done');
      onSubmit(newReq);
    }, 1200);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={step === 'type' ? onClose : undefined} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-surface rounded-panel shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-text-primary">New Request</p>
              <div className="flex items-center gap-2 mt-1">
                {['type','form','review','done'].map((s, i) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all ${
                    ['type','form','review','done'].indexOf(step) >= i
                      ? 'bg-brand flex-[2]' : 'bg-border flex-1'
                  }`} />
                ))}
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>

          <div className="p-6">
            {/* Step 1: type */}
            {step === 'type' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <p className="text-xs text-text-muted mb-4">What kind of request would you like to raise?</p>
                {REQUEST_TYPES.map(rt => (
                  <button key={rt.value} onClick={() => { setReqType(rt.value); setStep('form'); }}
                    className="w-full text-left p-3 rounded-card border border-border hover:border-brand hover:bg-brand-soft/10 transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{rt.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{rt.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: form */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-2.5 bg-brand-soft/30 rounded-control">
                  <p className="text-xs font-semibold text-brand">{selectedType?.label}</p>
                </div>

                {reqType === 'CORRECTION' && (
                  <>
                    <div>
                      <label className="label">Field to correct</label>
                      <select className="input" value={field} onChange={e => setField(e.target.value)}>
                        <option value="">Select field…</option>
                        <option>Full Name</option>
                        <option>Date of Birth</option>
                        <option>Mobile Number</option>
                        <option>Email Address</option>
                        <option>Category</option>
                        <option>Admission Date</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Current (incorrect) value</label>
                      <input className="input" placeholder="What is currently shown?" value={currentVal} onChange={e => setCurrentVal(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Correct value</label>
                      <input className="input" placeholder="What should it be?" value={correctVal} onChange={e => setCorrectVal(e.target.value)} />
                    </div>
                  </>
                )}

                <div>
                  <label className="label">Description{reqType !== 'CORRECTION' ? ' (required)' : ' (optional)'}</label>
                  <textarea className="input h-24 resize-none" placeholder="Provide as much detail as possible to help the reviewer…"
                    value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div>
                  <label className="label">Supporting document (optional)</label>
                  <div
                    className="border border-dashed border-border rounded-card p-4 text-center cursor-pointer hover:border-brand hover:bg-brand-soft/10 transition-colors"
                    onClick={() => setAttachFile('supporting_doc.pdf')}
                  >
                    {attachFile
                      ? <div className="flex items-center justify-center gap-2 text-xs text-brand">
                          <FileText className="w-4 h-4" /> {attachFile}
                          <button className="text-text-muted hover:text-danger" onClick={e => { e.stopPropagation(); setAttachFile(''); }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      : <div className="text-xs text-text-muted">
                          <Upload className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                          Click to attach a file
                        </div>}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="btn btn-secondary flex-1" onClick={() => setStep('type')}>Back</button>
                  <button className="btn btn-primary flex-1"
                    disabled={reqType === 'CORRECTION' ? !field || !correctVal : !description.trim()}
                    onClick={() => setStep('review')}>
                    Review Request
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: review */}
            {step === 'review' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <p className="text-sm font-semibold text-text-primary">Review before submitting</p>
                <div className="p-4 bg-canvas rounded-card border border-border space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-text-muted">Type</span><span className="font-semibold text-text-primary">{selectedType?.label}</span></div>
                  {field && <div className="flex justify-between"><span className="text-text-muted">Field</span><span className="font-semibold text-text-primary">{field}</span></div>}
                  {currentVal && <div className="flex justify-between"><span className="text-text-muted">Current</span><span className="text-danger">{currentVal}</span></div>}
                  {correctVal && <div className="flex justify-between"><span className="text-text-muted">Corrected</span><span className="text-emerald-600 font-semibold">{correctVal}</span></div>}
                  {description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-text-muted mb-1">Description</p>
                      <p className="text-text-primary">{description}</p>
                    </div>
                  )}
                  {attachFile && <div className="flex justify-between"><span className="text-text-muted">Attachment</span><span className="text-brand">{attachFile}</span></div>}
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <p>Requests are reviewed by your institution or an AICTE officer. You cannot modify a submitted request — raise a new one if needed. All requests are audited.</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={() => setStep('form')}>Edit</button>
                  <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      : <><Send className="w-3.5 h-3.5" /> Submit Request</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: done */}
            {step === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <p className="text-base font-bold text-text-primary">Request submitted</p>
                <p className="text-xs text-text-secondary">Your request has been logged and assigned. You will be notified when a response is recorded.</p>
                <div className="p-3 bg-canvas border border-border rounded-card text-xs text-text-muted text-left">
                  <p>Reference: <span className="font-mono font-semibold text-brand">R-{Math.floor(Math.random() * 900 + 100)}</span></p>
                  <p className="mt-0.5">Submitted: {new Date().toLocaleString('en-IN')}</p>
                </div>
                <button className="btn btn-primary w-full" onClick={onClose}>Done</button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Request detail panel ─────────────────────────────────────────
function RequestDetail({ req, onClose }: { req: Request; onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-text-muted">{req.id}</p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">{req.type}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className={`badge text-xs ${statusStyle[req.status]}`}>{req.status}</span>
          </div>
          <div>
            <p className="label mb-1">Title</p>
            <p className="text-sm font-semibold text-text-primary">{req.title}</p>
          </div>
          <div>
            <p className="label mb-1">Description</p>
            <p className="text-sm text-text-secondary leading-relaxed">{req.detail}</p>
          </div>
          <div>
            <p className="label mb-1">Submitted</p>
            <p className="text-sm text-text-primary">{req.date}</p>
          </div>
          {req.response && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card">
              <p className="text-xs font-semibold text-emerald-800 mb-2">Officer Response</p>
              <p className="text-xs text-emerald-700">{req.response}</p>
            </div>
          )}
          <div>
            <p className="label mb-3">Timeline</p>
            <ActivityTimeline events={mockTimeline.slice(0, 3)} />
          </div>
          {req.status !== 'Resolved' && (
            <div className="space-y-2 pt-2 border-t border-border">
              <button className="btn btn-secondary w-full"><FileText className="w-3.5 h-3.5" /> Add Follow-up</button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function StudentRequests() {
  const [requests,    setRequests]    = useState<Request[]>(INITIAL_REQUESTS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selected,    setSelected]    = useState<Request | null>(null);

  useEffect(() => {
    api.getStudentRequests('s1')
      .then(res => {
        if (res?.requests && res.requests.length) {
          setRequests(res.requests);
        }
      })
      .catch(() => {});
  }, []);

  const open     = requests.filter(r => r.status !== 'Resolved').length;
  const resolved = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Requests"
        subtitle="Raise and track correction requests, clarifications, and appeals."
        breadcrumb={['Student Portal', 'Requests']}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewForm(true)}>
            <MessageSquarePlus className="w-3.5 h-3.5" /> New Request
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: requests.length, color: 'text-text-primary' },
          { label: 'Open',     value: open,            color: 'text-amber-600' },
          { label: 'Resolved', value: resolved,        color: 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Info banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Requests are reviewed by your institution or an authorised AICTE officer. All requests and outcomes are audited and cannot be deleted. You will be notified when a response is recorded.</p>
      </motion.div>

      {/* Request list */}
      <div className="space-y-3">
        {requests.map((req, i) => {
          const Icon = statusIcon[req.status] ?? AlertCircle;
          return (
            <motion.div key={req.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.07 }}
              className="card hover:shadow-card-hover cursor-pointer transition-all group"
              onClick={() => setSelected(req)}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-card flex items-center justify-center flex-shrink-0 ${
                  req.status === 'Resolved' ? 'bg-emerald-50' :
                  req.status === 'Rejected' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <Icon className={`w-4 h-4 ${
                    req.status === 'Resolved' ? 'text-emerald-500' :
                    req.status === 'Rejected' ? 'text-danger' : 'text-amber-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs text-text-muted uppercase tracking-wide">{req.type}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs font-mono text-text-muted">{req.id}</span>
                    <span className={`badge text-xs ${statusStyle[req.status]}`}>{req.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-0.5">{req.title}</p>
                  <p className="text-xs text-text-secondary line-clamp-2">{req.detail}</p>
                  <p className="text-xs text-text-muted mt-1.5">Submitted: {req.date}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {requests.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card flex flex-col items-center justify-center py-12 text-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          <p className="text-sm font-semibold text-text-primary">No requests yet</p>
          <p className="text-xs text-text-muted max-w-xs">If you notice an error in your record, raise a correction request.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNewForm(true)}>Raise a Request</button>
        </motion.div>
      )}

      <AnimatePresence>
        {showNewForm && (
          <NewRequestModal
            onClose={() => setShowNewForm(false)}
            onSubmit={(r) => { setRequests(prev => [r, ...prev]); setShowNewForm(false); }}
          />
        )}
        {selected && <RequestDetail req={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

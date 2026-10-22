import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockTimeline, mockDocuments } from '@/data/mockData';
import {
  CheckCircle2, Clock, QrCode, ShieldCheck, AlertCircle,
  X, Eye, Bell, ArrowRight, FileCheck, Shield, Lock,
  Building2, GraduationCap, Zap, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const metrics = [
  { label: 'Enrolment Status',   value: 'Enrolled',  sublabel: 'AY 2026-27 · B.Tech CSE', color: 'success' as const },
  { label: 'Trust Level',        value: 'L3',        sublabel: 'Cross-Checked · 3 of 4',  color: 'brand'   as const },
  { label: 'Open Requests',      value: 1,           sublabel: '1 awaiting review',        color: 'warning' as const },
  { label: 'Documents Verified', value: 4,           sublabel: '2 pending · 6 total',      color: 'info'    as const },
];

const NOTIFICATIONS = [
  { id: 'n1', title: 'Category certificate pending',  detail: 'Your certificate has been uploaded and is awaiting officer review.',      time: '2 days ago',  read: false, type: 'warning' as const },
  { id: 'n2', title: 'Trust level upgraded to L3',    detail: 'Your record has been cross-checked and promoted to L3 by AICTE officer.', time: '17 Oct 2026', read: true,  type: 'success' as const },
  { id: 'n3', title: 'TCS Recruitment verified you',  detail: 'Employer verification completed. 3 fields shared with your consent.',     time: '15 Oct 2026', read: true,  type: 'info'    as const },
];

const typeColor = { warning: 'bg-amber-50 border-amber-200 text-amber-800', success: 'bg-emerald-50 border-emerald-200 text-emerald-800', info: 'bg-blue-50 border-blue-200 text-blue-800' };

// ── Wallet QR Modal ──────────────────────────────────────────────
function WalletQRModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]         = useState<'select' | 'consent' | 'qr' | 'revoke'>('select');
  const [fields, setFields]     = useState<string[]>(['degree', 'institution', 'year']);
  const [purpose, setPurpose]   = useState('EMPLOYMENT');
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking]    = useState(false);
  const [revoked,  setRevoked]     = useState(false);

  const allFields = [
    { key: 'degree',       label: 'Degree / Programme' },
    { key: 'institution',  label: 'Institution name' },
    { key: 'year',         label: 'Graduation / Enrolment year' },
    { key: 'status',       label: 'Enrolment status' },
    { key: 'apaar_masked', label: 'Masked APAAR reference' },
    { key: 'mode',         label: 'Mode (Full-Time / Part-Time)' },
  ];

  const toggle = (k: string) =>
    setFields(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setStep('qr'); }, 1800);
  };

  const doRevoke = () => {
    setRevoking(true);
    setTimeout(() => { setRevoking(false); setRevoked(true); }, 1200);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-surface rounded-panel shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-soft rounded-card flex items-center justify-center">
                <QrCode className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Verifiable Credential</p>
                <p className="text-xs text-text-muted">Pramaan Consent Handshake</p>
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>

          <div className="p-6">
            {/* Step: select fields */}
            {step === 'select' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <p className="label mb-1">Verification purpose</p>
                  <select className="input" value={purpose} onChange={e => setPurpose(e.target.value)}>
                    <option value="EMPLOYMENT">Employment background check</option>
                    <option value="EDUCATION">Further education admission</option>
                    <option value="SCHOLARSHIP">Scholarship application</option>
                    <option value="REGULATORY">Regulatory / Government</option>
                  </select>
                </div>
                <div>
                  <p className="label mb-2">Fields to share with verifier</p>
                  <div className="space-y-2">
                    {allFields.map(f => (
                      <label key={f.key} className="flex items-center gap-3 p-2.5 rounded-card border border-border hover:bg-canvas cursor-pointer transition-colors">
                        <input type="checkbox" checked={fields.includes(f.key)} onChange={() => toggle(f.key)}
                          className="w-4 h-4 accent-brand rounded" />
                        <span className="text-sm text-text-primary">{f.label}</span>
                        {['degree','institution','year'].includes(f.key) && (
                          <span className="ml-auto text-xs text-text-muted">Recommended</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <p>Your APAAR ID is never shared directly. Verifiers cannot search or enumerate — they only see a minimal result for this specific request.</p>
                </div>
                <button className="btn btn-primary w-full" disabled={fields.length === 0}
                  onClick={() => setStep('consent')}>
                  Review & Generate QR <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* Step: consent review */}
            {step === 'consent' && (
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="p-4 bg-canvas rounded-card border border-border space-y-2">
                  <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">Consent Summary</p>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Purpose</span><span className="font-semibold text-text-primary">{purpose}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Fields shared</span><span className="font-semibold text-text-primary">{fields.length} selected</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">QR validity</span><span className="font-semibold text-text-primary">60 seconds</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-muted">Uses allowed</span><span className="font-semibold text-text-primary">Single use</span></div>
                </div>
                <div className="space-y-1.5">
                  {fields.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {allFields.find(af => af.key === f)?.label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={() => setStep('select')}>Edit</button>
                  <button className="btn btn-primary flex-1" onClick={generate} disabled={generating}>
                    {generating
                      ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      : <><Zap className="w-3.5 h-3.5" /> Confirm & Generate</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: QR shown */}
            {step === 'qr' && !revoked && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <p className="text-xs text-text-muted">Show this QR to the verifier. It expires in 60 seconds.</p>
                {/* Animated QR placeholder */}
                <div className="w-48 h-48 mx-auto bg-canvas rounded-card border-2 border-border flex items-center justify-center relative overflow-hidden">
                  <div className="grid grid-cols-8 gap-0.5 opacity-80">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-text-primary' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-brand/20 to-transparent"
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ height: '30%' }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                  <motion.div className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  Single-use · Device-bound · {purpose}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={() => { setStep('select'); setRevoked(false); }}>
                    New QR
                  </button>
                  <button className="btn btn-danger flex-1" onClick={doRevoke} disabled={revoking}>
                    {revoking
                      ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-red-200 border-t-danger rounded-full" />
                      : <><XCircle className="w-3.5 h-3.5" /> Revoke</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step: revoked */}
            {revoked && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Credential revoked</p>
                <p className="text-xs text-text-secondary">Any further scan of this QR will return <span className="font-mono font-semibold">REVOKED</span>. The access log has been updated.</p>
                <button className="btn btn-primary w-full" onClick={() => { setStep('select'); setRevoked(false); }}>
                  Generate New Credential
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Access Log Modal ─────────────────────────────────────────────
function AccessLogModal({ onClose }: { onClose: () => void }) {
  const logs = [
    { id: 'AL-001', verifier: 'TCS Recruitment',         purpose: 'EMPLOYMENT',    outcome: 'VALID',   fields: ['degree','institution','year'], at: '15 Oct 2026 · 14:22' },
    { id: 'AL-002', verifier: 'Infosys HR',              purpose: 'EMPLOYMENT',    outcome: 'VALID',   fields: ['degree','institution'],        at: '12 Oct 2026 · 09:10' },
    { id: 'AL-003', verifier: 'Unknown scan attempt',    purpose: '—',             outcome: 'DENIED',  fields: [],                              at: '10 Oct 2026 · 20:45' },
    { id: 'AL-004', verifier: 'State Education Dept.',   purpose: 'SCHOLARSHIP',   outcome: 'REVOKED', fields: [],                              at: '05 Oct 2026 · 11:00' },
  ];

  const outcomeStyle: Record<string, string> = {
    VALID: 'badge-success', DENIED: 'badge-warning', REVOKED: 'badge-danger',
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg bg-surface rounded-panel shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-text-primary">Verification Access Log</p>
              <p className="text-xs text-text-muted">Every time someone verified your credential</p>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {logs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-3 rounded-card border border-border hover:bg-canvas transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">{log.verifier}</p>
                  <span className={`badge text-xs ${outcomeStyle[log.outcome]}`}>{log.outcome}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{log.purpose}</span>
                  <span>·</span>
                  <span>{log.at}</span>
                </div>
                {log.fields.length > 0 && (
                  <p className="text-xs text-text-secondary mt-1.5">
                    Shared: {log.fields.join(', ')}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border bg-canvas rounded-b-panel">
            <p className="text-xs text-text-muted">
              You can revoke consent at any time from the "Verifiable Credential" section. Revocation takes effect immediately for all online verifiers.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function StudentOverview() {
  const navigate = useNavigate();
  const [showWallet,    setShowWallet]    = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [showNotif,     setShowNotif]     = useState(false);

  const verifiedDocs = mockDocuments.filter(d => d.status === 'VERIFIED').length;
  const unread       = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="My Academic Overview"
        subtitle="Your enrolment status, trust level, and credential at a glance."
        breadcrumb={['Student Portal', 'Overview']}
        demo
        actions={
          <div className="relative">
            <button
              className="btn-icon relative"
              onClick={() => setShowNotif(s => !s)}
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger border-2 border-surface" />
              )}
            </button>
            <AnimatePresence>
              {showNotif && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-card shadow-dropdown z-40">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">Notifications</p>
                      {unread > 0 && <span className="badge badge-info text-xs">{unread} new</span>}
                    </div>
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} className={`px-4 py-3 text-xs hover:bg-canvas cursor-pointer transition-colors ${!n.read ? 'bg-brand-soft/20' : ''}`}>
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1 flex-shrink-0" />}
                            <div className={!n.read ? '' : 'ml-3.5'}>
                              <p className="font-semibold text-text-primary">{n.title}</p>
                              <p className="text-text-secondary mt-0.5">{n.detail}</p>
                              <p className="text-text-muted mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => <MetricCard key={i} {...m} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolment record */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="card lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Enrolment Record</h2>
            <StatusBadge type="enrolment" value="ENROLLED" />
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {[
              ['Student Reference','STU-***-4821'], ['APAAR ID','1234-****-****'],
              ['Institution','SIET Mumbai'],        ['Programme','B.Tech CSE'],
              ['Academic Year','2026-27'],           ['Pool','REGULAR (Slot 47)'],
              ['Admission Date','1 Aug 2026'],       ['Mode','Full-Time'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-medium text-text-primary">{val}</p>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Trust Level</p>
            <TrustLadder level={3} showLabel />
            <p className="text-xs text-text-muted mt-2">
              Verified against APAAR, seat claimed, identity cross-checked. Reach L4 with annual institution affirmation.
            </p>
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="card space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Status Checklist</h2>
          {[
            { icon: CheckCircle2, color: 'text-emerald-500', label: 'APAAR ID verified',        done: true  },
            { icon: CheckCircle2, color: 'text-emerald-500', label: 'Seat claim successful',    done: true  },
            { icon: CheckCircle2, color: 'text-emerald-500', label: 'Identity cross-checked',   done: true  },
            { icon: Clock,        color: 'text-amber-500',   label: 'Category cert pending',    done: false },
            { icon: AlertCircle,  color: 'text-blue-400',    label: 'L4 certification (annual)',done: false },
          ].map(({ icon: Icon, color, label, done }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className={`w-4 h-4 flex-shrink-0 ${done ? color : 'text-text-muted'}`} />
              <span className={done ? 'text-text-primary' : 'text-text-secondary'}>{label}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-text-muted mb-2">Documents ({verifiedDocs}/{mockDocuments.length} verified)</p>
            <div className="progress-bar">
              <motion.div className="progress-fill bg-emerald-500" initial={{ width: 0 }}
                animate={{ width: `${(verifiedDocs / mockDocuments.length) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }} />
            </div>
          </div>
          <button className="btn btn-secondary w-full text-xs" onClick={() => navigate('/student/documents')}>
            <Eye className="w-3.5 h-3.5" /> View Documents
          </button>
        </motion.div>
      </div>

      {/* Verifiable Credential panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="card bg-gradient-to-r from-brand-soft/40 to-surface border-brand/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-card bg-brand flex items-center justify-center flex-shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-text-primary">Verifiable Credential</h2>
              <span className="badge badge-success text-xs">L3 Active</span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Share your academic credential with employers through the Pramaan Consent Handshake.
              Choose exactly which fields to share, generate a one-time QR, and revoke anytime.
              Your APAAR ID is never exposed.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary btn-sm" onClick={() => setShowWallet(true)}>
                <QrCode className="w-3.5 h-3.5" /> Generate Wallet QR
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAccessLog(true)}>
                <FileCheck className="w-3.5 h-3.5" /> View Access Log
              </button>
            </div>
          </div>
          <div className="hidden sm:flex w-20 h-20 bg-surface/80 border border-border rounded-card items-center justify-center flex-shrink-0 cursor-pointer hover:bg-canvas transition-colors"
            onClick={() => setShowWallet(true)}>
            <QrCode className="w-10 h-10 text-brand" />
          </div>
        </div>
      </motion.div>

      {/* Recent notifications inline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
        className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Recent Notifications</h2>
          {unread > 0 && <span className="badge badge-info text-xs">{unread} unread</span>}
        </div>
        <div className="space-y-2">
          {NOTIFICATIONS.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-card border transition-colors ${!n.read ? 'bg-brand-soft/20 border-brand/20' : 'border-border hover:bg-canvas'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{n.detail}</p>
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">{n.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
        className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Record Timeline</h2>
        <ActivityTimeline events={mockTimeline} maxItems={7} />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showWallet    && <WalletQRModal    onClose={() => setShowWallet(false)} />}
        {showAccessLog && <AccessLogModal   onClose={() => setShowAccessLog(false)} />}
      </AnimatePresence>
    </div>
  );
}

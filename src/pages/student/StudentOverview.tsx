import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockTimeline } from '@/data/mockData';
import { useStudent } from '@/context/StudentContext';
import QRCode from 'qrcode';
import {
  CheckCircle2, Clock, QrCode, ShieldCheck, AlertCircle, X,
  Eye, Bell, ArrowRight, FileCheck, Shield, Zap, XCircle,
  Copy, ExternalLink, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NOTIFS = [
  { id: 'n1', title: 'Category certificate pending',  detail: 'Uploaded and awaiting officer review.',             time: '2 days ago',  read: false, type: 'warning' as const },
  { id: 'n2', title: 'Trust level upgraded to L3',    detail: 'Cross-checked and promoted by AICTE officer.',     time: '17 Oct 2026', read: true,  type: 'success' as const },
  { id: 'n3', title: 'TCS Recruitment verified you',  detail: '3 fields shared with your consent.',               time: '15 Oct 2026', read: true,  type: 'info'    as const },
];

// ── Countdown hook ───────────────────────────────────────────────
function useCountdown(expireUnix: number | null) {
  const [secs, setSecs] = useState<number>(0);
  useEffect(() => {
    if (!expireUnix) return;
    const tick = () => setSecs(Math.max(0, expireUnix - Math.floor(Date.now() / 1000)));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expireUnix]);
  return secs;
}

// ── Real QR Modal ────────────────────────────────────────────────
function WalletQRModal({ onClose }: { onClose: () => void }) {
  const { activeCredential, credentialRevoked, issueCredential, revokeCredential, accessLog } = useStudent();
  const [step,      setStep]      = useState<'select' | 'consent' | 'qr'>('select');
  const [fields,    setFields]    = useState<string[]>(['degree', 'institution', 'year']);
  const [purpose,   setPurpose]   = useState('EMPLOYMENT');
  const [generating,setGenerating]= useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [revoking,  setRevoking]  = useState(false);
  const [copied,    setCopied]    = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const secsLeft = useCountdown(activeCredential?.exp ?? null);

  const FIELDS = [
    { key: 'degree',       label: 'Degree / Programme',       hint: 'B.Tech CSE'        },
    { key: 'institution',  label: 'Institution name',         hint: 'SIET Mumbai'        },
    { key: 'year',         label: 'Academic year',            hint: '2026-27'            },
    { key: 'status',       label: 'Enrolment status',         hint: 'ENROLLED'           },
    { key: 'apaar_masked', label: 'Masked APAAR reference',   hint: '1234-****-****'     },
    { key: 'mode',         label: 'Mode',                     hint: 'Full-Time'          },
  ];

  const toggle = (k: string) =>
    setFields(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);

  const generate = async () => {
    setGenerating(true);
    const cred = await issueCredential(purpose, fields);
    // Build a real JWT-like payload string for QR encoding
    const header = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(cred));
    const sig     = btoa(`pramaan-demo-sig-${cred.credId}`); // demo signature
    const token   = `${header}.${payload}.${sig}`;
    const verifyUrl = `${window.location.origin}/verify?token=${cred.credId}&t=${cred.iat}`;
    try {
      // Generate a REAL scannable QR code pointing to the verification URL
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 256, margin: 2,
        color: { dark: '#172033', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl('');
    }
    setGenerating(false);
    setStep('qr');
  };

  const doRevoke = () => {
    setRevoking(true);
    setTimeout(() => { setRevoking(false); revokeCredential(); }, 900);
  };

  const copyToken = () => {
    if (!activeCredential) return;
    const header  = btoa(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(activeCredential));
    const sig     = btoa(`pramaan-demo-sig-${activeCredential.credId}`);
    navigator.clipboard.writeText(`${header}.${payload}.${sig}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const expired = secsLeft === 0 && !!activeCredential;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div className="w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-panel shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
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

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 p-5">
            <AnimatePresence mode="wait">

              {/* Step 1: select fields */}
              {step === 'select' && (
                <motion.div key="select" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                  <div>
                    <label className="label">Purpose</label>
                    <select className="input" value={purpose} onChange={e => setPurpose(e.target.value)}>
                      <option value="EMPLOYMENT">Employment background check</option>
                      <option value="EDUCATION">Further education admission</option>
                      <option value="SCHOLARSHIP">Scholarship application</option>
                      <option value="REGULATORY">Regulatory / Government</option>
                    </select>
                  </div>
                  <div>
                    <p className="label mb-2">Fields to share</p>
                    <div className="space-y-2">
                      {FIELDS.map(f => (
                        <label key={f.key} className={`flex items-center gap-3 p-2.5 rounded-card border cursor-pointer transition-all
                          ${fields.includes(f.key) ? 'border-brand bg-brand-soft/20' : 'border-border hover:bg-canvas'}`}>
                          <input type="checkbox" checked={fields.includes(f.key)} onChange={() => toggle(f.key)}
                            className="w-4 h-4 accent-brand" />
                          <div className="flex-1">
                            <p className="text-sm text-text-primary font-medium">{f.label}</p>
                            <p className="text-xs text-text-muted">{f.hint}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p>Your APAAR ID is never shared directly. Verifiers cannot enumerate. Single-use QR expires in 60 seconds.</p>
                  </div>
                  <button className="btn btn-primary w-full" disabled={fields.length === 0} onClick={() => setStep('consent')}>
                    Review Consent <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: consent review */}
              {step === 'consent' && (
                <motion.div key="consent" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                  <div className="p-4 bg-canvas rounded-card border border-border space-y-2">
                    <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">Consent Summary</p>
                    {[
                      ['Purpose',      purpose],
                      ['Fields shared',`${fields.length} of ${FIELDS.length}`],
                      ['QR validity',  '60 seconds from generation'],
                      ['Uses allowed', 'Single-use, device-bound'],
                      ['Issuer',       'pramaan.aicte.gov.in'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-text-muted">{k}</span>
                        <span className="font-semibold text-text-primary">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {fields.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {FIELDS.find(af => af.key === f)?.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary flex-1" onClick={() => setStep('select')}>Edit</button>
                    <button className="btn btn-primary flex-1" onClick={generate} disabled={generating}>
                      {generating
                        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        : <><Zap className="w-3.5 h-3.5" /> Generate QR</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: REAL QR code */}
              {step === 'qr' && (
                <motion.div key="qr" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  {credentialRevoked ? (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-danger" />
                      </div>
                      <p className="text-sm font-semibold text-text-primary">Credential revoked</p>
                      <p className="text-xs text-text-secondary">This QR is now invalid. Any scan returns <span className="font-mono font-semibold text-danger">REVOKED</span>. Access log updated.</p>
                      <button className="btn btn-primary w-full" onClick={() => { setStep('select'); }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Generate New Credential
                      </button>
                    </motion.div>
                  ) : expired ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-4">
                      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                        <Clock className="w-7 h-7 text-amber-500" />
                      </div>
                      <p className="text-sm font-semibold text-text-primary">QR expired</p>
                      <p className="text-xs text-text-secondary">This credential is no longer valid. Generate a new one.</p>
                      <button className="btn btn-primary w-full" onClick={() => setStep('select')}>
                        <RefreshCw className="w-3.5 h-3.5" /> New QR
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-text-muted mb-3">Show to verifier — expires in</p>
                        <div className="relative inline-block">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Verifiable Credential QR" className="w-52 h-52 mx-auto rounded-card border border-border shadow-card" />
                          ) : (
                            <div className="w-52 h-52 mx-auto rounded-card border border-border bg-canvas flex items-center justify-center">
                              <QrCode className="w-16 h-16 text-text-muted" />
                            </div>
                          )}
                          {/* Countdown overlay ring */}
                          <motion.div
                            className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: secsLeft > 20 ? '#198754' : secsLeft > 10 ? '#B7791F' : '#C53B45', color: 'white' }}
                            animate={{ scale: secsLeft <= 10 ? [1, 1.15, 1] : 1 }}
                            transition={{ duration: 0.5, repeat: secsLeft <= 10 ? Infinity : 0 }}
                          >
                            {secsLeft}s
                          </motion.div>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-text-muted">
                          <motion.div className="w-2 h-2 rounded-full bg-emerald-500"
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                          <span>{purpose} · {fields.length} fields · Single-use</span>
                        </div>
                      </div>

                      {/* Credential details */}
                      {activeCredential && (
                        <div className="p-3 bg-canvas rounded-card border border-border text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Credential ID</span>
                            <span className="font-mono text-brand">{activeCredential.credId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Claims included</span>
                            <span className="text-text-primary font-medium">{Object.keys(activeCredential.claims).join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Issuer</span>
                            <span className="text-text-primary">{activeCredential.iss}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="btn btn-secondary flex-1" onClick={copyToken}>
                          <Copy className="w-3.5 h-3.5" />
                          {copied ? 'Copied!' : 'Copy JWT'}
                        </button>
                        <button className="btn btn-danger flex-1" onClick={doRevoke} disabled={revoking}>
                          {revoking
                            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-red-200 border-t-danger rounded-full" />
                            : <><XCircle className="w-3.5 h-3.5" /> Revoke</>}
                        </button>
                      </div>
                      <button className="btn btn-secondary w-full text-xs" onClick={() => setStep('select')}>
                        <RefreshCw className="w-3 h-3" /> Generate New QR
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Access Log Modal ─────────────────────────────────────────────
function AccessLogModal({ onClose }: { onClose: () => void }) {
  const { accessLog } = useStudent();
  const outcomeStyle: Record<string, string> = {
    VALID: 'badge-success', DENIED: 'badge-warning', REVOKED: 'badge-danger',
  };
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div className="w-full sm:max-w-lg bg-surface rounded-t-2xl sm:rounded-panel shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div>
              <p className="text-sm font-semibold text-text-primary">Verification Access Log</p>
              <p className="text-xs text-text-muted">{accessLog.length} entries · every scan of your credential</p>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-y-auto flex-1 p-5 space-y-3">
            {accessLog.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3 rounded-card border border-border hover:bg-canvas transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary">{log.verifier}</p>
                  <span className={`badge text-xs ${outcomeStyle[log.outcome]}`}>{log.outcome}</span>
                </div>
                <p className="text-xs text-text-muted mb-1.5">
                  {log.purpose} · {new Date(log.at).toLocaleString('en-IN')}
                </p>
                {log.fieldsReturned.length > 0 && (
                  <p className="text-xs text-text-secondary">Shared: {log.fieldsReturned.join(', ')}</p>
                )}
              </motion.div>
            ))}
            {accessLog.length === 0 && (
              <p className="text-center text-xs text-text-muted py-8">No verifications yet.</p>
            )}
          </div>
          <div className="px-5 py-4 border-t border-border bg-canvas flex-shrink-0">
            <p className="text-xs text-text-muted">Revoke consent at any time from the Verifiable Credential section.</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function StudentOverview() {
  const navigate = useNavigate();
  const {
    documents, livePhotoDone, backendOnline, isAnalyzingML,
    mlAssessment, runMLRiskCheck, profileData, refreshProfile,
  } = useStudent();
  const [showWallet,    setShowWallet]    = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [showNotif,     setShowNotif]     = useState(false);

  useEffect(() => {
    refreshProfile();
    const handleFocus = () => refreshProfile();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshProfile]);

  const verifiedDocs = documents.filter(d => d.status === 'VERIFIED').length;
  const unread       = NOTIFS.filter(n => !n.read).length;

  const st = profileData?.student;
  const currentHoldState  = st?.holdState ?? (mlAssessment && mlAssessment.riskScore > 40 ? 'CONFLICT_HOLD' : 'NONE');
  const currentStatus     = st?.status ?? (currentHoldState === 'CONFLICT_HOLD' ? 'ADMITTED (HOLD)' : 'ENROLLED');
  const currentTrustLevel = st?.trustLevel ?? (mlAssessment ? mlAssessment.trustLevel : 3);

  const metrics = [
    { label: 'Enrolment Status',   value: currentStatus,   sublabel: 'AY 2026-27 · B.Tech CSE',         color: currentHoldState === 'NONE' ? ('success' as const) : ('warning' as const) },
    { label: 'Trust Level',        value: `L${currentTrustLevel}`, sublabel: `Tier L${currentTrustLevel} · ML Verified`, color: 'brand'   as const },
    { label: 'Open Requests',      value: 1,               sublabel: '1 awaiting review',               color: 'warning' as const },
    { label: 'Documents Verified', value: verifiedDocs,    sublabel: `${documents.length} total`,       color: 'info'    as const },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8">
      <PageHeader
        title="My Academic Overview"
        subtitle="Your enrolment status, trust level, and credential at a glance."
        breadcrumb={['Student Portal', 'Overview']}
        demo
        actions={
          <div className="relative">
            <button className="btn-icon relative" onClick={() => setShowNotif(s => !s)}>
              <Bell className="w-4 h-4" />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-surface" />}
            </button>
            <AnimatePresence>
              {showNotif && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30" onClick={() => setShowNotif(false)} />
                  <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-card shadow-dropdown z-40">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">Notifications</p>
                      {unread > 0 && <span className="badge badge-info text-xs">{unread} new</span>}
                    </div>
                    <div className="divide-y divide-border max-h-64 overflow-y-auto">
                      {NOTIFS.map(n => (
                        <div key={n.id} className={`px-4 py-3 text-xs cursor-pointer transition-colors hover:bg-canvas ${!n.read ? 'bg-brand-soft/20' : ''}`}>
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

      {/* AICTE ML Integrity & Risk Engine Banner */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="card border-brand/30 bg-gradient-to-r from-brand-soft/40 via-surface to-brand-soft/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-card bg-brand flex items-center justify-center flex-shrink-0 text-white shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-text-primary">AICTE ML Anomaly Risk Scorer</h3>
                <span className="badge badge-neutral text-xs font-mono">IsolationForest v2.4</span>
                {backendOnline ? (
                  <span className="badge badge-success text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    FastAPI Backend Live (:8000)
                  </span>
                ) : (
                  <span className="badge badge-neutral text-xs">Failsafe Engine Mode</span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Unsupervised anomaly detection & Single-Seat Lock verification across national institutional registries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => runMLRiskCheck({ isMultiInstitutionClaim: false })}
              disabled={isAnalyzingML}
              className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
            >
              {isAnalyzingML ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Cohort…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Run Live ML Integrity Check
                </>
              )}
            </button>
            <button
              onClick={() => runMLRiskCheck({ isMultiInstitutionClaim: true })}
              disabled={isAnalyzingML}
              className="btn btn-secondary btn-sm text-xs"
              title="Test multi-institution claim detection"
            >
              Simulate Conflict Claim
            </button>
          </div>
        </div>

        {mlAssessment && (
          <div className="mt-4 pt-3.5 border-t border-brand/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-surface rounded-card border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Composite Risk Score</span>
                <span className={`badge ${
                  mlAssessment.riskScore > 40 ? 'badge-danger' : mlAssessment.riskScore > 20 ? 'badge-warning' : 'badge-success'
                } text-xs font-bold`}>
                  {mlAssessment.riskScore} / 100 ({mlAssessment.riskBand})
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {mlAssessment.riskScore <= 20
                  ? 'Normal Pattern · No anomalous flags detected'
                  : 'Anomalous multi-institution claim pattern detected'}
              </p>
            </div>

            <div className="p-3 bg-surface rounded-card border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Explainable SHAP Factors</span>
                <span className="text-xs font-semibold text-brand">{mlAssessment.factors.length} factors evaluated</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 truncate">
                {mlAssessment.factors[0]?.factor || 'Baseline Normal'}: {mlAssessment.factors[0]?.impact || '0 pts'}
              </p>
            </div>

            <div className="p-3 bg-surface rounded-card border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Cryptographic Audit Anchor</span>
                <span className="text-xs font-mono font-semibold text-text-primary">
                  Block #{mlAssessment.auditBlockSeq || 1044}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 font-mono truncate">
                SHA-256: {mlAssessment.auditHash || '8d11ee4deb91c530...'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Metrics */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => (
          <motion.div key={i} variants={item}>
            <MetricCard {...m} index={i} />
          </motion.div>
        ))}
      </motion.div>

      {/* Enrolment + checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="card lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Enrolment Record</h2>
            <StatusBadge type="enrolment" value={currentHoldState === 'CONFLICT_HOLD' ? 'ADMITTED' : 'ENROLLED'} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm">
            {[
              ['Student Ref',    'STU-***-4821'],
              ['APAAR ID',       '1234-****-****'],
              ['Institution',    'SIET Mumbai'],
              ['Programme',      'B.Tech CSE'],
              ['Academic Year',  '2026-27'],
              ['Pool / Slot',    currentHoldState === 'NONE' ? 'REGULAR · Slot 47' : 'HOLD · Conflicting Claims Locked'],
              ['Admission Date', '1 Aug 2026'],
              ['Mode',           'Full-Time'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-text-muted mb-0.5">{label}</p>
                <p className="font-medium text-text-primary">{val}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Trust Level</p>
            <TrustLadder level={currentTrustLevel as any} showLabel />
            <p className="text-xs text-text-muted mt-2">
              {currentHoldState === 'NONE'
                ? 'Verified against APAAR · Seat claimed · Identity cross-checked. Complete annual affirmation to reach L4.'
                : 'Account locked on CONFLICT_HOLD. Identity resolution required by AICTE officer to restore trust level.'}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, ease: [0.16,1,0.3,1] }}
          className="card space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Status Checklist</h2>
          {[
            { icon: CheckCircle2, color: 'text-emerald-500', label: 'APAAR ID verified',         done: true  },
            { icon: currentHoldState === 'NONE' ? CheckCircle2 : Clock, color: currentHoldState === 'NONE' ? 'text-emerald-500' : 'text-amber-500', label: currentHoldState === 'NONE' ? 'Seat claim successful' : 'Seat claim on hold', done: currentHoldState === 'NONE' },
            { icon: currentHoldState === 'NONE' ? CheckCircle2 : AlertCircle, color: currentHoldState === 'NONE' ? 'text-emerald-500' : 'text-danger', label: currentHoldState === 'NONE' ? 'Identity cross-checked across institutions' : 'Conflict hold active (Action required)', done: currentHoldState === 'NONE' },
            { icon: livePhotoDone ? CheckCircle2 : Clock, color: livePhotoDone ? 'text-emerald-500' : 'text-amber-500', label: 'Live photo check', done: livePhotoDone },
            { icon: Clock,        color: 'text-amber-500',   label: 'Category cert pending',     done: false },
            { icon: AlertCircle,  color: 'text-blue-400',    label: 'L4 cert (annual)',          done: false },
          ].map(({ icon: Icon, color, label, done }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className={`w-4 h-4 flex-shrink-0 ${done ? color : 'text-text-muted'}`} />
              <span className={done ? 'text-text-primary' : 'text-text-secondary'}>{label}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-text-muted">Documents verified</span>
              <span className="font-semibold text-text-primary">{verifiedDocs}/{documents.length}</span>
            </div>
            <div className="progress-bar">
              <motion.div className="progress-fill bg-emerald-500" initial={{ width: 0 }}
                animate={{ width: `${(verifiedDocs / documents.length) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16,1,0.3,1] }} />
            </div>
          </div>
          <button className="btn btn-secondary w-full text-xs" onClick={() => navigate('/student/documents')}>
            <Eye className="w-3.5 h-3.5" /> Manage Documents
          </button>
        </motion.div>
      </div>

      {/* Verifiable Credential panel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: [0.16,1,0.3,1] }}
        className="card bg-gradient-to-r from-[#EFEDFF]/60 to-surface border-brand/20">
        <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-12 h-12 rounded-card bg-brand flex items-center justify-center flex-shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-sm font-semibold text-text-primary">Verifiable Credential</h2>
              <span className="badge badge-success text-xs">L3 Active</span>
              <span className="badge badge-neutral text-xs">SD-JWT</span>
            </div>
            <p className="text-xs text-text-secondary mb-4 max-w-md">
              Generate a real, scannable QR code for employer verification. Choose which fields to share,
              approve consent, and revoke anytime. Single-use, 60-second expiry. Your APAAR ID is never exposed.
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

      {/* Notifications inline */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, ease: [0.16,1,0.3,1] }}
        className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Recent Notifications</h2>
          {unread > 0 && <span className="badge badge-info text-xs">{unread} unread</span>}
        </div>
        <div className="space-y-2">
          {NOTIFS.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 + i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-card border transition-colors cursor-pointer
                ${!n.read ? 'bg-brand-soft/20 border-brand/20 hover:bg-brand-soft/30' : 'border-border hover:bg-canvas'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
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
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, ease: [0.16,1,0.3,1] }}
        className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-5">Record Timeline</h2>
        <ActivityTimeline events={mockTimeline} maxItems={7} />
      </motion.div>

      <AnimatePresence>
        {showWallet    && <WalletQRModal    onClose={() => setShowWallet(false)} />}
        {showAccessLog && <AccessLogModal   onClose={() => setShowAccessLog(false)} />}
      </AnimatePresence>
    </div>
  );
}

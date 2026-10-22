import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockDocuments } from '@/data/mockData';
import { format } from 'date-fns';
import type { Document } from '@/types';
import {
  Upload, FileText, CheckCircle2, Clock, XCircle, Download,
  Camera, ScanFace, Shield, AlertTriangle, X, ChevronRight,
  Eye, RotateCcw, Fingerprint, Info,
} from 'lucide-react';

// ── Live Photo / Face Verification Modal ─────────────────────────
type LivePhotoStep = 'intro' | 'camera' | 'scanning' | 'done' | 'failed';

function LivePhotoModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<LivePhotoStep>('intro');
  const [progress, setProgress] = useState(0);
  const [liveness, setLiveness] = useState('');
  const [attempt, setAttempt] = useState(0);

  const checks = [
    { label: 'Face detected',            done: progress > 20 },
    { label: 'Liveness check — blink',   done: progress > 45 },
    { label: 'Liveness check — turn left',done: progress > 65 },
    { label: 'Match against APAAR photo', done: progress > 85 },
    { label: 'Identity confirmed',        done: progress >= 100 },
  ];

  const startScan = () => {
    setStep('scanning');
    setProgress(0);
    const messages = ['Face detected…', 'Please blink naturally…', 'Turn your head slightly left…', 'Matching with APAAR…', 'Identity confirmed ✓'];
    let i = 0;
    const iv = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 22, 100);
        setLiveness(messages[Math.floor(next / 22)] ?? messages[4]);
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            if (attempt === 0) { setStep('done'); }
            else { setStep('done'); }
          }, 500);
        }
        return next;
      });
      i++;
    }, 700);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-surface rounded-panel shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-brand" />
              <p className="text-sm font-semibold text-text-primary">Live Photo Verification</p>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>

          <div className="p-6">
            {step === 'intro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-soft flex items-center justify-center mx-auto mb-4">
                    <ScanFace className="w-10 h-10 text-brand" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-2">Identity liveness check</p>
                  <p className="text-xs text-text-secondary">We need to confirm your identity matches the APAAR photo on record. This takes about 10 seconds.</p>
                </div>
                <div className="space-y-2 text-xs text-text-secondary">
                  {['Ensure your face is well lit', 'Remove glasses if possible', 'Look directly at the camera', 'Follow the on-screen prompts'].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <p>No video is stored. The liveness check runs locally. Only a match/no-match result is sent to AICTE.</p>
                </div>
                <button className="btn btn-primary w-full" onClick={() => setStep('camera')}>
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
              </motion.div>
            )}

            {step === 'camera' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Camera preview simulation */}
                <div className="relative w-full aspect-square bg-[#1a1a2e] rounded-card overflow-hidden flex items-center justify-center">
                  <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/5 to-transparent"
                    animate={{ y: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                  {/* Face outline */}
                  <div className="relative">
                    <motion.div
                      className="w-36 h-44 rounded-[50%] border-2 border-brand/60"
                      animate={{ borderColor: ['rgba(101,88,211,0.6)', 'rgba(101,88,211,1)', 'rgba(101,88,211,0.6)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand" />
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand" />
                  </div>
                  <p className="absolute bottom-4 text-white/80 text-xs">Position your face within the oval</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={() => setStep('intro')}>Back</button>
                  <button className="btn btn-primary flex-1" onClick={startScan}>
                    <Fingerprint className="w-4 h-4" /> Start Verification
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'scanning' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Animated scanner */}
                <div className="relative w-full aspect-square bg-[#1a1a2e] rounded-card overflow-hidden flex items-center justify-center">
                  <motion.div className="absolute left-0 right-0 h-0.5 bg-brand shadow-lg"
                    style={{ boxShadow: '0 0 12px 4px rgba(101,88,211,0.5)' }}
                    animate={{ y: ['0%', '350%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                  <div className="w-36 h-44 rounded-[50%] border-2 border-emerald-400/60" />
                  <p className="absolute bottom-4 text-white/80 text-xs font-medium">{liveness}</p>
                </div>
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">Verification progress</span>
                    <span className="font-bold text-brand tabular-nums">{progress}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div className="progress-fill bg-brand h-2" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {checks.map(c => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      {c.done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-border flex-shrink-0" />}
                      <span className={c.done ? 'text-text-primary font-medium' : 'text-text-muted'}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>
                <p className="text-base font-bold text-text-primary">Identity Verified</p>
                <p className="text-xs text-text-secondary">Your face matches the APAAR identity record. Liveness confirmed. No spoof detected.</p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-card text-xs text-emerald-800 text-left space-y-1">
                  <p><span className="font-semibold">Match confidence:</span> 98.2%</p>
                  <p><span className="font-semibold">Liveness score:</span> Passed</p>
                  <p><span className="font-semibold">Method:</span> Passive liveness · device-bound</p>
                </div>
                <button className="btn btn-primary w-full" onClick={onDone}>
                  Continue to Document Verification
                </button>
              </motion.div>
            )}

            {step === 'failed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Verification failed</p>
                <p className="text-xs text-text-secondary">Face did not match APAAR record. Ensure good lighting and try again.</p>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
                  <button className="btn btn-primary flex-1" onClick={() => { setStep('camera'); setAttempt(a => a + 1); }}>
                    <RotateCcw className="w-3.5 h-3.5" /> Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Document Upload & Verification Flow ──────────────────────────
type VerifyStep = 'upload' | 'verifying' | 'done' | 'rejected';

function DocumentVerifyModal({ doc, onClose }: { doc: Partial<Document> & { label: string; hint: string }; onClose: () => void }) {
  const [step,     setStep]     = useState<VerifyStep>('upload');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [checks,   setChecks]   = useState<{ label: string; done: boolean; pass?: boolean }[]>([]);

  const verifySteps = [
    { label: 'File format check (PDF/JPG/PNG)',   pass: true },
    { label: 'Document authenticity scan',        pass: true },
    { label: 'Text extraction & field matching',  pass: true },
    { label: 'Cross-reference with APAAR record', pass: true },
    { label: 'Digital signature validation',      pass: doc.label !== 'Caste Certificate' },
  ];

  const startVerify = (name: string) => {
    setFileName(name);
    setStep('verifying');
    setProgress(0);
    setChecks([]);
    let i = 0;
    const iv = setInterval(() => {
      const pct = Math.min((i + 1) * 22, 100);
      setProgress(pct);
      setChecks(verifySteps.slice(0, i + 1).map(s => ({ ...s, done: true })));
      i++;
      if (i >= verifySteps.length) {
        clearInterval(iv);
        const allPass = verifySteps.every(s => s.pass);
        setTimeout(() => setStep(allPass ? 'done' : 'rejected'), 600);
      }
    }, 700);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) startVerify(file.name);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40" onClick={step === 'upload' ? onClose : undefined} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-surface rounded-panel shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold text-text-primary">{doc.label}</p>
              <p className="text-xs text-text-muted">{doc.hint}</p>
            </div>
            <button className="btn-icon" onClick={onClose}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 space-y-4">
            {step === 'upload' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div
                  className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-colors
                    ${dragging ? 'border-brand bg-brand-soft/30' : 'border-border hover:border-brand hover:bg-brand-soft/10'}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => startVerify(`${doc.label?.toLowerCase().replace(/ /g, '_')}.pdf`)}
                >
                  <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-sm font-semibold text-text-primary mb-1">Drop file or click to upload</p>
                  <p className="text-xs text-text-muted">{doc.hint}</p>
                </div>
              </motion.div>
            )}

            {step === 'verifying' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-canvas rounded-card border border-border">
                  <FileText className="w-8 h-8 text-brand flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{fileName}</p>
                    <p className="text-xs text-text-muted">Verifying…</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-muted">Verification progress</span>
                    <span className="font-bold text-brand">{progress}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <motion.div className="progress-fill bg-brand h-2" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  {checks.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-xs">
                      {c.pass
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0" />}
                      <span className={c.pass ? 'text-text-primary font-medium' : 'text-danger font-medium'}>{c.label}</span>
                    </motion.div>
                  ))}
                  {checks.length < verifySteps.length && (
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full flex-shrink-0" />
                      {verifySteps[checks.length]?.label}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
                <p className="text-sm font-bold text-text-primary">Document Verified</p>
                <p className="text-xs text-text-secondary">All checks passed. Document has been accepted and added to your record.</p>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-card text-xs text-emerald-800 text-left space-y-1">
                  <p>✓ Format valid · ✓ Authentic · ✓ Fields matched · ✓ APAAR cross-referenced</p>
                  <p className="text-emerald-700 mt-1">Verified on {new Date().toLocaleDateString('en-IN')}</p>
                </div>
                <button className="btn btn-primary w-full" onClick={onClose}><CheckCircle2 className="w-3.5 h-3.5" /> Done</button>
              </motion.div>
            )}

            {step === 'rejected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-danger" />
                </div>
                <p className="text-sm font-bold text-text-primary">Verification Failed</p>
                <p className="text-xs text-text-secondary">One or more checks did not pass. Ensure your document is clear and unmodified.</p>
                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
                  <button className="btn btn-primary flex-1" onClick={() => setStep('upload')}>
                    <RotateCcw className="w-3.5 h-3.5" /> Re-upload
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Main page ────────────────────────────────────────────────────
const REQUIRED_DOCS = [
  { key: 'apaar',      label: 'APAAR Card / Aadhaar',       hint: 'PDF or JPG · max 5 MB', required: true },
  { key: 'admission',  label: 'Admission Letter',            hint: 'Official letter from institution', required: true },
  { key: 'marksheet',  label: 'Class 12 Marksheet',          hint: 'Board marksheet · PDF', required: true },
  { key: 'category',   label: 'Caste Certificate',           hint: 'If applicable · PDF', required: false },
  { key: 'photo_id',   label: 'Photo ID (Aadhaar / Passport)',hint: 'Government-issued ID', required: true },
  { key: 'migration',  label: 'Migration Certificate',       hint: 'From previous board/institution', required: false },
];

const iconMap: Record<string, React.ElementType> = {
  VERIFIED: CheckCircle2, UPLOADED: Clock, PENDING: Clock, REJECTED: XCircle,
};
const iconColor: Record<string, string> = {
  VERIFIED: 'text-emerald-500', UPLOADED: 'text-blue-400', PENDING: 'text-amber-500', REJECTED: 'text-red-500',
};

export default function StudentDocuments() {
  const [showLivePhoto,   setShowLivePhoto]   = useState(false);
  const [livePhotoDone,   setLivePhotoDone]   = useState(false);
  const [uploadDoc,       setUploadDoc]       = useState<typeof REQUIRED_DOCS[0] | null>(null);
  const [selectedExisting, setSelectedExisting] = useState<Document | null>(null);

  const verified  = mockDocuments.filter(d => d.status === 'VERIFIED').length;
  const pending   = mockDocuments.filter(d => d.status === 'PENDING').length;
  const uploaded  = mockDocuments.filter(d => d.status === 'UPLOADED').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="My Documents"
        subtitle="Upload, verify, and manage all documents required for your enrolment record."
        breadcrumb={['Student Portal', 'Documents']}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setUploadDoc(REQUIRED_DOCS[0])}>
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Verified',  value: verified, color: 'text-emerald-600' },
          { label: 'Pending',   value: pending + uploaded, color: 'text-amber-600' },
          { label: 'Total',     value: mockDocuments.length, color: 'text-text-primary' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Live photo verification */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`card border-2 transition-colors ${livePhotoDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-brand/30 bg-brand-soft/10'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-card flex items-center justify-center flex-shrink-0 ${livePhotoDone ? 'bg-emerald-50' : 'bg-brand-soft'}`}>
            <ScanFace className={`w-5 h-5 ${livePhotoDone ? 'text-emerald-600' : 'text-brand'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-text-primary">Live Photo / Identity Check</p>
              {livePhotoDone
                ? <span className="badge badge-success text-xs">Passed</span>
                : <span className="badge badge-warning text-xs">Required</span>}
            </div>
            <p className="text-xs text-text-secondary mb-3">
              {livePhotoDone
                ? 'Face matched against APAAR record. Liveness confirmed. No further action needed.'
                : 'Required before document submission. A quick 10-second liveness check confirms your identity matches the APAAR photo.'}
            </p>
            {!livePhotoDone && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowLivePhoto(true)}>
                <Camera className="w-3.5 h-3.5" /> Start Live Check
              </button>
            )}
          </div>
          {livePhotoDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
        </div>
      </motion.div>

      {/* Required documents checklist */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Required Documents</h2>
          <span className="text-xs text-text-muted">({REQUIRED_DOCS.filter(d => d.required).length} required)</span>
        </div>
        <div className="space-y-2">
          {REQUIRED_DOCS.map((req, i) => {
            const existing = mockDocuments.find(d => d.type.toLowerCase().includes(req.key) || d.name.toLowerCase().includes(req.key));
            const status   = existing?.status ?? 'MISSING';
            return (
              <motion.div key={req.key} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 + i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-card border border-border hover:bg-canvas transition-colors">
                <div className={`w-8 h-8 rounded-card flex items-center justify-center flex-shrink-0 ${
                  status === 'VERIFIED' ? 'bg-emerald-50' : status === 'MISSING' ? 'bg-red-50' : 'bg-amber-50'}`}>
                  {status === 'VERIFIED'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : status === 'MISSING'
                    ? <AlertTriangle className="w-4 h-4 text-danger" />
                    : <Clock className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{req.label}</p>
                    {req.required && status === 'MISSING' && (
                      <span className="badge badge-danger text-xs">Required</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{req.hint}</p>
                </div>
                <div className="flex-shrink-0">
                  {status === 'MISSING' || status === 'REJECTED' ? (
                    <button
                      className="btn btn-primary btn-sm text-xs"
                      disabled={!livePhotoDone}
                      title={!livePhotoDone ? 'Complete live photo check first' : ''}
                      onClick={() => livePhotoDone && setUploadDoc(req)}
                    >
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  ) : (
                    <span className={`badge text-xs ${
                      status === 'VERIFIED' ? 'badge-success' : status === 'PENDING' ? 'badge-warning' : 'badge-info'
                    }`}>{status}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        {!livePhotoDone && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-control px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            Complete the live photo check above to enable document uploads.
          </div>
        )}
      </motion.div>

      {/* Uploaded documents list */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">Uploaded Documents</h2>
        {mockDocuments.map((doc, i) => {
          const Icon = iconMap[doc.status] ?? FileText;
          return (
            <motion.div key={doc.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 + i * 0.04 }}
              className="card flex items-center gap-4 group hover:shadow-card-hover transition-all cursor-pointer"
              onClick={() => setSelectedExisting(doc)}>
              <div className="w-10 h-10 bg-canvas rounded-card flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Document detail panel */}
      <AnimatePresence>
        {selectedExisting && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setSelectedExisting(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-surface border-l border-border z-50 shadow-2xl">
              <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">{selectedExisting.name}</p>
                <button className="btn-icon" onClick={() => setSelectedExisting(null)}><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="w-full aspect-[4/3] bg-canvas rounded-card border border-border flex items-center justify-center">
                  <FileText className="w-16 h-16 text-text-muted opacity-30" />
                </div>
                <div className="space-y-3">
                  {[
                    ['Document type', selectedExisting.type],
                    ['Uploaded',      format(new Date(selectedExisting.uploadedAt), 'd MMM yyyy, HH:mm')],
                    ['Verified',      selectedExisting.verifiedAt ? format(new Date(selectedExisting.verifiedAt), 'd MMM yyyy, HH:mm') : '—'],
                    ['Status',        selectedExisting.status],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="text-sm font-medium text-text-primary">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <button className="btn btn-secondary w-full"><Eye className="w-3.5 h-3.5" /> Preview</button>
                  <button className="btn btn-secondary w-full"><Download className="w-3.5 h-3.5" /> Download</button>
                  {selectedExisting.status !== 'VERIFIED' && (
                    <button className="btn btn-primary w-full" onClick={() => { setSelectedExisting(null); setUploadDoc(REQUIRED_DOCS[0]); }}>
                      <RotateCcw className="w-3.5 h-3.5" /> Re-upload
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showLivePhoto && (
          <LivePhotoModal
            onClose={() => setShowLivePhoto(false)}
            onDone={() => { setLivePhotoDone(true); setShowLivePhoto(false); }}
          />
        )}
        {uploadDoc && (
          <DocumentVerifyModal
            doc={uploadDoc}
            onClose={() => setUploadDoc(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

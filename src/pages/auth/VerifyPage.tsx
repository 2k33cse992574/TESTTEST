/**
 * VerifyPage — Public page, no login required.
 * Opened when an employer scans the student's QR code.
 * URL: /verify?token=CRED-XYZ&t=1234567890
 *
 * Shows: VALID (with consented fields) | REVOKED | EXPIRED | NOT_FOUND
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { lookupCredential, type VerifyResult } from '@/context/CredentialRegistry';
import type { CredentialPayload } from '@/context/StudentContext';
import {
  Shield, CheckCircle2, XCircle, Clock, AlertTriangle,
  Building2, GraduationCap, Calendar, Award, ExternalLink,
  RefreshCw, Lock, Hash,
} from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  degree:       'Degree / Programme',
  institution:  'Institution',
  year:         'Academic Year',
  status:       'Enrolment Status',
  apaar_masked: 'APAAR Reference',
  mode:         'Study Mode',
};

const FIELD_ICONS: Record<string, React.ElementType> = {
  degree:       GraduationCap,
  institution:  Building2,
  year:         Calendar,
  status:       Award,
  apaar_masked: Hash,
  mode:         Lock,
};

// ── Spinner ──────────────────────────────────────────────────────
function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="w-8 h-8 border-3 border-border border-t-brand rounded-full"
      style={{ borderWidth: 3 }}
    />
  );
}

// ── Valid result ─────────────────────────────────────────────────
function ValidResult({ cred }: { cred: CredentialPayload }) {
  const issuedAt  = new Date(cred.iat * 1000).toLocaleString('en-IN');
  const expiresAt = new Date(cred.exp * 1000).toLocaleString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Trust seal */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-emerald-700 mb-1">Credential Valid</h1>
          <p className="text-sm text-text-secondary">
            This credential has been verified against the AICTE Pramaan registry.
          </p>
        </motion.div>
      </div>

      {/* Consented fields */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-emerald-100 shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
            Verified Information — Consented by Student
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">Purpose: {cred.purpose}</p>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(cred.claims).map(([key, value], i) => {
            const Icon = FIELD_ICONS[key] ?? Award;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.07 }}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide">{FIELD_LABELS[key] ?? key}</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Credential metadata */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
        className="bg-white rounded-2xl border border-border shadow-card p-5 space-y-3"
      >
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Credential Details</p>
        {[
          { label: 'Credential ID', value: cred.credId, mono: true },
          { label: 'Issuer',        value: cred.iss,    mono: false },
          { label: 'Subject',       value: cred.sub,    mono: true  },
          { label: 'Issued at',     value: issuedAt,    mono: false },
          { label: 'Expires at',    value: expiresAt,   mono: false },
        ].map(({ label, value, mono }) => (
          <div key={label} className="flex items-start justify-between gap-4 text-xs">
            <span className="text-text-muted flex-shrink-0">{label}</span>
            <span className={`text-text-primary text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Privacy note */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800"
      >
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Only the fields consented to by the student are shown. The student's APAAR ID was never transmitted.
          This credential is single-use and expires automatically. Verifiers cannot enumerate or look up students by identity.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Revoked result ────────────────────────────────────────────────
function RevokedResult({ revokedAt }: { revokedAt: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
      <div className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <XCircle className="w-12 h-12 text-danger" />
        </motion.div>
        <h1 className="text-2xl font-bold text-danger mb-1">Credential Revoked</h1>
        <p className="text-sm text-text-secondary">The student has revoked this credential. No information can be shared.</p>
      </div>
      <div className="bg-white rounded-2xl border border-red-100 p-5 space-y-3 shadow-card">
        {[
          { label: 'Status',     value: 'REVOKED' },
          { label: 'Revoked at', value: revokedAt ? new Date(revokedAt).toLocaleString('en-IN') : 'Unknown' },
          { label: 'Action',     value: 'Contact the candidate directly to request a new credential.' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4 text-xs">
            <span className="text-text-muted flex-shrink-0">{label}</span>
            <span className={`text-right font-medium ${label === 'Status' ? 'text-danger' : 'text-text-primary'}`}>{value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Revocation is instant and permanent for this credential. The student can generate a new credential at any time from their Pramaan wallet.</p>
      </div>
    </motion.div>
  );
}

// ── Expired result ────────────────────────────────────────────────
function ExpiredResult({ expiredAt }: { expiredAt: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
      <div className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Clock className="w-12 h-12 text-amber-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-amber-700 mb-1">Credential Expired</h1>
        <p className="text-sm text-text-secondary">This single-use QR code has expired. Ask the candidate to generate a new one.</p>
      </div>
      <div className="bg-white rounded-2xl border border-amber-100 p-5 space-y-3 shadow-card">
        {[
          { label: 'Status',     value: 'EXPIRED' },
          { label: 'Expired at', value: expiredAt ? new Date(expiredAt).toLocaleString('en-IN') : 'Unknown' },
          { label: 'Action',     value: 'Ask the candidate to open their Pramaan wallet and generate a fresh QR.' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-4 text-xs">
            <span className="text-text-muted flex-shrink-0">{label}</span>
            <span className={`text-right font-medium ${label === 'Status' ? 'text-amber-700' : 'text-text-primary'}`}>{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Not found ─────────────────────────────────────────────────────
function NotFoundResult({ token }: { token: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-12 h-12 text-text-muted" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Credential Not Found</h1>
        <p className="text-sm text-text-secondary">No credential matching this token was found in the Pramaan registry.</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3 shadow-card">
        <div className="flex items-start justify-between gap-4 text-xs">
          <span className="text-text-muted">Token</span>
          <span className="font-mono text-text-primary text-right break-all">{token || '—'}</span>
        </div>
        <div className="flex items-start justify-between gap-4 text-xs">
          <span className="text-text-muted">Possible reasons</span>
          <span className="text-text-secondary text-right max-w-[60%]">
            QR was from a different session · Token was never registered · Demo session was reloaded
          </span>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          To test a live result: go to the <strong>Student Portal → Overview → Generate Wallet QR</strong>, scan the generated code, and this page will show the real credential. Or visit{' '}
          <Link to="/verify?token=DEMO" className="underline font-semibold">the demo credential</Link>.
        </p>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function VerifyPage() {
  const [params] = useSearchParams();
  const token    = params.get('token') ?? '';

  const [loading,  setLoading]  = useState(true);
  const [result,   setResult]   = useState<VerifyResult | null>(null);
  const [verifiedAt, setVerifiedAt] = useState('');

  useEffect(() => {
    setLoading(true);
    // Simulate a short network round-trip for realism
    const delay = 800 + Math.random() * 400;
    const timer = setTimeout(() => {
      const res = lookupCredential(token);
      setResult(res);
      setVerifiedAt(new Date().toLocaleString('en-IN'));
      setLoading(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [token]);

  const refresh = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(lookupCredential(token));
      setVerifiedAt(new Date().toLocaleString('en-IN'));
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header bar */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary">APAAR</span>
              <span className="text-sm font-bold text-brand ml-0.5">Pramaan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="btn-icon" title="Refresh verification">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/login" className="text-xs text-text-muted hover:text-brand transition-colors flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Page title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Credential Verification
            </p>
            <span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded font-mono text-text-muted">
              {token || 'no token'}
            </span>
          </div>
          <p className="text-xs text-text-muted">Checked at {verifiedAt || '…'}</p>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner />
              <p className="text-sm text-text-secondary">Verifying credential…</p>
              <p className="text-xs text-text-muted">Checking AICTE Pramaan registry</p>
            </motion.div>
          ) : result?.status === 'VALID' ? (
            <ValidResult key="valid" cred={(result as Extract<VerifyResult, { status: 'VALID' }>).credential} />
          ) : result?.status === 'REVOKED' ? (
            <RevokedResult key="revoked" revokedAt={(result as Extract<VerifyResult, { status: 'REVOKED' }>).revokedAt} />
          ) : result?.status === 'EXPIRED' ? (
            <ExpiredResult key="expired" expiredAt={(result as Extract<VerifyResult, { status: 'EXPIRED' }>).expiredAt} />
          ) : (
            <NotFoundResult key="notfound" token={token} />
          )}
        </AnimatePresence>

        {/* Footer */}
        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-8 pt-6 border-t border-border text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified by <strong className="text-text-secondary">pramaan.aicte.gov.in</strong></span>
            </div>
            <p className="text-xs text-text-muted">
              This is a demonstration environment. All data is synthetic and does not represent a real student record.
            </p>
            <div className="flex items-center justify-center gap-4 pt-1">
              <Link to="/login" className="text-xs text-brand hover:underline">Student Portal</Link>
              <span className="text-border">·</span>
              <Link to="/verify?token=DEMO" className="text-xs text-brand hover:underline">Demo Credential</Link>
              <span className="text-border">·</span>
              <a href="https://aicte.gov.in" target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">AICTE.gov.in</a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

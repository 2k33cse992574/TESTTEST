import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/api/client';
import {
  QrCode, CheckCircle2, XCircle, Clock, Shield, Eye,
  Building2, Search, X, AlertTriangle, Users, Sparkles, Send
} from 'lucide-react';

interface Verifier {
  id: string; name: string; type: string; email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  verificationsToday: number; quotaDaily: number;
  totalVerifications: number; registeredOn: string;
  lastActive: string; purposesAllowed: string[];
}

interface VerificationLog {
  id: string; verifierId: string; verifierName: string;
  purpose: string; outcome: 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'DENIED';
  fieldsReturned: string[]; at: string; consentRef: string;
}

const DEFAULT_VERIFIERS: Verifier[] = [
  { id: 'VFR-001', name: 'TCS Recruitment Verification',          type: 'Employer',    email: 'verify@tcs.com',          status: 'ACTIVE',    verificationsToday: 14, quotaDaily: 100, totalVerifications: 3420, registeredOn: '2026-06-01', lastActive: '2026-10-22', purposesAllowed: ['EMPLOYMENT', 'BACKGROUND_CHECK'] },
  { id: 'VFR-002', name: 'Infosys HR Verification Desk',          type: 'Employer',    email: 'hr-verify@infosys.com',   status: 'ACTIVE',    verificationsToday: 7,  quotaDaily: 80,  totalVerifications: 1890, registeredOn: '2026-07-15', lastActive: '2026-10-21', purposesAllowed: ['EMPLOYMENT'] },
  { id: 'VFR-003', name: 'NAAC Accreditation Assessment Body',    type: 'Regulator',   email: 'verify@naac.gov.in',      status: 'ACTIVE',    verificationsToday: 2,  quotaDaily: 50,  totalVerifications: 210,  registeredOn: '2026-08-01', lastActive: '2026-10-20', purposesAllowed: ['ACCREDITATION', 'REGULATORY'] },
  { id: 'VFR-004', name: 'State Education Dept. Maharashtra',     type: 'Government',  email: 'verify@education.mh.gov', status: 'ACTIVE',    verificationsToday: 1,  quotaDaily: 200, totalVerifications: 88,   registeredOn: '2026-09-10', lastActive: '2026-10-18', purposesAllowed: ['REGULATORY', 'SCHOLARSHIP'] },
  { id: 'VFR-005', name: 'QuickHire Background Checks Pvt Ltd',    type: 'Employer',    email: 'ops@quickhire.in',        status: 'SUSPENDED', verificationsToday: 0,  quotaDaily: 50,  totalVerifications: 440,  registeredOn: '2026-07-01', lastActive: '2026-10-10', purposesAllowed: ['EMPLOYMENT'] },
  { id: 'VFR-006', name: 'GlobalEdu Credentials Inc.',            type: 'Education',   email: 'verify@globaledu.com',    status: 'PENDING',   verificationsToday: 0,  quotaDaily: 0,   totalVerifications: 0,    registeredOn: '2026-10-20', lastActive: '—',          purposesAllowed: [] },
];

const DEFAULT_LOGS: VerificationLog[] = [
  { id: 'VL-001', verifierId: 'VFR-001', verifierName: 'TCS Recruitment Verification',   purpose: 'EMPLOYMENT',       outcome: 'VALID',     fieldsReturned: ['degree', 'year', 'institution', 'status'], at: '2026-10-22T11:20:00Z', consentRef: 'CNS-7821' },
  { id: 'VL-002', verifierId: 'VFR-001', verifierName: 'TCS Recruitment Verification',   purpose: 'EMPLOYMENT',       outcome: 'REVOKED',   fieldsReturned: [],                                          at: '2026-10-22T10:55:00Z', consentRef: 'CNS-7810' },
  { id: 'VL-003', verifierId: 'VFR-002', verifierName: 'Infosys HR Verification Desk',   purpose: 'EMPLOYMENT',       outcome: 'VALID',     fieldsReturned: ['degree', 'institution', 'status'],         at: '2026-10-21T14:30:00Z', consentRef: 'CNS-7745' },
  { id: 'VL-004', verifierId: 'VFR-003', verifierName: 'NAAC Accreditation Assessment',  purpose: 'ACCREDITATION',    outcome: 'VALID',     fieldsReturned: ['degree', 'year', 'institution'],           at: '2026-10-20T09:10:00Z', consentRef: 'CNS-7700' },
  { id: 'VL-005', verifierId: 'VFR-005', verifierName: 'QuickHire Background Checks',     purpose: 'EMPLOYMENT',       outcome: 'DENIED',    fieldsReturned: [],                                          at: '2026-10-10T16:44:00Z', consentRef: '—' },
];

const outcomeStyle: Record<string, string> = {
  VALID:     'badge-success', REVOKED: 'badge-danger',
  NOT_FOUND: 'badge-neutral', DENIED:  'badge-warning',
};
const statusStyle: Record<string, string> = {
  ACTIVE: 'badge-success', SUSPENDED: 'badge-danger', PENDING: 'badge-warning',
};

export default function OfficerVerifierPortal() {
  const [verifiers, setVerifiers] = useState<Verifier[]>(DEFAULT_VERIFIERS);
  const [logs, setLogs]           = useState<VerificationLog[]>(DEFAULT_LOGS);
  const [selected, setSelected]   = useState<Verifier | null>(null);
  const [search,   setSearch]     = useState('');
  const [tab,      setTab]        = useState<'verifiers' | 'log' | 'simulator'>('verifiers');

  // Live Simulator state
  const [simVerifierId, setSimVerifierId] = useState('VFR-001');
  const [simStudentRef, setSimStudentRef] = useState('4821');
  const [simPurpose, setSimPurpose]       = useState('EMPLOYMENT');
  const [simConsentRef, setSimConsentRef] = useState('CNS-7821');
  const [simResult, setSimResult]         = useState<any>(null);
  const [simRunning, setSimRunning]       = useState(false);

  useEffect(() => {
    api.getVerifiers()
      .then(res => { if (res && res.length) setVerifiers(res); })
      .catch(() => {});

    api.getVerificationLogs()
      .then(res => { if (res && res.length) setLogs(res); })
      .catch(() => {});
  }, []);

  const filtered = verifiers.filter(v =>
    !search || [v.name, v.type, v.email].some(x => x.toLowerCase().includes(search.toLowerCase()))
  );

  const totalToday = verifiers.reduce((s, v) => s + v.verificationsToday, 0);
  const activeCount = verifiers.filter(v => v.status === 'ACTIVE').length;

  const handleUpdateStatus = async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!selected) return;
    try {
      await api.updateVerifierStatus(selected.id, {
        status,
        officerName: 'Shri Rajesh Kumar'
      });
    } catch {}
    setVerifiers(prev => prev.map(v => v.id === selected.id ? { ...v, status } : v));
    setSelected(prev => prev ? { ...prev, status } : null);
  };

  const handleSimulate = async () => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await api.simulateVerification({
        verifierId: simVerifierId,
        studentRef: simStudentRef,
        purpose: simPurpose,
        consentRef: simConsentRef
      });
      setSimResult(res);
      if (res.logEntry) {
        setLogs(prev => [res.logEntry, ...prev]);
      }
    } catch (err: any) {
      setSimResult({
        outcome: 'DENIED',
        message: err.message || 'Verification rejected by policy engine.'
      });
    } finally {
      setSimRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Verifier Portal"
        subtitle="Registered verifier management, daily quota meters, consent references, and selective disclosure controls."
        breadcrumb={['AICTE Officer Portal', 'Verifier Portal']}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Verifiers',       value: activeCount,                   color: 'text-emerald-600' },
          { label: 'Total Verifications',    value: verifiers.reduce((s,v)=>s+v.totalVerifications,0).toLocaleString(), color: 'text-text-primary' },
          { label: 'Queries Today',          value: totalToday,                    color: 'text-brand' },
          { label: 'Pending Approvals',      value: verifiers.filter(v => v.status === 'PENDING').length, color: 'text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab control */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-canvas rounded-card border border-border">
          <button
            onClick={() => setTab('verifiers')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              tab === 'verifiers' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Registered Verifiers ({verifiers.length})
          </button>
          <button
            onClick={() => setTab('log')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              tab === 'log' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Verification Audit Log ({logs.length})
          </button>
          <button
            onClick={() => setTab('simulator')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === 'simulator' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" /> Verification Simulator
          </button>
        </div>

        {tab === 'verifiers' && (
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-control border border-border bg-canvas focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Search verifier by name, type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab: Verifiers */}
      {tab === 'verifiers' && (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(v => {
              const quotaPct = v.quotaDaily > 0 ? Math.round((v.verificationsToday / v.quotaDaily) * 100) : 0;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className="p-4 hover:bg-canvas transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-card bg-brand-soft flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-4 h-4 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary truncate">{v.name}</p>
                        <span className="font-mono text-xs text-text-muted">{v.id}</span>
                        <span className={`badge ${statusStyle[v.status]}`}>{v.status}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {v.type} · {v.email} · Last active: {v.lastActive}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Today's Quota</p>
                      <span className="text-sm font-semibold tabular-nums">
                        {v.verificationsToday} / {v.quotaDaily}
                      </span>
                      <div className="w-20 progress-bar mt-1">
                        <div
                          className={`progress-fill ${quotaPct > 90 ? 'bg-danger' : 'bg-brand'}`}
                          style={{ width: `${Math.min(quotaPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Verification Log */}
      {tab === 'log' && (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map(l => (
              <div key={l.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand">{l.id}</span>
                    <span className="text-xs font-semibold text-text-primary">{l.verifierName}</span>
                    <span className={`badge ${outcomeStyle[l.outcome] ?? 'badge-neutral'}`}>{l.outcome}</span>
                    <span className="badge badge-neutral text-xs">{l.purpose}</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Consent Reference: <span className="font-mono text-brand">{l.consentRef}</span> · Disclosed: {l.fieldsReturned.join(', ') || 'None (Revoked/Denied)'}
                  </p>
                  <p className="text-xs text-text-muted">{l.at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Simulator */}
      {tab === 'simulator' && (
        <div className="card space-y-6">
          <div>
            <p className="text-card-title text-text-primary">Live External Verifier Simulator</p>
            <p className="text-xs text-text-muted">
              Simulate an authorized third-party querying student credentials with consent checks and quota deduction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="label">Registered Verifier</label>
              <select
                className="input text-xs"
                value={simVerifierId}
                onChange={e => setSimVerifierId(e.target.value)}
              >
                {verifiers.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Student Reference / APAAR</label>
              <input
                className="input text-xs"
                placeholder="e.g. 4821 or 1234-5678-9012"
                value={simStudentRef}
                onChange={e => setSimStudentRef(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Verification Purpose</label>
              <select
                className="input text-xs"
                value={simPurpose}
                onChange={e => setSimPurpose(e.target.value)}
              >
                <option value="EMPLOYMENT">Employment Verification</option>
                <option value="SCHOLARSHIP">State Scholarship Review</option>
                <option value="ACCREDITATION">NAAC / Regulatory Audit</option>
                <option value="BACKGROUND_CHECK">Background Screening</option>
              </select>
            </div>

            <div>
              <label className="label">Student Consent Reference</label>
              <input
                className="input text-xs font-mono"
                placeholder="e.g. CNS-7821 or CNS-7810 (test revoke)"
                value={simConsentRef}
                onChange={e => setSimConsentRef(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simRunning}
            className="btn btn-primary w-full justify-center text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            {simRunning ? 'Verifying Credentials…' : 'Execute Credential Verification'}
          </button>

          {simResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-surface rounded-card border-2 border-brand/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">Verification Response:</span>
                <span className={`badge ${outcomeStyle[simResult.outcome] ?? 'badge-neutral'}`}>
                  {simResult.outcome}
                </span>
              </div>

              {simResult.verifiedStudent ? (
                <div className="p-3 bg-canvas rounded space-y-2 text-xs">
                  <p className="font-semibold text-emerald-800">Selective Credential Disclosure:</p>
                  <div className="grid grid-cols-2 gap-2 text-text-secondary">
                    <div>Student: <span className="font-bold text-text-primary">{simResult.verifiedStudent.name}</span></div>
                    <div>Ref: <span className="font-mono text-brand">{simResult.verifiedStudent.maskedId}</span></div>
                    <div>Institution: <span className="font-medium">{simResult.verifiedStudent.institutionName}</span></div>
                    <div>Programme: <span className="font-medium">{simResult.verifiedStudent.programme}</span></div>
                    <div>Trust Tier: <span className="font-bold text-emerald-700">Level {simResult.verifiedStudent.trustLevel}</span></div>
                    <div>Status: <span className="font-bold">{simResult.verifiedStudent.status}</span></div>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    Disclosed Fields: {simResult.verifiedStudent.disclosedFields?.join(', ')}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-danger font-medium">{simResult.message}</p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-text-muted">{selected.id}</span>
                    <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                <div className="p-4 bg-canvas rounded-card border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Type:</span>
                    <span className="font-semibold text-text-primary">{selected.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status:</span>
                    <span className={`badge ${statusStyle[selected.status]}`}>{selected.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Daily Quota:</span>
                    <span className="font-bold">{selected.quotaDaily} queries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Completed:</span>
                    <span className="font-semibold">{selected.totalVerifications}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="label">Officer Regulatory Actions</p>
                  {selected.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleUpdateStatus('SUSPENDED')}
                      className="btn btn-secondary w-full text-xs text-danger border-red-300 hover:bg-red-50"
                    >
                      Suspend Verifier Access
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      className="btn btn-primary w-full text-xs"
                    >
                      Approve & Activate Verifier
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

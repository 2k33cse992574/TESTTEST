import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  QrCode, CheckCircle2, XCircle, Clock, Shield, Eye,
  Building2, Search, X, AlertTriangle, Users,
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

const VERIFIERS: Verifier[] = [
  { id: 'VFR-001', name: 'TCS Recruitment',          type: 'Employer',    email: 'verify@tcs.com',          status: 'ACTIVE',    verificationsToday: 14, quotaDaily: 100, totalVerifications: 3420, registeredOn: '2026-06-01', lastActive: '2026-10-22', purposesAllowed: ['EMPLOYMENT', 'BACKGROUND_CHECK'] },
  { id: 'VFR-002', name: 'Infosys HR Verification',  type: 'Employer',    email: 'hr-verify@infosys.com',   status: 'ACTIVE',    verificationsToday: 7,  quotaDaily: 80,  totalVerifications: 1890, registeredOn: '2026-07-15', lastActive: '2026-10-21', purposesAllowed: ['EMPLOYMENT'] },
  { id: 'VFR-003', name: 'NAAC Accreditation Body',  type: 'Regulator',   email: 'verify@naac.gov.in',      status: 'ACTIVE',    verificationsToday: 2,  quotaDaily: 50,  totalVerifications: 210,  registeredOn: '2026-08-01', lastActive: '2026-10-20', purposesAllowed: ['ACCREDITATION', 'REGULATORY'] },
  { id: 'VFR-004', name: 'State Education Dept. MH', type: 'Government',  email: 'verify@education.mh.gov', status: 'ACTIVE',    verificationsToday: 1,  quotaDaily: 200, totalVerifications: 88,   registeredOn: '2026-09-10', lastActive: '2026-10-18', purposesAllowed: ['REGULATORY', 'SCHOLARSHIP'] },
  { id: 'VFR-005', name: 'QuickHire Pvt Ltd',        type: 'Employer',    email: 'ops@quickhire.in',        status: 'SUSPENDED', verificationsToday: 0,  quotaDaily: 50,  totalVerifications: 440,  registeredOn: '2026-07-01', lastActive: '2026-10-10', purposesAllowed: ['EMPLOYMENT'] },
  { id: 'VFR-006', name: 'GlobalEdu Inc.',            type: 'Education',   email: 'verify@globaledu.com',    status: 'PENDING',   verificationsToday: 0,  quotaDaily: 0,   totalVerifications: 0,    registeredOn: '2026-10-20', lastActive: '—',          purposesAllowed: [] },
];

const VERIFICATION_LOGS: VerificationLog[] = [
  { id: 'VL-001', verifierId: 'VFR-001', verifierName: 'TCS Recruitment',         purpose: 'EMPLOYMENT',       outcome: 'VALID',     fieldsReturned: ['degree', 'year', 'institution', 'status'], at: '2026-10-22T11:20:00Z', consentRef: 'CNS-7821' },
  { id: 'VL-002', verifierId: 'VFR-001', verifierName: 'TCS Recruitment',         purpose: 'EMPLOYMENT',       outcome: 'REVOKED',   fieldsReturned: [],                                          at: '2026-10-22T10:55:00Z', consentRef: 'CNS-7810' },
  { id: 'VL-003', verifierId: 'VFR-002', verifierName: 'Infosys HR Verification', purpose: 'EMPLOYMENT',       outcome: 'VALID',     fieldsReturned: ['degree', 'institution', 'status'],         at: '2026-10-21T14:30:00Z', consentRef: 'CNS-7745' },
  { id: 'VL-004', verifierId: 'VFR-003', verifierName: 'NAAC Accreditation',      purpose: 'ACCREDITATION',    outcome: 'VALID',     fieldsReturned: ['degree', 'year', 'institution'],           at: '2026-10-20T09:10:00Z', consentRef: 'CNS-7700' },
  { id: 'VL-005', verifierId: 'VFR-005', verifierName: 'QuickHire Pvt Ltd',       purpose: 'EMPLOYMENT',       outcome: 'DENIED',    fieldsReturned: [],                                          at: '2026-10-10T16:44:00Z', consentRef: '—' },
];

const outcomeStyle: Record<string, string> = {
  VALID:     'badge-success', REVOKED: 'badge-danger',
  NOT_FOUND: 'badge-neutral', DENIED:  'badge-warning',
};
const statusStyle: Record<string, string> = {
  ACTIVE: 'badge-success', SUSPENDED: 'badge-danger', PENDING: 'badge-warning',
};

export default function OfficerVerifierPortal() {
  const [selected, setSelected] = useState<Verifier | null>(null);
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState<'verifiers' | 'log'>('verifiers');

  const filtered = VERIFIERS.filter(v =>
    !search || [v.name, v.type, v.email].some(x => x.toLowerCase().includes(search.toLowerCase()))
  );

  const totalToday = VERIFIERS.reduce((s, v) => s + v.verificationsToday, 0);
  const activeCount = VERIFIERS.filter(v => v.status === 'ACTIVE').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Verifier Portal"
        subtitle="Manage registered verifiers, consent-based verification logs, and anti-enumeration controls."
        breadcrumb={['AICTE Officer Portal', 'Verifier Portal']}
        actions={
          <button className="btn btn-primary btn-sm">
            <Users className="w-3.5 h-3.5" /> Register Verifier
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Registered Verifiers', value: VERIFIERS.length,      color: 'text-text-primary' },
          { label: 'Active',               value: activeCount,            color: 'text-emerald-600' },
          { label: 'Verifications Today',  value: totalToday,             color: 'text-brand' },
          { label: 'Suspended / Pending',  value: VERIFIERS.filter(v => v.status !== 'ACTIVE').length, color: 'text-amber-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Privacy principle */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-brand-soft/30 border-brand/20">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">Consent-based, minimal-disclosure verification</p>
            <p>Verifiers never look up by APAAR ID. A student generates a request QR, approves the purpose, and the verifier receives only the consented fields. Quotas, purpose-binding, and anti-enumeration controls prevent bulk scanning. Students see every verification in their access log.</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-canvas rounded-card w-fit border border-border">
        {[{ key: 'verifiers', label: 'Registered Verifiers' }, { key: 'log', label: 'Verification Log' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as 'verifiers' | 'log')}
            className={`px-4 py-1.5 rounded-control text-xs font-medium transition-colors
              ${tab === t.key ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'verifiers' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input className="input pl-9 max-w-xs" placeholder="Search verifiers…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Verifier</th><th>Type</th><th>Status</th><th>Today</th><th>Quota</th><th>Total</th><th>Last Active</th></tr></thead>
                <tbody>
                  {filtered.map(v => (
                    <tr key={v.id} className="cursor-pointer" onClick={() => setSelected(v)}>
                      <td>
                        <p className="text-sm font-semibold text-text-primary">{v.name}</p>
                        <p className="text-xs text-text-muted">{v.email}</p>
                      </td>
                      <td><span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{v.type}</span></td>
                      <td><span className={`badge text-xs ${statusStyle[v.status]}`}>{v.status}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-sm font-semibold">{v.verificationsToday}</span>
                          <div className="w-12 progress-bar">
                            <div className="progress-fill bg-brand" style={{ width: v.quotaDaily > 0 ? `${Math.min((v.verificationsToday / v.quotaDaily) * 100, 100)}%` : '0%' }} />
                          </div>
                        </div>
                      </td>
                      <td className="tabular-nums text-text-secondary text-sm">{v.quotaDaily}/day</td>
                      <td className="tabular-nums font-semibold">{v.totalVerifications.toLocaleString()}</td>
                      <td className="text-xs text-text-muted">{v.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'log' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Ref</th><th>Verifier</th><th>Purpose</th><th>Outcome</th><th>Fields Returned</th><th>Consent</th><th>Time</th></tr></thead>
              <tbody>
                {VERIFICATION_LOGS.map(log => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-brand">{log.id}</td>
                    <td className="text-sm font-medium">{log.verifierName}</td>
                    <td><span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{log.purpose}</span></td>
                    <td><span className={`badge text-xs ${outcomeStyle[log.outcome]}`}>{log.outcome}</span></td>
                    <td className="text-xs text-text-muted">{log.fieldsReturned.length > 0 ? log.fieldsReturned.join(', ') : '—'}</td>
                    <td className="font-mono text-xs text-text-muted">{log.consentRef}</td>
                    <td className="text-xs text-text-muted">{new Date(log.at).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verifier detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setSelected(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-soft rounded-card flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{selected.id} · {selected.type}</p>
                    <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge text-xs ${statusStyle[selected.status]}`}>{selected.status}</span>
                  <span className="badge badge-neutral text-xs">{selected.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Email',        selected.email],
                    ['Registered',   selected.registeredOn],
                    ['Last Active',  selected.lastActive],
                    ['Daily Quota',  `${selected.quotaDaily}/day`],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="text-sm font-medium text-text-primary">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-canvas rounded-card">
                    <p className="text-xl font-bold text-brand">{selected.verificationsToday}</p>
                    <p className="text-xs text-text-muted">Today</p>
                  </div>
                  <div className="p-3 bg-canvas rounded-card">
                    <p className="text-xl font-bold text-text-primary">{selected.totalVerifications.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">Total</p>
                  </div>
                </div>
                <div>
                  <p className="label mb-2">Allowed Purposes</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.purposesAllowed.length > 0
                      ? selected.purposesAllowed.map(p => (
                          <span key={p} className="px-2.5 py-1 bg-canvas border border-border rounded-control text-xs font-mono text-text-primary">{p}</span>
                        ))
                      : <span className="text-xs text-text-muted">None approved yet</span>}
                  </div>
                </div>

                {selected.status === 'SUSPENDED' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-card flex items-center gap-2 text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Verifier suspended. Verifications are denied. Review and reinstate if appropriate.
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-border">
                  <button className="btn btn-secondary w-full"><Eye className="w-3.5 h-3.5" /> View Verification Log</button>
                  <button className="btn btn-secondary w-full"><QrCode className="w-3.5 h-3.5" /> View QR Request History</button>
                  {selected.status === 'ACTIVE' && (
                    <button className="btn btn-danger w-full"><XCircle className="w-3.5 h-3.5" /> Suspend Verifier</button>
                  )}
                  {selected.status === 'SUSPENDED' && (
                    <button className="btn btn-primary w-full"><CheckCircle2 className="w-3.5 h-3.5" /> Reinstate Verifier</button>
                  )}
                  {selected.status === 'PENDING' && (
                    <button className="btn btn-primary w-full"><CheckCircle2 className="w-3.5 h-3.5" /> Approve Registration</button>
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

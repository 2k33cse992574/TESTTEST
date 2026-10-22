import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from '@/components/ui/ActivityTimeline';
import { mockTimeline } from '@/data/mockData';
import {
  GitMerge, User, Link2, AlertTriangle, CheckCircle2,
  ChevronRight, X, Search, Info, RotateCcw,
} from 'lucide-react';

interface IdentityRecord {
  id: string; personId: string; name: string;
  apaarId?: string; ppid?: string; institution: string;
  trustLevel: number; status: string; mergedInto?: string;
  matchScore?: number; conflictType?: string;
}

const IDENTITY_RECORDS: IdentityRecord[] = [
  { id: 'IR-001', personId: 'PID-4821', name: 'Arjun Sharma',      apaarId: '1234-5678-9012', institution: 'SIET Mumbai',           trustLevel: 3, status: 'VERIFIED' },
  { id: 'IR-002', personId: 'PID-7749', name: 'Rahul Verma',       apaarId: '3456-7890-1234', institution: 'SIET Mumbai',           trustLevel: 1, status: 'CONFLICT',   conflictType: 'DUP_ENROLMENT',    matchScore: 99 },
  { id: 'IR-003', personId: 'PID-9934', name: 'Omar Al-Hassan',                               institution: 'RV College Bengaluru', trustLevel: 1, status: 'PROVISIONAL', ppid: 'PPID-9934' },
  { id: 'IR-004', personId: 'PID-6612', name: 'Priya Menon',       apaarId: '5678-9012-3456', institution: 'RV College Bengaluru', trustLevel: 4, status: 'VERIFIED' },
  { id: 'IR-005', personId: 'PID-8801A', name: 'Kiran Reddy',      apaarId: '6789-0123-4567', institution: 'JNTU Hyderabad',       trustLevel: 2, status: 'VERIFIED' },
  { id: 'IR-006', personId: 'PID-8801B', name: 'Kiran Redy',       apaarId: '6789-0123-9999', institution: 'DDIT Nadiad',          trustLevel: 1, status: 'CANDIDATE',  conflictType: 'POSSIBLE_SAME_PERSON', matchScore: 78 },
  { id: 'IR-007', personId: 'PID-5571', name: 'Vikram Joshi',      apaarId: '8901-2345-6789', institution: 'SIET Mumbai',          trustLevel: 3, status: 'VERIFIED' },
  { id: 'IR-008', personId: 'PID-2205', name: 'Sneha Kulkarni',    apaarId: '4567-8901-2345', institution: 'SIET Mumbai',          trustLevel: 3, status: 'VERIFIED' },
];

const MERGE_JOURNAL = [
  { id: 'MJ-001', survivor: 'PID-4821', absorbed: 'PID-4821B', method: 'APAAR_MATCH', confidence: 0.97, approvedBy: 'Shri Rajesh Kumar', mergedAt: '2026-09-12T10:00:00Z', undoneAt: null, reason: 'Same person with stale provisional ID after APAAR registration.' },
  { id: 'MJ-002', survivor: 'PID-6612', absorbed: 'PID-6612C', method: 'APAAR_MATCH', confidence: 0.99, approvedBy: 'System',            mergedAt: '2026-08-20T14:30:00Z', undoneAt: null, reason: 'Auto-merge: name match 0.99, DOB exact, APAAR confirmed.' },
];

const statusStyle: Record<string, string> = {
  VERIFIED:    'badge-success',
  CONFLICT:    'badge-danger',
  PROVISIONAL: 'badge-warning',
  CANDIDATE:   'badge-info',
};

export default function OfficerIdentityGraph() {
  const [selected, setSelected] = useState<IdentityRecord | null>(null);
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState<'records'|'merges'>('records');
  const [merging,  setMerging]  = useState(false);
  const [merged,   setMerged]   = useState(false);

  const filtered = IDENTITY_RECORDS.filter(r =>
    !search || [r.name, r.personId, r.apaarId ?? '', r.ppid ?? '', r.institution]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const conflicts   = IDENTITY_RECORDS.filter(r => r.status === 'CONFLICT');
  const candidates  = IDENTITY_RECORDS.filter(r => r.status === 'CANDIDATE');
  const provisional = IDENTITY_RECORDS.filter(r => r.status === 'PROVISIONAL');

  const handleMerge = () => {
    setMerging(true);
    setTimeout(() => { setMerging(false); setMerged(true); }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Identity Resolution"
        subtitle="Cross-institution identity graph — APAAR aliases, provisional identities, merge journal, and conflict mediation."
        breadcrumb={['AICTE Officer Portal', 'Identity Graph']}
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Identities',      value: IDENTITY_RECORDS.length, color: 'text-text-primary' },
          { label: 'Conflicts (Active)',     value: conflicts.length,         color: 'text-danger' },
          { label: 'Possible Matches',       value: candidates.length,        color: 'text-amber-600' },
          { label: 'Provisional (No APAAR)',value: provisional.length,       color: 'text-blue-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* PPID explainer */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-brand-soft/30 border-brand/20">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">How identity resolution works</p>
            <p>APAAR is the primary alias — a random internal <code className="bg-canvas px-1 rounded">person_id</code> links all aliases. For FN/OCI/NRI without APAAR, a <span className="font-medium">Provisional ID (PPID)</span> is issued using keyed blocking keys (name+DOB, contact, photo hash). When APAAR is later issued, the PPID merges with history preserved. All merges are reversible.</p>
          </div>
        </div>
      </motion.div>

      {/* Conflict alerts */}
      {(conflicts.length > 0 || candidates.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="space-y-2">
          <h2 className="text-sm font-semibold text-text-primary">Requires Attention</h2>
          {[...conflicts, ...candidates].map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 + i * 0.05 }}
              className="card border-l-4 border-l-danger cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => setSelected(r)}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-text-primary">{r.name}</span>
                    <span className={`badge text-xs ${statusStyle[r.status]}`}>{r.status}</span>
                    {r.conflictType && <span className="text-xs px-1.5 py-0.5 bg-canvas border border-border rounded font-mono text-text-muted">{r.conflictType}</span>}
                    {r.matchScore && <span className="text-xs font-semibold text-brand">Match: {r.matchScore}%</span>}
                  </div>
                  <p className="text-xs text-text-secondary">{r.institution} · {r.personId}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {r.status === 'CONFLICT' && 'Active full-time enrolment conflict. Mediation required.'}
                    {r.status === 'CANDIDATE' && `Possible same person as ${r.name} at another institution. Confirm before merging.`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-canvas rounded-card w-fit border border-border">
        {[{ key: 'records', label: 'Identity Records' }, { key: 'merges', label: 'Merge Journal' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as 'records' | 'merges')}
            className={`px-4 py-1.5 rounded-control text-xs font-medium transition-colors
              ${tab === t.key ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'records' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input className="input pl-9 max-w-xs" placeholder="Search by name, person ID, APAAR…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Person ID</th><th>Name</th><th>APAAR / PPID</th>
                    <th>Institution</th><th>Trust</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                      <td className="font-mono text-xs text-brand">{r.personId}</td>
                      <td className="font-semibold text-sm">{r.name}</td>
                      <td className="font-mono text-xs text-text-muted">
                        {r.apaarId ? r.apaarId.replace(/-\d{4}-\d{4}$/, '-****-****') : r.ppid ?? '—'}
                      </td>
                      <td className="text-xs text-text-secondary">{r.institution}</td>
                      <td>
                        <div className="flex gap-0.5">
                          {[0,1,2,3,4].map(l => (
                            <div key={l} className={`w-2 h-2 rounded-full ${l <= r.trustLevel
                              ? l <= 1 ? 'bg-gray-400' : l === 2 ? 'bg-blue-500' : l === 3 ? 'bg-emerald-500' : 'bg-brand'
                              : 'bg-border'}`} />
                          ))}
                        </div>
                      </td>
                      <td><span className={`badge text-xs ${statusStyle[r.status] ?? 'badge-neutral'}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'merges' && (
        <div className="space-y-3">
          {MERGE_JOURNAL.map((mj, i) => (
            <motion.div key={mj.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-soft rounded-card flex items-center justify-center flex-shrink-0">
                  <GitMerge className="w-4 h-4 text-brand" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-brand font-semibold">{mj.id}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-canvas border border-border rounded font-mono text-text-muted">{mj.method}</span>
                    <span className="text-xs font-semibold text-emerald-600">Confidence: {Math.round(mj.confidence * 100)}%</span>
                    {mj.undoneAt && <span className="badge badge-danger text-xs">UNDONE</span>}
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{mj.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />Approved by {mj.approvedBy}</span>
                    <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{mj.survivor} ← {mj.absorbed}</span>
                    <span>{new Date(mj.mergedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm text-xs flex-shrink-0">
                  <RotateCcw className="w-3 h-3" /> Undo
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => { setSelected(null); setMerged(false); }} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-soft rounded-card flex items-center justify-center">
                    <User className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{selected.personId}</p>
                    <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => { setSelected(null); setMerged(false); }}><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge text-xs ${statusStyle[selected.status] ?? 'badge-neutral'}`}>{selected.status}</span>
                  <StatusBadge type="trust" value={String(selected.trustLevel)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Person ID', selected.personId],
                    ['APAAR ID',  selected.apaarId ? selected.apaarId.replace(/-\d{4}-\d{4}$/, '-****-****') : '—'],
                    ['PPID',      selected.ppid ?? '—'],
                    ['Institution', selected.institution],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="text-sm font-medium text-text-primary font-mono">{val}</p>
                    </div>
                  ))}
                </div>

                {selected.conflictType && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-card">
                    <p className="text-xs font-semibold text-danger mb-1">{selected.conflictType}</p>
                    {selected.matchScore && (
                      <p className="text-xs text-red-700">Identity match score: <span className="font-bold">{selected.matchScore}%</span></p>
                    )}
                    <p className="text-xs text-red-600 mt-1">
                      {selected.status === 'CONFLICT'
                        ? 'Active full-time enrolment conflict. One claim is on CONFLICT_HOLD. Mediation required before resolution.'
                        : 'Candidate match — fuzzy scoring suggests possible same person. Human confirmation required before merge.'}
                    </p>
                  </div>
                )}

                {selected.status === 'PROVISIONAL' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-800">
                    <p className="font-semibold mb-1">Provisional identity (no APAAR)</p>
                    <p>A PPID was issued based on document verification. When APAAR is issued, link it here to merge records with history preserved.</p>
                  </div>
                )}

                <div>
                  <p className="label mb-3">Identity Event History</p>
                  <ActivityTimeline events={mockTimeline.slice(0, 3)} />
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  {selected.status === 'CANDIDATE' && !merged && (
                    <>
                      <button className="btn btn-primary w-full" onClick={handleMerge} disabled={merging}>
                        {merging
                          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          : <GitMerge className="w-3.5 h-3.5" />}
                        {merging ? 'Merging…' : 'Confirm Merge (officer approval)'}
                      </button>
                      <button className="btn btn-secondary w-full">Reject Match — Keep Separate</button>
                    </>
                  )}
                  {merged && (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Merge recorded</p>
                        <p className="text-xs text-emerald-700 mt-0.5">History preserved. Merge journal entry created. Reversible.</p>
                      </div>
                    </motion.div>
                  )}
                  {selected.status === 'CONFLICT' && (
                    <>
                      <button className="btn btn-primary w-full">Mediate Conflict</button>
                      <button className="btn btn-secondary w-full">Approve Exception (dual degree)</button>
                    </>
                  )}
                  {selected.status === 'PROVISIONAL' && (
                    <button className="btn btn-primary w-full">Link APAAR to Provisional ID</button>
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

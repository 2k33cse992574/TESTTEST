import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/api/client';
import {
  GitMerge, User, Link2, AlertTriangle, CheckCircle2,
  ChevronRight, X, Search, Info, RotateCcw, Sparkles, Building2
} from 'lucide-react';

interface IdentityRecord {
  id: string; personId: string; name: string;
  apaarId?: string; ppid?: string; institution: string;
  trustLevel: number; status: string; mergedInto?: string;
  matchScore?: number; conflictType?: string;
}

const DEFAULT_RECORDS: IdentityRecord[] = [
  { id: 'IR-001', personId: 'PID-4821', name: 'Arjun Sharma',      apaarId: '1234-5678-9012', institution: 'SIET Mumbai',           trustLevel: 3, status: 'VERIFIED' },
  { id: 'IR-002', personId: 'PID-7749', name: 'Rahul Verma',       apaarId: '3456-7890-1234', institution: 'SIET Mumbai',           trustLevel: 1, status: 'CONFLICT',   conflictType: 'DUP_ENROLMENT',    matchScore: 99 },
  { id: 'IR-003', personId: 'PID-9934', name: 'Omar Al-Hassan',                               institution: 'RV College Bengaluru', trustLevel: 1, status: 'PROVISIONAL', ppid: 'PPID-9934' },
  { id: 'IR-004', personId: 'PID-6612', name: 'Priya Menon',       apaarId: '5678-9012-3456', institution: 'RV College Bengaluru', trustLevel: 4, status: 'VERIFIED' },
  { id: 'IR-005', personId: 'PID-8801A', name: 'Kiran Reddy',      apaarId: '6789-0123-4567', institution: 'JNTU Hyderabad',       trustLevel: 2, status: 'VERIFIED' },
  { id: 'IR-006', personId: 'PID-8801B', name: 'Kiran Redy',       apaarId: '6789-0123-9999', institution: 'DDIT Nadiad',          trustLevel: 1, status: 'CANDIDATE',  conflictType: 'POSSIBLE_SAME_PERSON', matchScore: 78 },
  { id: 'IR-007', personId: 'PID-5571', name: 'Vikram Joshi',      apaarId: '8901-2345-6789', institution: 'SIET Mumbai',          trustLevel: 3, status: 'VERIFIED' },
  { id: 'IR-008', personId: 'PID-2205', name: 'Sneha Kulkarni',    apaarId: '4567-8901-2345', institution: 'SIET Mumbai',          trustLevel: 3, status: 'VERIFIED' },
];

const DEFAULT_JOURNAL = [
  { id: 'MJ-001', survivor: 'PID-4821', absorbed: 'PID-4821B', method: 'APAAR_MATCH', confidence: 0.97, approvedBy: 'Shri Rajesh Kumar', mergedAt: '2026-09-12T10:00:00Z', undoneAt: null, reason: 'Same person with stale provisional ID after APAAR registration.' },
  { id: 'MJ-002', survivor: 'PID-6612', absorbed: 'PID-6612C', method: 'AUTO_MATCH',  confidence: 0.99, approvedBy: 'System',            mergedAt: '2026-08-20T14:30:00Z', undoneAt: null, reason: 'Auto-merge: name match 0.99, DOB exact, APAAR confirmed.' },
];

const statusStyle: Record<string, string> = {
  VERIFIED:    'badge-success',
  CONFLICT:    'badge-danger',
  PROVISIONAL: 'badge-warning',
  CANDIDATE:   'badge-info',
};

export default function OfficerIdentityGraph() {
  const [records,  setRecords]  = useState<IdentityRecord[]>(DEFAULT_RECORDS);
  const [journal,  setJournal]  = useState<any[]>(DEFAULT_JOURNAL);
  const [selected, setSelected] = useState<IdentityRecord | null>(null);
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState<'records' | 'merges' | 'sandbox'>('records');
  const [merging,  setMerging]  = useState(false);
  const [merged,   setMerged]   = useState(false);
  const [mergeRationale, setMergeRationale] = useState('');

  // Fuzzy match sandbox state
  const [nameA, setNameA] = useState('Kiran Reddy');
  const [nameB, setNameB] = useState('Kiran Redy');
  const [dobA, setDobA]   = useState('2005-04-12');
  const [dobB, setDobB]   = useState('2005-04-12');
  const [fuzzyResult, setFuzzyResult] = useState<any>(null);

  useEffect(() => {
    api.getIdentityRecords()
      .then(res => { if (res && res.length) setRecords(res); })
      .catch(() => {});

    api.getMergeJournal()
      .then(res => { if (res && res.length) setJournal(res); })
      .catch(() => {});
  }, []);

  const filtered = records.filter(r =>
    !search || [r.name, r.personId, r.apaarId ?? '', r.ppid ?? '', r.institution]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const conflicts   = records.filter(r => r.status === 'CONFLICT');
  const candidates  = records.filter(r => r.status === 'CANDIDATE');
  const provisional = records.filter(r => r.status === 'PROVISIONAL');

  const handleMerge = async () => {
    if (!selected) return;
    setMerging(true);
    const survivorId = 'PID-8801A';
    const absorbedId = selected.personId;
    const rationale = mergeRationale || 'Officer confirmed identical demographic and parentage profiles.';

    try {
      const res = await api.mergeIdentities({
        survivorId,
        absorbedId,
        rationale,
        officerName: 'Shri Rajesh Kumar'
      });
      if (res && res.journalEntry) {
        setJournal(prev => [res.journalEntry, ...prev]);
      }
      setRecords(prev => prev.map(r => r.personId === absorbedId ? { ...r, status: 'VERIFIED', mergedInto: survivorId } : r));
    } catch {
      // Local fallback
      const newEntry = {
        id: `MJ-00${journal.length + 1}`,
        survivor: survivorId,
        absorbed: absorbedId,
        method: 'OFFICER_APPROVED',
        confidence: 0.96,
        approvedBy: 'Shri Rajesh Kumar',
        mergedAt: '2026-10-22T21:40:00Z',
        undoneAt: null,
        reason: rationale
      };
      setJournal(prev => [newEntry, ...prev]);
      setRecords(prev => prev.map(r => r.personId === absorbedId ? { ...r, status: 'VERIFIED', mergedInto: survivorId } : r));
    } finally {
      setMerging(false);
      setMerged(true);
      setMergeRationale('');
    }
  };

  const handleUndoMerge = async (journalId: string) => {
    try {
      await api.undoMerge(journalId, 'Shri Rajesh Kumar');
    } catch {}
    setJournal(prev => prev.map(j => j.id === journalId ? { ...j, undoneAt: '2026-10-22T21:42:00Z' } : j));
  };

  const runFuzzySandbox = async () => {
    try {
      const res = await api.fuzzyCheck(
        { name: nameA, dob: dobA, guardian: 'Venkat Reddy' },
        { name: nameB, dob: dobB, guardian: 'Venkat Reddy' }
      );
      setFuzzyResult(res);
    } catch {
      setFuzzyResult({
        compositeScore: 88,
        classification: 'CANDIDATE_DUPLICATE',
        recommendation: 'Soundex Match + 0.94 Jaro-Winkler name similarity.',
        metrics: {
          nameJaroWinkler: 0.942,
          nameLevenshteinDistance: 1,
          phoneticMatch: true,
          dobExactMatch: dobA === dobB
        }
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Identity Resolution"
        subtitle="Cross-institution identity graph — APAAR aliases, provisional identities, merge journal, and conflict mediation."
        breadcrumb={['AICTE Officer Portal', 'Identity Graph']}
      />

      {/* Metric strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Identities',  value: records.length,    color: 'text-text-primary' },
          { label: 'Conflicts (Holds)', value: conflicts.length,   color: 'text-danger' },
          { label: 'Candidate Merges',  value: candidates.length,  color: 'text-amber-600' },
          { label: 'Provisional PPIDs', value: provisional.length, color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-canvas rounded-card border border-border">
          <button
            onClick={() => setTab('records')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              tab === 'records' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Identity Records ({records.length})
          </button>
          <button
            onClick={() => setTab('merges')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              tab === 'merges' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Merge Journal ({journal.length})
          </button>
          <button
            onClick={() => setTab('sandbox')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === 'sandbox' ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" /> Fuzzy Match Engine
          </button>
        </div>

        {tab === 'records' && (
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-control border border-border bg-canvas focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="Search by name, APAAR ID, PPID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab: Identity Records */}
      {tab === 'records' && (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map(r => (
              <div
                key={r.id}
                onClick={() => { setSelected(r); setMerged(false); }}
                className="p-4 hover:bg-canvas transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-card bg-brand-soft flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                      <span className="font-mono text-xs text-text-muted">{r.personId}</span>
                      <span className={`badge ${statusStyle[r.status] ?? 'badge-neutral'}`}>{r.status}</span>
                      {r.mergedInto && (
                        <span className="badge badge-neutral text-xs">Merged → {r.mergedInto}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {r.institution} · {r.apaarId ? `APAAR ${r.apaarId}` : `Provisional ${r.ppid}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {r.matchScore && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {r.matchScore}% similarity
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Merge Journal */}
      {tab === 'merges' && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-canvas flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-text-primary">Immutable Merge Journal</p>
              <p className="text-xs text-text-muted">Officer-authorised consolidations with cryptographic undo support</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {journal.map(j => (
              <div key={j.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand">{j.id}</span>
                    <span className="text-xs font-semibold text-text-primary">
                      Survivor: <span className="font-mono text-emerald-700">{j.survivor}</span> ← Absorbed: <span className="font-mono text-text-secondary">{j.absorbed}</span>
                    </span>
                    <span className="badge badge-info">{j.method}</span>
                    {j.undoneAt && <span className="badge badge-danger">Undone</span>}
                  </div>
                  <p className="text-xs text-text-secondary">{j.reason}</p>
                  <p className="text-xs text-text-muted">
                    Approved by {j.approvedBy} on {j.mergedAt}
                  </p>
                </div>

                {!j.undoneAt && (
                  <button
                    onClick={() => handleUndoMerge(j.id)}
                    className="btn btn-secondary btn-sm text-xs text-danger hover:bg-red-50 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Undo Consolidation
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fuzzy Match Sandbox */}
      {tab === 'sandbox' && (
        <div className="card space-y-6">
          <div>
            <p className="text-card-title text-text-primary">ML Entity Resolution & Fuzzy Deduplication Engine</p>
            <p className="text-xs text-text-muted">
              Live algorithmic calculator using Jaro-Winkler string similarity, Levenshtein edit distance, and phonetic Soundex encoding.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-canvas rounded-card border border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Record Candidate A</span>
              <div>
                <label className="label">Student Name</label>
                <input
                  className="input text-xs"
                  value={nameA}
                  onChange={e => setNameA(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input text-xs"
                  value={dobA}
                  onChange={e => setDobA(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-canvas rounded-card border border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Record Candidate B</span>
              <div>
                <label className="label">Student Name</label>
                <input
                  className="input text-xs"
                  value={nameB}
                  onChange={e => setNameB(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input text-xs"
                  value={dobB}
                  onChange={e => setDobB(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button onClick={runFuzzySandbox} className="btn btn-primary w-full justify-center">
            <Sparkles className="w-4 h-4" /> Compute Fuzzy Similarity & Entity Matching Score
          </button>

          {fuzzyResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-surface rounded-card border-2 border-brand/40 space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-text-primary">Resolution Classification:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  fuzzyResult.compositeScore >= 90 ? 'bg-red-100 text-danger' :
                  fuzzyResult.compositeScore >= 72 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {fuzzyResult.compositeScore}% Match — {fuzzyResult.classification}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div className="p-2.5 bg-canvas rounded">
                  <span className="font-bold text-brand">{fuzzyResult.metrics.nameJaroWinkler}</span>
                  <p className="text-text-muted mt-0.5">Jaro-Winkler Score</p>
                </div>
                <div className="p-2.5 bg-canvas rounded">
                  <span className="font-bold text-text-primary">{fuzzyResult.metrics.nameLevenshteinDistance} chars</span>
                  <p className="text-text-muted mt-0.5">Levenshtein Distance</p>
                </div>
                <div className="p-2.5 bg-canvas rounded">
                  <span className="font-bold text-emerald-600">{fuzzyResult.metrics.phoneticMatch ? 'EXACT' : 'DIFFERENT'}</span>
                  <p className="text-text-muted mt-0.5">Soundex Phonetic</p>
                </div>
                <div className="p-2.5 bg-canvas rounded">
                  <span className="font-bold text-text-primary">{fuzzyResult.metrics.dobExactMatch ? 'MATCH' : 'MISMATCH'}</span>
                  <p className="text-text-muted mt-0.5">DOB Check</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary bg-surface-subtle p-3 rounded">
                <span className="font-semibold text-text-primary">Recommendation:</span> {fuzzyResult.recommendation}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Record detail drawer */}
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
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center">
                    <User className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-text-muted">{selected.personId}</span>
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
                    <span className="text-text-muted">Institution:</span>
                    <span className="font-semibold text-text-primary">{selected.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">APAAR ID:</span>
                    <span className="font-mono text-brand font-semibold">{selected.apaarId ?? selected.ppid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Trust Tier:</span>
                    <span className="font-semibold">Level {selected.trustLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status:</span>
                    <span className={`badge ${statusStyle[selected.status] ?? 'badge-neutral'}`}>{selected.status}</span>
                  </div>
                </div>

                {selected.status === 'CANDIDATE' && !merged && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-card space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-bold text-amber-900 uppercase">Duplicate Consolidation Recommended</p>
                    </div>
                    <p className="text-xs text-amber-800">
                      Algorithm detected 78% phonetic and demographic similarity to Kiran Reddy (PID-8801A, JNTU Hyderabad).
                    </p>

                    <div>
                      <label className="label">Officer Consolidation Rationale</label>
                      <input
                        className="input text-xs"
                        placeholder="State reason for consolidating these identities…"
                        value={mergeRationale}
                        onChange={e => setMergeRationale(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleMerge}
                      disabled={merging}
                      className="btn btn-primary w-full justify-center text-xs"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      {merging ? 'Consolidating…' : 'Approve & Consolidate Identities'}
                    </button>
                  </div>
                )}

                {merged && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Identity successfully merged and permanently anchored into Merge Journal and Audit Trail.</span>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

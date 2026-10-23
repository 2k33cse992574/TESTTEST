import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/api/client';
import {
  History, CheckCircle2, AlertTriangle, XCircle, Shield,
  Hash, Clock, User, Building2, Search, Calendar, Download,
  RotateCcw, Sparkles
} from 'lucide-react';

interface AuditEvent {
  chainId: number; seq: number; ts: string;
  actor: string; actorType: 'system' | 'officer' | 'institution' | 'student';
  action: string; entity: string; entityId: string;
  payloadDigest: string; prevHash: string; thisHash: string;
  valid: boolean; detail: string;
}

const DEFAULT_EVENTS: AuditEvent[] = [
  { chainId: 1, seq: 1042, ts: '2026-10-22T11:14:22Z', actor: 'Shri Rajesh Kumar', actorType: 'officer',      action: 'CASE_DECISION_RECORDED',    entity: 'case',       entityId: 'C-0021', payloadDigest: 'a3f2...d91c', prevHash: 'e4b1...8a3f', thisHash: 'c7d4...12fe', valid: true,  detail: 'Outcome: Resolved — no issue. Rationale recorded. Audit chain updated.' },
  { chainId: 1, seq: 1041, ts: '2026-10-22T10:58:01Z', actor: 'APAAR Service',     actorType: 'system',       action: 'IDENTITY_VERIFIED',          entity: 'enrolment',  entityId: 's12',    payloadDigest: 'b9c3...44ad', prevHash: 'd2e8...f174', thisHash: 'e4b1...8a3f', valid: true,  detail: 'APAAR 1234-5678-2222 verified. Name match 0.99. DOB exact.' },
  { chainId: 1, seq: 1040, ts: '2026-10-22T10:30:14Z', actor: 'Dr. Priya Nair',    actorType: 'institution',  action: 'BATCH_SUBMITTED',            entity: 'batch',      entityId: 'BATCH-2901', payloadDigest: '77de...c2b1', prevHash: '9f4a...2211', thisHash: 'd2e8...f174', valid: true,  detail: '245 rows submitted. 231 accepted, 8 rejected, 6 held. Signed receipt issued.' },
  { chainId: 2, seq: 88,   ts: '2026-10-21T15:44:09Z', actor: 'System',            actorType: 'system',       action: 'SEAT_CLAIM',                 entity: 'seat_pool',  entityId: 'POOL-CSE-REG', payloadDigest: 'f0a2...8b3d', prevHash: '4c19...7e6a', thisHash: '9f4a...2211', valid: true,  detail: 'Slot 62 assigned in REGULAR pool. over_by=2. INTAKE_BREACH case opened.' },
  { chainId: 2, seq: 87,   ts: '2026-10-21T14:22:33Z', actor: 'System',            actorType: 'system',       action: 'SINGLE_SEAT_LOCK_CONFLICT',  entity: 'enrolment',  entityId: 's3',     payloadDigest: '2c84...a91b', prevHash: 'b7f3...5d40', thisHash: '4c19...7e6a', valid: true,  detail: 'Conflict hold applied. DUP_ENROLMENT case C-0042 opened. Both institutions notified.' },
  { chainId: 1, seq: 1039, ts: '2026-10-20T09:10:05Z', actor: 'Shri Rajesh Kumar', actorType: 'officer',      action: 'TRUST_LEVEL_UPDATED',        entity: 'enrolment',  entityId: 's6',     payloadDigest: 'dd91...3c7e', prevHash: '1a5b...cc20', thisHash: 'b7f3...5d40', valid: true,  detail: 'Trust promoted to L4 AICTE-Certified after annual affirmation review.' },
  { chainId: 3, seq: 12,   ts: '2026-10-19T16:55:18Z', actor: 'System',            actorType: 'system',       action: 'MERKLE_CHECKPOINT',          entity: 'audit_chain', entityId: 'DAILY',    payloadDigest: '88fe...01da', prevHash: 'a2c4...9f1e', thisHash: '1a5b...cc20', valid: true,  detail: 'Daily Merkle root computed and signed. 3 chains checkpointed. External timestamp issued.' },
  { chainId: 1, seq: 1038, ts: '2026-10-18T11:30:00Z', actor: 'APAAR Service',     actorType: 'system',       action: 'IDENTITY_VERIFY_FAILED',     entity: 'enrolment',  entityId: 's5',       payloadDigest: '3e7c...b44f', prevHash: 'f8a1...7c30', thisHash: 'a2c4...9f1e', valid: true,  detail: 'FN student without APAAR. Provisional PPID issued. L1 trust assigned. Re-verify queued.' },
  { chainId: 2, seq: 86,   ts: '2026-10-17T08:00:00Z', actor: 'System',            actorType: 'system',       action: 'LEDGER_INVARIANT_CHECK',     entity: 'seat_ledger', entityId: 'NIGHTLY', payloadDigest: 'c1f5...22ab', prevHash: '5b9d...4e10', thisHash: 'f8a1...7c30', valid: true,  detail: 'Nightly invariant passed. claimed=count(active enrolments) for all pools.' },
  { chainId: 1, seq: 1037, ts: '2026-10-15T14:20:00Z', actor: 'Omar Al-Hassan',    actorType: 'student',      action: 'CREDENTIAL_REVOKED',         entity: 'credential', entityId: 'CRED-0091', payloadDigest: '9d2e...f7bc', prevHash: '2a8c...55de', thisHash: '5b9d...4e10', valid: true,  detail: 'Student revoked consent for employer verification. Next scan will return REVOKED.' },
];

const actorIcon: Record<string, React.ElementType> = {
  system: Shield, officer: User, institution: Building2, student: User,
};
const actorColor: Record<string, string> = {
  system: 'bg-blue-50 text-blue-600', officer: 'bg-brand-soft text-brand',
  institution: 'bg-emerald-50 text-emerald-600', student: 'bg-amber-50 text-amber-600',
};

export default function OfficerAuditTrail() {
  const [events, setEvents]         = useState<AuditEvent[]>(DEFAULT_EVENTS);
  const [chainStatus, setChainStatus] = useState<any>({ isValid: true, reason: 'All cryptographic hash chains healthy.' });
  const [asOf, setAsOf]             = useState('');
  const [timeMachineActive, setTimeMachineActive] = useState(false);
  const [search, setSearch]         = useState('');
  const [simulating, setSimulating] = useState(false);

  const fetchChain = () => {
    api.getAuditChain()
      .then(res => { if (res && res.length) setEvents(res); })
      .catch(() => {});
    api.verifyAuditChain()
      .then(res => { if (res) setChainStatus(res); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchChain();
  }, []);

  const handleSimulateTamper = async () => {
    setSimulating(true);
    try {
      await api.simulateTamper({ seq: 1040 });
      fetchChain();
    } catch {
      // Local fallback
      setChainStatus({
        isValid: false,
        brokenSeq: 1040,
        reason: 'Block #1040 payload corrupted! Hash mismatch: stored d2e8... vs calculated e3b0...'
      });
      setEvents(prev => prev.map(e => e.seq === 1040 ? { ...e, valid: false, thisHash: 'MISMATCH', actor: '[MODIFIED]' } : e));
    } finally {
      setSimulating(false);
    }
  };

  const handleRestoreChain = async () => {
    try {
      await api.restoreAuditChain();
      fetchChain();
    } catch {
      setChainStatus({ isValid: true, reason: 'Chain restored.' });
      setEvents(DEFAULT_EVENTS);
    }
  };

  const activateTimeMachine = () => {
    if (!asOf) return;
    api.timeMachineReplay(asOf)
      .then(res => {
        if (res && res.events) {
          setEvents(res.events);
          setTimeMachineActive(true);
        }
      })
      .catch(() => {
        setEvents(DEFAULT_EVENTS.filter(e => e.ts <= asOf));
        setTimeMachineActive(true);
      });
  };

  const resetTimeMachine = () => {
    setTimeMachineActive(false);
    setAsOf('');
    fetchChain();
  };

  const handleExport = () => {
    const headers = ["Seq", "Chain", "Timestamp", "Actor", "Actor Type", "Action", "Entity", "Entity ID", "Prev Hash", "This Hash", "Valid", "Detail"];
    const rows = events.map(e => [
      e.seq, e.chainId, e.ts, e.actor, e.actorType, e.action, e.entity, e.entityId, e.prevHash, e.thisHash, e.valid, `"${e.detail.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AICTE_Cryptographic_Audit_Trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = events.filter(e =>
    !search || [e.actor, e.action, e.entity, e.entityId, e.detail]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Audit Trail"
        subtitle="Tamper-evident, hash-chained cryptographic ledger. Every enrolment action is SHA-256 digested and verified."
        breadcrumb={['AICTE Officer Portal', 'Audit Trail']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" /> Export Audit Log
            </button>
          </div>
        }
      />

      {/* Chain Integrity Alert Banner */}
      {!chainStatus.isValid ? (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-danger flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-red-900">
                HASH CHAIN INTEGRITY BREACH: Block #{chainStatus.brokenSeq} Corrupted!
              </p>
              <p className="text-xs text-red-700 mt-0.5">{chainStatus.reason}</p>
            </div>
          </div>
          <button
            onClick={handleRestoreChain}
            className="btn btn-primary btn-sm text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Genuine Chain
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Cryptographic Chain Verified & Healthy
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                All SHA-256 block hash pointers (Block N → Block N-1) are mathematically intact.
              </p>
            </div>
          </div>
          <button
            onClick={handleSimulateTamper}
            disabled={simulating}
            className="btn btn-secondary btn-sm text-xs text-danger border-red-200 hover:bg-red-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-danger" /> Simulate Unauthorized Tamper
          </button>
        </div>
      )}

      {/* Chain health cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Chain 1 — Main Events', events: 1042, valid: chainStatus.isValid, lastCheckpoint: '22 Oct 2026' },
          { label: 'Chain 2 — Seat Ledger',  events: 88,   valid: true,                lastCheckpoint: '21 Oct 2026' },
          { label: 'Chain 3 — Credentials',  events: 12,   valid: true,                lastCheckpoint: '19 Oct 2026' },
        ].map((c, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary">{c.label}</span>
              {c.valid ? (
                <span className="badge badge-success flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              ) : (
                <span className="badge badge-danger flex items-center gap-1 text-xs">
                  <XCircle className="w-3 h-3" /> Compromised
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-text-primary tabular-nums">{c.events.toLocaleString()}</p>
            <p className="text-xs text-text-muted mt-1">Last checkpoint: {c.lastCheckpoint}</p>
          </div>
        ))}
      </div>

      {/* Historical Time Machine strip */}
      <div className="card p-4 flex items-center justify-between gap-4 flex-wrap bg-surface-subtle">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand" />
          <div>
            <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Historical Time Machine</p>
            <p className="text-xs text-text-muted">Replay state and inspect ledger exactly as of past timestamp</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            className="input text-xs py-1.5"
            value={asOf}
            onChange={e => setAsOf(e.target.value)}
          />
          <button
            onClick={activateTimeMachine}
            className="btn btn-primary btn-sm text-xs"
            disabled={!asOf}
          >
            Replay Ledger
          </button>
          {timeMachineActive && (
            <button
              onClick={resetTimeMachine}
              className="btn btn-secondary btn-sm text-xs"
            >
              Reset to Present
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-control border border-border bg-canvas focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Search audit trail by actor, action, entity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-text-muted">
          Showing {filtered.length} anchored blocks
        </span>
      </div>

      {/* Event list */}
      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map(e => {
            const Icon = actorIcon[e.actorType] || Shield;
            const colorClass = actorColor[e.actorType] || 'bg-canvas text-text-secondary';
            return (
              <div
                key={`${e.chainId}-${e.seq}`}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  !e.valid ? 'bg-red-50/60 border-l-4 border-l-danger' : 'hover:bg-canvas'
                }`}
              >
                <div className={`w-8 h-8 rounded-card ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand">#{e.seq}</span>
                    <span className="text-xs font-semibold text-text-primary">{e.action}</span>
                    <span className="badge badge-neutral text-xs">Chain {e.chainId}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs font-medium text-text-secondary">{e.actor}</span>
                    {!e.valid ? (
                      <span className="badge badge-danger text-xs font-mono">HASH MISMATCH</span>
                    ) : (
                      <span className="badge badge-success text-xs font-mono">VERIFIED</span>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary">{e.detail}</p>

                  <div className="flex items-center gap-4 text-xs font-mono text-text-muted pt-1">
                    <span>Digest: {e.payloadDigest}</span>
                    <span>Prev: {e.prevHash}</span>
                    <span className={!e.valid ? 'text-danger font-bold' : ''}>This: {e.thisHash}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 text-xs text-text-muted">
                  {e.ts}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

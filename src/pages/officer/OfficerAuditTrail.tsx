import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  History, CheckCircle2, AlertTriangle, XCircle, Shield,
  Hash, Clock, User, Building2, Search, Calendar, Download,
} from 'lucide-react';

interface AuditEvent {
  chainId: number; seq: number; ts: string;
  actor: string; actorType: 'system' | 'officer' | 'institution' | 'student';
  action: string; entity: string; entityId: string;
  payloadDigest: string; prevHash: string; thisHash: string;
  valid: boolean; detail: string;
}

const AUDIT_EVENTS: AuditEvent[] = [
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

const TAMPERED_EVENT: AuditEvent = {
  chainId: 1, seq: 1036, ts: '2026-10-14T10:00:00Z',
  actor: '[MODIFIED]', actorType: 'system',
  action: 'RECORD_MODIFIED_DIRECTLY', entity: 'enrolment', entityId: 's7',
  payloadDigest: '****...****', prevHash: '????...????', thisHash: 'MISMATCH',
  valid: false, detail: 'Chain hash mismatch detected. Payload digest does not match stored digest. Possible tampering or data corruption.',
};

const actorIcon: Record<string, React.ElementType> = {
  system: Shield, officer: User, institution: Building2, student: User,
};
const actorColor: Record<string, string> = {
  system: 'bg-blue-50 text-blue-600', officer: 'bg-brand-soft text-brand',
  institution: 'bg-emerald-50 text-emerald-600', student: 'bg-amber-50 text-amber-600',
};

export default function OfficerAuditTrail() {
  const [showTamper, setShowTamper] = useState(false);
  const [asOf, setAsOf]             = useState('');
  const [timeMachineActive, setTimeMachineActive] = useState(false);
  const [search, setSearch]         = useState('');

  const allEvents = showTamper ? [...AUDIT_EVENTS, TAMPERED_EVENT].sort((a,b) => b.seq - a.seq) : AUDIT_EVENTS;
  const filtered  = allEvents.filter(e =>
    !search || [e.actor, e.action, e.entity, e.entityId, e.detail]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const activateTimeMachine = () => {
    if (asOf) setTimeMachineActive(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Audit Trail"
        subtitle="Tamper-evident, hash-chained audit log. Every action is recorded, digested, and independently anchored."
        breadcrumb={['AICTE Officer Portal', 'Audit Trail']}
        actions={
          <button className="btn btn-secondary btn-sm">
            <Download className="w-3.5 h-3.5" /> Export Audit Log
          </button>
        }
      />

      {/* Chain health */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Chain 1 — Main Events', events: 1042, valid: !showTamper, lastCheckpoint: '22 Oct 2026' },
          { label: 'Chain 2 — Seat Ledger',  events: 88,   valid: true,         lastCheckpoint: '21 Oct 2026' },
          { label: 'Chain 3 — Credentials',  events: 12,   valid: true,         lastCheckpoint: '19 Oct 2026' },
        ].map((chain, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-primary">{chain.label}</p>
              {chain.valid
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <XCircle className="w-4 h-4 text-danger animate-pulse" />}
            </div>
            <p className={`text-xl font-bold tabular-nums ${chain.valid ? 'text-text-primary' : 'text-danger'}`}>
              {chain.events.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted mt-1">events · checkpoint {chain.lastCheckpoint}</p>
            {!chain.valid && (
              <p className="text-xs text-danger font-semibold mt-1">⚠ Integrity violation detected</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Time Machine */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Time Machine</h2>
          <span className="badge badge-brand text-xs">Bitemporal</span>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          Query what AICTE knew at any past date. Uses bitemporal history — <span className="font-medium">effective_at</span> (when it was true) vs <span className="font-medium">recorded_at</span> (when we learned it). Essential for audits and fair appeals.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="date" className="input flex-1" max="2026-10-22"
              value={asOf} onChange={e => { setAsOf(e.target.value); setTimeMachineActive(false); }}
            />
          </div>
          <button className="btn btn-primary" onClick={activateTimeMachine} disabled={!asOf}>
            <History className="w-3.5 h-3.5" /> Rewind to This Date
          </button>
        </div>

        <AnimatePresence>
          {timeMachineActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-brand-soft/40 border border-brand/20 rounded-card"
            >
              <p className="text-xs font-semibold text-brand mb-2">
                Showing system state as of {new Date(asOf).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Records (as of date)', value: '14,200' },
                  { label: 'Verified (L2+)',        value: '11,400' },
                  { label: 'Open Cases',            value: '41' },
                ].map(s => (
                  <div key={s.label} className="bg-surface rounded-card p-3">
                    <p className="text-lg font-bold text-brand tabular-nums">{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-3">
                These values reflect what was recorded in the system on or before {asOf}. Bitemporal query: recorded_at ≤ {asOf}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tamper test */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className={`card border-2 transition-colors ${showTamper ? 'border-danger' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">Tamper Detection Demo</h2>
          </div>
          <button
            className={`btn btn-sm ${showTamper ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setShowTamper(s => !s)}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {showTamper ? 'Restore Chain' : 'Simulate Row Edit'}
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {showTamper
            ? 'A direct database edit was simulated. The integrity checker detected a hash mismatch in Chain 1. The event is highlighted in red below.'
            : 'Click to simulate a direct database edit to a row. Watch the chain integrity indicator turn red instantly.'}
        </p>
        <AnimatePresence>
          {showTamper && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-control">
              <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-xs text-danger font-semibold">Chain 1 integrity FAILED — hash mismatch at seq 1036. Probable tampering detected.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input className="input pl-9 max-w-sm" placeholder="Search events, actors, entities…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Event log */}
      <div className="space-y-2">
        {filtered.map((evt, i) => {
          const Icon = actorIcon[evt.actorType] ?? Shield;
          return (
            <motion.div key={`${evt.chainId}-${evt.seq}`}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`card border transition-colors ${!evt.valid ? 'border-danger bg-red-50/30' : 'border-border'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-card flex items-center justify-center flex-shrink-0 ${actorColor[evt.actorType]}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold ${!evt.valid ? 'text-danger' : 'text-text-primary'}`}>{evt.action}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-secondary">{evt.actor}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-canvas border border-border rounded font-mono text-text-muted">{evt.entity}:{evt.entityId}</span>
                    {!evt.valid && <span className="badge badge-danger text-xs">TAMPERED</span>}
                  </div>
                  <p className="text-xs text-text-secondary">{evt.detail}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(evt.ts).toLocaleString('en-IN')}</span>
                    <span>Chain {evt.chainId} · seq {evt.seq}</span>
                    <span className={`flex items-center gap-1 ${evt.valid ? 'text-emerald-600' : 'text-danger'}`}>
                      <Hash className="w-3 h-3" />{evt.thisHash}
                    </span>
                  </div>
                </div>
                {evt.valid
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5 animate-pulse" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12 text-text-muted text-sm">
          No events match "{search}". Clear search to see all audit events.
        </div>
      )}
    </div>
  );
}

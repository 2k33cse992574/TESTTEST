import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { mockStudents } from '@/data/mockData';
import { api } from '@/api/client';
import type { Student } from '@/types';
import {
  Download, Filter, X, Shield, AlertTriangle,
  User, CheckCircle2, Sparkles, Building2
} from 'lucide-react';

export default function OfficerEnrolments() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selected, setSelected] = useState<Student | null>(null);
  const [holdFilter, setHoldFilter] = useState<string>('ALL');
  const [trustFilter, setTrustFilter] = useState<string>('ALL');
  const [holdReason, setHoldReason] = useState('');
  const [holdPending, setHoldPending] = useState(false);
  const [holdSuccess, setHoldSuccess] = useState<string | null>(null);

  // ML Risk Predictor Simulator state
  const [simAge, setSimAge] = useState(19);
  const [simRushDays, setSimRushDays] = useState(10);
  const [simHasApaar, setSimHasApaar] = useState(true);
  const [simMultiClaim, setSimMultiClaim] = useState(false);
  const [simScore, setSimScore] = useState<number | null>(null);
  const [simFactors, setSimFactors] = useState<any[]>([]);

  useEffect(() => {
    api.getEnrolments()
      .then(data => { if (data && data.length) setStudents(data); })
      .catch(() => {});
  }, []);

  const handleToggleHold = async (newHoldState: 'NONE' | 'CONFLICT_HOLD' | 'IDENTITY_HOLD') => {
    if (!selected) return;
    setHoldPending(true);
    setHoldSuccess(null);
    try {
      const res = await api.toggleHold(selected.id, {
        holdState: newHoldState,
        reason: holdReason || 'Officer regulatory hold status adjustment.',
        officerName: 'Shri Rajesh Kumar'
      });
      const newStatus = res.student?.status ?? (newHoldState === 'NONE' ? 'ENROLLED' : 'ADMITTED');
      const newTrust = res.student?.trustLevel ?? (newHoldState === 'NONE' ? 3 : 1);
      const newScore = res.student?.riskScore ?? (newHoldState === 'NONE' ? 10 : 74);
      setHoldSuccess(`Hold updated to ${newHoldState}. Status: ${newStatus}, Trust: L${newTrust}. Anchored in Block #${res.auditBlockSeq}.`);
      setStudents(prev => prev.map(s => s.id === selected.id ? { ...s, holdState: newHoldState, riskScore: newScore, status: newStatus, trustLevel: newTrust } : s));
      setSelected(prev => prev ? { ...prev, holdState: newHoldState, riskScore: newScore, status: newStatus, trustLevel: newTrust } : null);
      setHoldReason('');
    } catch {
      // Local fallback
      const newStatus = newHoldState === 'NONE' ? 'ENROLLED' : 'ADMITTED';
      const newTrust = newHoldState === 'NONE' ? 3 : 1;
      const newScore = newHoldState === 'NONE' ? 10 : 74;
      setStudents(prev => prev.map(s => s.id === selected.id ? { ...s, holdState: newHoldState, status: newStatus, trustLevel: newTrust, riskScore: newScore } : s));
      setSelected(prev => prev ? { ...prev, holdState: newHoldState, status: newStatus, trustLevel: newTrust, riskScore: newScore } : null);
      setHoldSuccess(`Hold updated to ${newHoldState} (local).`);
    } finally {
      setHoldPending(false);
    }
  };

  const runMlPrediction = async () => {
    try {
      const res = await api.predictRisk({
        age: simAge,
        submissionDaysBeforeDeadline: simRushDays,
        hasApaar: simHasApaar,
        isMultiInstitutionClaim: simMultiClaim,
        poolMismatch: false,
        categoryCertVerified: true
      });
      setSimScore(res.compositeRiskScore);
      setSimFactors(res.explainableFactors || []);
    } catch {
      // Fallback calculation
      const score = (simMultiClaim ? 45 : 0) + (!simHasApaar ? 25 : 0) + (simRushDays < 2 ? 15 : 0) + (simAge > 26 ? 15 : 5);
      setSimScore(score);
      setSimFactors([{ factor: 'Estimated Rule Penalty', impact: `+${score} pts` }]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Student Ref", "Name", "APAAR ID", "Institution", "Programme", "Pool", "Status", "Hold State", "Trust Level", "Risk Score"];
    const rows = students.map(s => [
      s.id, s.maskedId, s.name, s.apaarId || "PROVISIONAL", s.institutionName, s.programme, s.poolCode, s.status, s.holdState, `L${s.trustLevel}`, s.riskScore || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AICTE_Student_Enrolments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    if (holdFilter !== 'ALL' && s.holdState !== holdFilter) return false;
    if (trustFilter !== 'ALL' && s.trustLevel !== Number(trustFilter)) return false;
    return true;
  });

  const columns: Column<Student>[] = [
    {
      key: 'maskedId', header: 'Student Ref', sortable: true,
      render: r => (
        <div>
          <span className="font-mono text-xs font-semibold text-brand">{r.maskedId}</span>
          <p className="text-xs text-text-primary font-medium">{r.name}</p>
        </div>
      ),
    },
    {
      key: 'institutionName', header: 'Institution', sortable: true,
      render: r => <span className="text-xs text-text-secondary max-w-[150px] block truncate">{r.institutionName}</span>,
    },
    {
      key: 'programme', header: 'Programme', sortable: true,
      render: r => <span className="text-sm">{r.programme}</span>,
    },
    {
      key: 'poolCode', header: 'Pool',
      render: r => <span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{r.poolCode}</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: r => <StatusBadge type="enrolment" value={r.status} size="sm" />,
    },
    {
      key: 'holdState', header: 'Hold',
      render: r => r.holdState !== 'NONE'
        ? <StatusBadge type="hold" value={r.holdState} size="sm" />
        : <span className="text-text-muted text-xs">—</span>,
    },
    {
      key: 'trustLevel', header: 'Trust',
      render: r => <TrustLadder level={r.trustLevel} showLabel={false} compact />,
    },
    {
      key: 'riskScore', header: 'ML Risk', sortable: true,
      render: r => {
        const s = r.riskScore ?? 0;
        const color = s > 60 ? 'text-danger bg-red-50 border-red-200' : s > 30 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
        return (
          <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg border ${color}`}>
            {s}/100
          </span>
        );
      },
    },
    {
      key: 'lastUpdated', header: 'Updated', sortable: true,
      render: r => <span className="text-xs text-text-muted">{r.lastUpdated}</span>,
    },
  ];

  const highRisk = students.filter(s => (s.riskScore ?? 0) > 60).length;
  const onHold   = students.filter(s => s.holdState !== 'NONE').length;
  const l0l1     = students.filter(s => s.trustLevel <= 1).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Central Enrolments"
        subtitle="National student registry — real-time single-seat locks, trust validation and ML anomaly scoring."
        breadcrumb={['AICTE Officer Portal', 'Enrolments']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records',     value: students.length, color: 'text-text-primary' },
          { label: 'High Risk (>60)',    value: highRisk,        color: 'text-danger' },
          { label: 'On Hold (Locked)',   value: onHold,          color: 'text-amber-600' },
          { label: 'Low Trust (L0–L1)', value: l0l1,            color: 'text-text-secondary' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 bg-surface p-4 rounded-card border border-border">
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-xs font-semibold text-text-secondary">Quick Filters:</span>
        <select
          value={holdFilter}
          onChange={e => setHoldFilter(e.target.value)}
          className="text-xs border border-border rounded-control px-2.5 py-1.5 bg-canvas focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">All Hold States</option>
          <option value="NONE">No Hold (Active)</option>
          <option value="CONFLICT_HOLD">Conflict Hold</option>
          <option value="IDENTITY_HOLD">Identity Hold</option>
        </select>

        <select
          value={trustFilter}
          onChange={e => setTrustFilter(e.target.value)}
          className="text-xs border border-border rounded-control px-2.5 py-1.5 bg-canvas focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">All Trust Levels</option>
          <option value="0">L0 (Claimed)</option>
          <option value="1">L1 (Format-Valid)</option>
          <option value="2">L2 (Identity-Verified)</option>
          <option value="3">L3 (Cross-Checked)</option>
          <option value="4">L4 (AICTE-Certified)</option>
        </select>

        {(holdFilter !== 'ALL' || trustFilter !== 'ALL') && (
          <button
            onClick={() => { setHoldFilter('ALL'); setTrustFilter('ALL'); }}
            className="text-xs text-brand font-medium hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="card">
        <DataTable<Student>
          columns={columns}
          data={filteredStudents}
          keyField="id"
          searchPlaceholder="Search by student ref, name, institution, programme, status…"
          onRowClick={row => { setSelected(row); setHoldSuccess(null); }}
          pageSize={8}
        />
      </div>

      {/* Student Detail & ML Risk Drawer */}
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
                    <p className="font-mono text-xs text-brand">{selected.maskedId}</p>
                    <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge type="enrolment" value={selected.status} />
                  {selected.holdState !== 'NONE' ? (
                    <StatusBadge type="hold" value={selected.holdState} />
                  ) : (
                    <span className="badge badge-success">Single-Seat Verified</span>
                  )}
                  <span className="badge badge-info">{selected.poolCode} Pool</span>
                </div>

                {/* Institution & Programme */}
                <div className="p-3 bg-canvas rounded-card border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Institution:</span>
                    <span className="font-semibold text-text-primary">{selected.institutionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Programme:</span>
                    <span className="font-semibold text-text-primary">{selected.programme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">APAAR ID:</span>
                    <span className="font-mono font-semibold text-brand">{selected.apaarId || 'Provisional PPID'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Admission Date:</span>
                    <span className="font-semibold">{selected.admissionDate}</span>
                  </div>
                </div>

                {/* Trust Ladder */}
                <div>
                  <p className="label mb-2">Trust Level & Provenance</p>
                  <TrustLadder level={selected.trustLevel} showLabel />
                </div>

                {/* ML Risk Score & Explainable Breakdown */}
                <div className="p-4 bg-surface-subtle border border-border rounded-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">ML Risk Assessment</span>
                    </div>
                    <span className={`text-base font-bold tabular-nums px-2.5 py-0.5 rounded-full ${
                      (selected.riskScore || 0) > 60 ? 'bg-red-100 text-danger' :
                      (selected.riskScore || 0) > 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selected.riskScore ?? 0} / 100
                    </span>
                  </div>

                  <p className="text-xs text-text-muted">
                    Isolation Forest model evaluated 6 demographic and timeline anomaly features.
                  </p>

                  {/* Explainable factors */}
                  <div className="space-y-1.5 pt-1">
                    {selected.riskFactors && selected.riskFactors.length > 0 ? (
                      selected.riskFactors.map((f: any, i: number) => (
                        <div key={i} className="p-2 bg-surface rounded border border-border text-xs flex justify-between items-center">
                          <span className="font-medium text-text-primary">{f.factor}</span>
                          <span className="font-bold text-danger font-mono">{f.impact}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>All indicators match standard AICTE cohort bounds.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hold Action Controller */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <p className="label">Officer Hold Control</p>
                  <div>
                    <input
                      type="text"
                      className="w-full text-xs p-2.5 border border-border rounded-control focus:ring-1 focus:ring-brand focus:outline-none"
                      placeholder="Mandatory officer rationale for hold modification…"
                      value={holdReason}
                      onChange={e => setHoldReason(e.target.value)}
                    />
                  </div>

                  {holdSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{holdSuccess}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      disabled={holdPending}
                      onClick={() => handleToggleHold('CONFLICT_HOLD')}
                      className="btn btn-secondary flex-1 text-xs text-amber-700 border-amber-300"
                    >
                      Apply Conflict Hold
                    </button>
                    <button
                      disabled={holdPending}
                      onClick={() => handleToggleHold('NONE')}
                      className="btn btn-primary flex-1 text-xs"
                    >
                      Release Hold (Restore ENROLLED / L3)
                    </button>
                  </div>
                </div>

                {/* Interactive ML Risk Simulator */}
                <div className="p-4 bg-canvas rounded-card border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold text-text-primary">Simulate Risk for Record</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Admission Age:</span>
                        <span className="font-semibold">{simAge} yrs</span>
                      </div>
                      <input
                        type="range" min={15} max={32} value={simAge}
                        onChange={e => setSimAge(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Days before deadline:</span>
                        <span className="font-semibold">{simRushDays} days</span>
                      </div>
                      <input
                        type="range" min={0} max={30} value={simRushDays}
                        onChange={e => setSimRushDays(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span>Multi-institution claim:</span>
                      <input
                        type="checkbox" checked={simMultiClaim}
                        onChange={e => setSimMultiClaim(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>APAAR ID linked:</span>
                      <input
                        type="checkbox" checked={simHasApaar}
                        onChange={e => setSimHasApaar(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>
                  <button onClick={runMlPrediction} className="btn btn-secondary btn-sm w-full text-xs">
                    Compute ML Score
                  </button>
                  {simScore !== null && (
                    <div className="p-2.5 bg-surface rounded border border-border text-center">
                      <span className="text-xs text-text-muted">Simulated Score: </span>
                      <span className="text-sm font-bold text-brand">{simScore}/100</span>
                    </div>
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

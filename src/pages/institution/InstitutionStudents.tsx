import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { mockStudents } from '@/data/mockData';
import { api } from '@/api/client';
import { Download, UserPlus, X, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import type { Student } from '@/types';

const columns: Column<Student>[] = [
  {
    key: 'maskedId',
    header: 'Student Ref',
    sortable: true,
    render: r => <span className="font-mono text-xs text-brand">{r.maskedId}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: r => <span className="font-medium text-sm">{r.name}</span>,
  },
  {
    key: 'programme',
    header: 'Programme',
    sortable: true,
    render: r => <span className="text-sm text-text-secondary">{r.programme}</span>,
  },
  {
    key: 'poolCode',
    header: 'Pool',
    render: r => (
      <span className="text-xs font-medium px-2 py-0.5 bg-canvas border border-border rounded-lg">
        {r.poolCode}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: r => <StatusBadge type="enrolment" value={r.status} size="sm" />,
  },
  {
    key: 'holdState',
    header: 'Hold',
    render: r => r.holdState !== 'NONE'
      ? <StatusBadge type="hold" value={r.holdState} size="sm" />
      : <span className="text-text-muted text-xs">—</span>,
  },
  {
    key: 'trustLevel',
    header: 'Trust',
    render: r => <TrustLadder level={r.trustLevel} showLabel={false} compact />,
  },
  {
    key: 'riskScore',
    header: 'Risk',
    sortable: true,
    render: r => {
      const s = r.riskScore ?? 0;
      const color = s > 60 ? 'text-danger' : s > 30 ? 'text-amber-600' : 'text-emerald-600';
      return <span className={`text-xs font-bold tabular-nums ${color}`}>{s}</span>;
    },
  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    sortable: true,
    render: r => <span className="text-xs text-text-muted">{r.lastUpdated}</span>,
  },
];

export default function InstitutionStudents() {
  const [students, setStudents] = useState<Student[]>(() =>
    mockStudents.filter(s => s.institutionId === 'INST-MH-0042')
  );
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form fields
  const [name, setName] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [programme, setProgramme] = useState('B.Tech CSE');
  const [poolCode, setPoolCode] = useState('REGULAR');
  const [admissionDate, setAdmissionDate] = useState('2026-08-01');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);

  const fetchStudents = () => {
    setLoading(true);
    api.getInstitutionStudents('INST-MH-0042')
      .then(res => {
        if (res && res.length) setStudents(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
    window.addEventListener('focus', fetchStudents);
    return () => window.removeEventListener('focus', fetchStudents);
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setConflictResult(null);

    try {
      const res = await api.addInstitutionStudent('INST-MH-0042', {
        name,
        apaarId: apaarId.trim() || undefined,
        programme,
        poolCode,
        admissionDate,
        category,
      });

      if (res && res.student) {
        setStudents(prev => [res.student, ...prev]);
        if (res.hasConflict) {
          setConflictResult(res);
        } else {
          setShowAddModal(false);
          setName('');
          setApaarId('');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['StudentRef', 'Name', 'APAAR_ID', 'Programme', 'SeatPool', 'Status', 'HoldState', 'TrustLevel', 'RiskScore', 'AdmissionDate'];
    const rows = students.map(s => [
      s.maskedId,
      `"${s.name}"`,
      s.apaarId || '',
      `"${s.programme}"`,
      s.poolCode,
      s.status,
      s.holdState,
      `L${s.trustLevel}`,
      s.riskScore ?? 0,
      s.admissionDate,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIET_Mumbai_Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Student Records"
        subtitle="SIET Mumbai (INST-MH-0042) · Real-time single-seat lock, trust tiers, and risk telemetry."
        breadcrumb={['Institution Portal', 'Students']}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={fetchStudents}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowAddModal(true); setConflictResult(null); }}>
              <UserPlus className="w-3.5 h-3.5" /> Enrol New Student
            </button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Enrolled', value: students.length, color: 'text-text-primary' },
          { label: 'Enrolled / Active', value: students.filter(s => ['ENROLLED', 'CONTINUING'].includes(s.status)).length, color: 'text-emerald-600' },
          { label: 'On Regulatory Hold', value: students.filter(s => s.holdState !== 'NONE').length, color: 'text-amber-600' },
          { label: 'High Risk (ML Anomaly)', value: students.filter(s => (s.riskScore ?? 0) > 40).length, color: 'text-danger' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <DataTable<Student>
          columns={columns}
          data={students}
          keyField="id"
          searchPlaceholder="Search by name, reference, programme, status…"
          emptyMessage="No student records found for this institution."
          pageSize={8}
        />
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg bg-surface rounded-panel shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Enrol New Student</p>
                      <p className="text-xs text-text-muted">Instant ML Identity Check & Seat Ledger Verification</p>
                    </div>
                  </div>
                  <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                  {conflictResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-card space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-danger font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>SINGLE-SEAT LOCK CONFLICT DETECTED</span>
                      </div>
                      <p className="text-red-900 font-medium">
                        {conflictResult.conflict?.reason}
                      </p>
                      <div className="p-2.5 bg-white/80 rounded border border-red-100 space-y-1">
                        <p><span className="font-semibold">Hold State:</span> <span className="font-mono text-danger">CONFLICT_HOLD</span></p>
                        <p><span className="font-semibold">Risk Score:</span> {conflictResult.student?.riskScore} / 100 (Isolation Forest)</p>
                        {conflictResult.caseCreated && (
                          <p><span className="font-semibold">Officer Case:</span> Pushed to Integrity Queue (<span className="font-mono text-brand">{conflictResult.caseCreated.id}</span>)</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm w-full mt-2"
                        onClick={() => { setShowAddModal(false); setName(''); setApaarId(''); }}
                      >
                        Acknowledge & Close Drawer
                      </button>
                    </motion.div>
                  )}

                  {!conflictResult && (
                    <>
                      <div>
                        <label className="label">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          placeholder="e.g. Rahul Verma or Sneha Rao"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                        <p className="text-[11px] text-text-muted mt-1">
                          Tip: Try entering &quot;Rahul Verma&quot; to test cross-institution duplicate detection.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">APAAR ID (Optional)</label>
                          <input
                            type="text"
                            className="input font-mono"
                            placeholder="e.g. 3456-7890-1234"
                            value={apaarId}
                            onChange={e => setApaarId(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">Programme *</label>
                          <select className="input" value={programme} onChange={e => setProgramme(e.target.value)}>
                            <option value="B.Tech CSE">B.Tech Computer Science</option>
                            <option value="B.Tech ECE">B.Tech Electronics & Comm</option>
                            <option value="B.Tech Mech">B.Tech Mechanical Eng</option>
                            <option value="M.Tech AI">M.Tech Artificial Intelligence</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Seat Pool *</label>
                          <select className="input" value={poolCode} onChange={e => setPoolCode(e.target.value)}>
                            <option value="REGULAR">REGULAR</option>
                            <option value="NRI">NRI Quota</option>
                            <option value="OCI">OCI</option>
                            <option value="SUPERNUMERARY">Supernumerary / PMSSS</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Category</label>
                          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="EWS">EWS</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-card text-xs text-blue-800">
                        <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <p>
                          Submitting runs real-time cross-institutional duplicate matching (Jaro-Winkler & Levenshtein) and logs an immutable SHA-256 block.
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                          {submitting ? 'Running ML Engine…' : 'Enrol Student'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

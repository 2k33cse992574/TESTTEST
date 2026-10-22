import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { BarChartComponent } from '@/components/charts/BarChart';
import {
  Scale, FlaskConical, CheckCircle2, ChevronRight,
  Play, RotateCcw, GitBranch, Clock, Info, Zap, X,
} from 'lucide-react';

type RunwayStage = 'OBSERVE' | 'WARN' | 'SOFT' | 'HARD';

interface PolicyRule {
  id: string; name: string; description: string; category: string;
  currentStage: RunwayStage; flaggedCount: number; affectedInstitutions: number;
  lastBacktest: string; status: 'ACTIVE' | 'DRAFT' | 'RETIRED';
}

const RULES: PolicyRule[] = [
  { id: 'R1',  name: 'INTAKE_BREACH',        description: 'Pool claimed count exceeds approved intake cap.',                        category: 'Seat Integrity',   currentStage: 'SOFT',    flaggedCount: 3,  affectedInstitutions: 2, lastBacktest: '15 Oct 2026', status: 'ACTIVE' },
  { id: 'R2',  name: 'CATEGORY_SHARE',        description: 'Category distribution deviates from policy band or historical norm.',    category: 'Data Quality',     currentStage: 'WARN',    flaggedCount: 5,  affectedInstitutions: 3, lastBacktest: '15 Oct 2026', status: 'ACTIVE' },
  { id: 'R3',  name: 'SHARED_ATTRIBUTE',      description: 'Multiple students share identical DOB, contact, guardian, or photo.',    category: 'Identity',         currentStage: 'OBSERVE', flaggedCount: 8,  affectedInstitutions: 4, lastBacktest: '10 Oct 2026', status: 'ACTIVE' },
  { id: 'R4',  name: 'DEADLINE_BULK_UPLOAD',  description: '>60% records uploaded in last 48 hours before deadline.',               category: 'Submission',       currentStage: 'WARN',    flaggedCount: 2,  affectedInstitutions: 2, lastBacktest: '15 Oct 2026', status: 'ACTIVE' },
  { id: 'R6',  name: 'NAME_DOB_MISMATCH',     description: 'Submitted name/DOB differs from APAAR registry beyond threshold.',      category: 'Identity',         currentStage: 'SOFT',    flaggedCount: 4,  affectedInstitutions: 3, lastBacktest: '12 Oct 2026', status: 'ACTIVE' },
  { id: 'R8',  name: 'STALE_ACTIVE',          description: 'Enrolment CONTINUING with no update for >12 months.',                   category: 'Lifecycle',        currentStage: 'WARN',    flaggedCount: 11, affectedInstitutions: 5, lastBacktest: '08 Oct 2026', status: 'ACTIVE' },
  { id: 'R11', name: 'DECLARATION_MISMATCH',  description: 'Declared totals differ from student-row derived count by >5%.',         category: 'Reconciliation',   currentStage: 'SOFT',    flaggedCount: 2,  affectedInstitutions: 1, lastBacktest: '15 Oct 2026', status: 'ACTIVE' },
  { id: 'R10', name: 'CATEGORY_SHIFT_SPIKE',  description: 'FN/NRI/OCI ratio spike >3 std-devs from cohort norm.',                  category: 'Statistical',      currentStage: 'OBSERVE', flaggedCount: 1,  affectedInstitutions: 1, lastBacktest: '10 Oct 2026', status: 'ACTIVE' },
  { id: 'R14', name: 'ATTRITION_ANOMALY',     description: 'Programme attrition rate implausibly low or high vs peer cohort.',      category: 'Statistical',      currentStage: 'OBSERVE', flaggedCount: 3,  affectedInstitutions: 2, lastBacktest: '05 Oct 2026', status: 'DRAFT'  },
];

const stageConfig: Record<RunwayStage, { color: string; bg: string; border: string; label: string }> = {
  OBSERVE: { color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',  label: 'Log only'           },
  WARN:    { color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200', label: 'Notify institution' },
  SOFT:    { color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200',label: 'Open case, no block'},
  HARD:    { color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',   label: 'Block pending officer'},
};

const backtestData = RULES.filter(r => r.status === 'ACTIVE').map(r => ({
  name: r.id, value: r.flaggedCount,
  color: r.flaggedCount > 8 ? '#C53B45' : r.flaggedCount > 4 ? '#B7791F' : '#6558D3',
}));

export default function OfficerPolicyStudio() {
  const [selected, setSelected]     = useState<PolicyRule | null>(null);
  const [running,  setRunning]      = useState(false);
  const [backtested, setBacktested] = useState(false);
  const [nriCap, setNriCap]         = useState(15);
  const [fnCap,  setFnCap]          = useState(5);
  const [rules,  setRules]          = useState(RULES);

  const projected = Math.round((nriCap / 15) * 3 + (fnCap / 5) * 2);

  const runBacktest = () => {
    setRunning(true); setBacktested(false);
    setTimeout(() => { setRunning(false); setBacktested(true); }, 2000);
  };

  const advanceStage = (rule: PolicyRule) => {
    const order: RunwayStage[] = ['OBSERVE','WARN','SOFT','HARD'];
    const idx = order.indexOf(rule.currentStage);
    if (idx < 3) {
      const next = order[idx + 1];
      setRules(rs => rs.map(r => r.id === rule.id ? { ...r, currentStage: next } : r));
      setSelected(prev => prev ? { ...prev, currentStage: next } : null);
    }
  };

  const revertStage = (rule: PolicyRule) => {
    const order: RunwayStage[] = ['OBSERVE','WARN','SOFT','HARD'];
    const idx = order.indexOf(rule.currentStage);
    if (idx > 0) {
      const prev = order[idx - 1];
      setRules(rs => rs.map(r => r.id === rule.id ? { ...r, currentStage: prev } : r));
      setSelected(s => s ? { ...s, currentStage: prev } : null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Policy Studio"
        subtitle="Manage versioned rules, run back-tests, and control the compliance runway before enforcement."
        breadcrumb={['AICTE Officer Portal', 'Policy Studio']}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted px-3 py-1.5 bg-canvas border border-border rounded-control">
              Active: <span className="font-semibold text-brand">Policy v7</span>
            </span>
            <button className="btn btn-primary btn-sm">
              <GitBranch className="w-3.5 h-3.5" /> New Version
            </button>
          </div>
        }
      />

      {/* Runway explainer */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card bg-brand-soft/30 border-brand/20">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Compliance Runway: OBSERVE → WARN → SOFT → HARD</p>
            <p className="text-xs text-text-secondary mt-0.5">Rules advance through staged enforcement. Back-test first, review the diff, get approval, then advance. No surprise enforcement for institutions.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['OBSERVE','WARN','SOFT','HARD'] as RunwayStage[]).map((stage) => (
            <div key={stage} className={`p-3 rounded-card border ${stageConfig[stage].bg} ${stageConfig[stage].border}`}>
              <p className={`text-xs font-bold ${stageConfig[stage].color}`}>{stage}</p>
              <p className="text-xs text-text-muted mt-0.5">{stageConfig[stage].label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Policy simulator */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-text-primary">Live Policy Simulator</h2>
          <span className="badge badge-info text-xs">Interactive Demo</span>
        </div>
        <p className="text-xs text-text-muted mb-5">Adjust seat caps and see projected impact before committing. All values are illustrative — confirm against AICTE Handbook.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {[
              { label: 'NRI Seat Cap (%)', val: nriCap, set: setNriCap, min: 5, max: 30 },
              { label: 'OCI / FN Supernumerary Cap (%)', val: fnCap, set: setFnCap, min: 1, max: 15 },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-text-primary">{s.label}</span>
                  <span className="font-bold text-brand tabular-nums">{s.val}%</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={s.val}
                  onChange={e => s.set(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-2 rounded-full" />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>{s.min}% (restrictive)</span><span>{s.max}% (permissive)</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-full p-5 bg-canvas rounded-card border border-border text-center">
              <p className="text-xs text-text-muted mb-1">Projected institutions newly flagged</p>
              <motion.p key={projected} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`text-5xl font-bold tabular-nums ${projected > 3 ? 'text-danger' : projected > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {projected}
              </motion.p>
              <p className="text-xs text-text-muted mt-1">out of 8 onboarded institutions</p>
            </div>
            <button className="btn btn-secondary btn-sm w-full">Generate Impact Report</button>
          </div>
        </div>
      </motion.div>

      {/* Back-test */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Rules — Policy v7 ({rules.filter(r => r.status === 'ACTIVE').length} active)</h2>
          <button className="btn btn-secondary btn-sm" onClick={runBacktest} disabled={running}>
            {running
              ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full" />
              : <Play className="w-3.5 h-3.5" />}
            {running ? 'Running…' : 'Back-test on v6 Data'}
          </button>
        </div>

        <AnimatePresence>
          {backtested && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-800 flex-1">
                <span className="font-semibold">Back-test complete.</span> Policy v7 vs v6: 8 new findings, 0 reversals. 39 total flagged vs 31 in v6.
              </p>
              <button className="btn btn-secondary btn-sm flex-shrink-0">View Diff</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {rules.map((rule, i) => {
            const sc = stageConfig[rule.currentStage];
            return (
              <motion.div key={rule.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 + i * 0.04 }}
                className={`flex items-center gap-4 p-3 rounded-card border border-border hover:bg-canvas cursor-pointer transition-colors ${rule.status === 'DRAFT' ? 'opacity-55' : ''}`}
                onClick={() => setSelected(rule)}
              >
                <div className="w-8 h-8 bg-brand-soft rounded-card flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand">{rule.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-xs font-semibold text-text-primary font-mono">{rule.name}</p>
                    <span className="text-xs px-1.5 py-0.5 bg-canvas border border-border rounded text-text-muted">{rule.category}</span>
                    {rule.status === 'DRAFT' && <span className="badge badge-neutral text-xs">Draft</span>}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{rule.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-text-muted">Flags</p>
                    <p className="text-sm font-bold tabular-nums text-danger">{rule.flaggedCount}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color} whitespace-nowrap`}>{rule.currentStage}</span>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <BarChartComponent title="Active Findings per Rule" subtitle="Current cycle across all institutions" data={backtestData} height={200} />

      {/* Rule drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setSelected(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface border-l border-border z-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-text-muted">{selected.id} · {selected.category}</p>
                  <p className="text-sm font-semibold font-mono text-text-primary mt-0.5">{selected.name}</p>
                </div>
                <button className="btn-icon" onClick={() => setSelected(null)}><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className={`px-3 py-2 rounded-card text-xs font-semibold border ${stageConfig[selected.currentStage].bg} ${stageConfig[selected.currentStage].color} ${stageConfig[selected.currentStage].border}`}>
                  Current stage: {selected.currentStage} — {stageConfig[selected.currentStage].label}
                </div>
                <div>
                  <p className="label mb-1">Rule description</p>
                  <p className="text-sm text-text-secondary">{selected.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Active Flags', value: selected.flaggedCount, color: 'text-danger' },
                    { label: 'Affected Inst.', value: selected.affectedInstitutions, color: 'text-amber-600' },
                    { label: 'Back-test', value: selected.lastBacktest, color: 'text-brand' },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-canvas rounded-card">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Runway visual */}
                <div>
                  <p className="label mb-2">Compliance runway</p>
                  <div className="flex items-center gap-2">
                    {(['OBSERVE','WARN','SOFT','HARD'] as RunwayStage[]).map(stage => (
                      <div key={stage}
                        className={`flex-1 h-9 rounded-control flex items-center justify-center text-xs font-semibold
                          ${stage === selected.currentStage
                            ? `${stageConfig[stage].bg} ${stageConfig[stage].color} border-2 ${stageConfig[stage].border}`
                            : 'bg-canvas border border-border text-text-muted'}`}>
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <button className="btn btn-primary w-full" onClick={() => advanceStage(selected)}>
                    <Zap className="w-3.5 h-3.5" /> Advance to Next Stage
                  </button>
                  <button className="btn btn-secondary w-full" onClick={() => revertStage(selected)}>
                    <RotateCcw className="w-3.5 h-3.5" /> Revert Stage
                  </button>
                  <button className="btn btn-secondary w-full" onClick={runBacktest}>
                    <Play className="w-3.5 h-3.5" /> Run Back-test
                  </button>
                </div>
                {backtested && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Back-test complete · <Clock className="w-3 h-3" /> {new Date().toLocaleTimeString()}
                  </motion.div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

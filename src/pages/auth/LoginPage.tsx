import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import {
  Shield, GraduationCap, Building2, Landmark,
  ArrowRight, CheckCircle2, Lock, Eye, EyeOff,
} from 'lucide-react';

const ROLES: {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  creds: { label: string; value: string }[];
}[] = [
  {
    role: 'student',
    icon: GraduationCap,
    title: 'Student',
    subtitle: 'View your enrolment, trust level, documents and verifiable credential',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    creds: [
      { label: 'APAAR ID', value: '1234-5678-9012' },
      { label: 'Name', value: 'Arjun Sharma' },
    ],
  },
  {
    role: 'institution',
    icon: Building2,
    title: 'Institution',
    subtitle: 'Manage student records, submit batches, review integrity checks and cases',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    creds: [
      { label: 'Institution', value: 'SIET Mumbai (INST-MH-0042)' },
      { label: 'Admin', value: 'Dr. Priya Nair' },
    ],
  },
  {
    role: 'officer',
    icon: Landmark,
    title: 'AICTE Officer',
    subtitle: 'Monitor institutions, review the integrity queue, record decisions, manage seat ledger',
    color: 'text-brand',
    bg: 'bg-brand-soft',
    border: 'border-brand/20',
    creds: [
      { label: 'Officer', value: 'Shri Rajesh Kumar' },
      { label: 'Access', value: 'National · All regions' },
    ],
  },
];

const FEATURES = [
  'Seat Ledger — double-entry intake accounting',
  'Single-Seat Lock — database-enforced duplicate prevention',
  'Trust Ladder — L0 to L4 proof levels',
  'Explainable Integrity Engine — reason codes, not black boxes',
  'Verifiable Credentials — consent-based, minimal disclosure',
  'Tamper-evident audit — hash-chained, Merkle-anchored',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      login(selected);
      navigate(
        selected === 'student'     ? '/student' :
        selected === 'institution' ? '/institution' : '/officer'
      );
    }, 900);
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 bg-[#172033] text-white p-10 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">APAAR</span>
              <span className="text-lg font-bold text-brand ml-1">Pramaan</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
              National Student Integrity Platform
            </p>
            <h1 className="text-3xl font-bold leading-tight mb-4">
              From counting students<br />
              to <span className="text-brand">knowing them.</span>
            </h1>
            <p className="text-sm text-white/60 leading-relaxed mb-10">
              Every seat controlled. Every student verified. Every record provable.
              Humans stay in charge.
            </p>
          </motion.div>

          {/* Features list */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
                <span className="text-sm text-white/75">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="relative z-10 mt-auto pt-8">
          <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-card">
            <p className="text-xs text-amber-300 font-medium">
              Demo environment — simulated APAAR integration. Synthetic data only. Not a live government system.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-text-primary">APAAR<span className="text-brand">Pramaan</span></span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-text-primary mb-1">Sign in</h2>
            <p className="text-sm text-text-secondary mb-8">
              Select a role to explore the demo portal.
            </p>

            {/* Role selector */}
            <div className="space-y-3 mb-6">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                const active = selected === r.role;
                return (
                  <motion.button
                    key={r.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setSelected(r.role)}
                    className={`w-full text-left p-4 rounded-card border-2 transition-all duration-standard
                      ${active
                        ? `${r.border} ${r.bg} shadow-card`
                        : 'border-border bg-surface hover:border-brand/30 hover:bg-brand-soft/10'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-card flex items-center justify-center flex-shrink-0
                        ${active ? r.bg : 'bg-canvas'}`}>
                        <Icon className={`w-5 h-5 ${active ? r.color : 'text-text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${active ? r.color : 'text-text-primary'}`}>{r.title}</p>
                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{r.subtitle}</p>

                        {/* Demo credentials shown when selected */}
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-x-4 gap-y-1.5"
                            >
                              {r.creds.map(c => (
                                <div key={c.label}>
                                  <p className="text-xs text-text-muted uppercase tracking-wide">{c.label}</p>
                                  <p className="text-xs font-semibold text-text-primary">{c.value}</p>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Demo password field */}
            <div className="mb-6">
              <label className="label">Password (demo)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-9 pr-9"
                  defaultValue="demo1234"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <motion.button
              className={`btn btn-primary w-full justify-center text-base py-3 relative overflow-hidden
                ${!selected ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selected || loading}
              onClick={handleLogin}
              whileTap={selected && !loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign in to {selected
                    ? ROLES.find(r => r.role === selected)?.title + ' Portal'
                    : 'Portal'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs text-text-muted mt-6">
              This is a demonstration environment. All data is synthetic and marked accordingly.
              Not an official AICTE system.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

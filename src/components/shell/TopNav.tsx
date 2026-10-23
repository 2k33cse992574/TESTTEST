import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Shield, Building2, GraduationCap, Landmark, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem { label: string; path: string }

interface Props {
  navItems: NavItem[];
}

const mockNotifications = [
  { id: '1', title: '3 records need review', detail: 'Potential duplicates detected in batch #2847', time: '2m ago', read: false },
  { id: '2', title: 'Upload completed', detail: 'Batch of 240 records processed successfully', time: '18m ago', read: false },
  { id: '3', title: 'Case SLA due', detail: 'DUP_ENROLMENT case #C-0042 is due in 2 hours', time: '1h ago', read: true },
];

export function TopNav({ navItems }: Props) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [search, setSearch] = useState('');

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Brand & Portal Switcher */}
      <div className="flex items-center gap-2.5 mr-6 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-sm font-bold text-text-primary">APAAR</span>
          <span className="text-sm font-bold text-brand ml-0.5">Pramaan</span>
        </div>

        {/* Quick Portal Switcher Button */}
        <div className="relative ml-2">
          <button
            onClick={() => { setShowPortalMenu(s => !s); setShowUser(false); setShowNotif(false); }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-sm ${
              user?.role === 'officer'
                ? 'bg-brand-soft text-brand border-brand/30 hover:bg-brand-soft/80'
                : user?.role === 'student'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
            }`}
            title="Click to switch portal"
          >
            {user?.role === 'officer' && <Landmark className="w-3.5 h-3.5" />}
            {user?.role === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
            {user?.role === 'institution' && <Building2 className="w-3.5 h-3.5" />}
            <span>
              {user?.role === 'officer' ? 'AICTE Officer Portal' : user?.role === 'student' ? 'Student Portal' : 'Institution Portal'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Portal Switcher Dropdown */}
          <AnimatePresence>
            {showPortalMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 w-64 bg-surface border border-border rounded-card shadow-dropdown z-50 p-1.5"
              >
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">Switch Platform Portal</p>
                
                <button
                  onClick={() => { login('student'); navigate('/student'); setShowPortalMenu(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-control transition-colors text-left ${
                    user?.role === 'student' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-text-primary hover:bg-canvas'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Student Portal</p>
                    <p className="text-[10px] text-text-muted">VC, QR, Documents & Enrolment</p>
                  </div>
                </button>

                <button
                  onClick={() => { login('institution'); navigate('/institution'); setShowPortalMenu(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-control transition-colors text-left ${
                    user?.role === 'institution' ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-text-primary hover:bg-canvas'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Institution Portal</p>
                    <p className="text-[10px] text-text-muted">SIET Mumbai · Batches & Integrity</p>
                  </div>
                </button>

                <button
                  onClick={() => { login('officer'); navigate('/officer'); setShowPortalMenu(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-control transition-colors text-left ${
                    user?.role === 'officer' ? 'bg-brand-soft text-brand font-semibold' : 'text-text-primary hover:bg-canvas'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">AICTE Officer Portal</p>
                    <p className="text-[10px] text-text-muted">National Governance & Ledger</p>
                  </div>
                </button>

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { navigate('/verify?token=DEMO'); setShowPortalMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-canvas rounded-control transition-colors text-left"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    <span>Public QR Verification Page</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center nav */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {navItems.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-4 py-2 text-sm font-medium rounded-control transition-colors duration-fast
                ${active
                  ? 'text-brand'
                  : 'text-text-secondary hover:text-text-primary hover:bg-canvas'}`}
            >
              {item.label}
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-brand-soft rounded-control -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            className="w-48 pl-8 pr-3 py-1.5 text-xs rounded-control border border-border bg-canvas
                       focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-text-muted"
            placeholder="Search records…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="btn-icon relative"
            onClick={() => { setShowNotif(s => !s); setShowUser(false); }}
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-surface" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-card shadow-dropdown z-50"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  <span className="badge badge-info">{unreadCount} new</span>
                </div>
                <div className="divide-y divide-border">
                  {mockNotifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-canvas cursor-pointer transition-colors
                      ${!n.read ? 'bg-brand-soft/30' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />}
                        <div className={!n.read ? '' : 'ml-3.5'}>
                          <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{n.detail}</p>
                          <p className="text-xs text-text-muted mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-brand font-medium hover:underline">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar / user menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(s => !s); setShowNotif(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-control hover:bg-canvas transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">
              {user?.avatarInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-none">{user?.name}</p>
              <p className="text-xs text-text-muted mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          <AnimatePresence>
            {showUser && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-card shadow-dropdown z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                  {user?.institutionName && (
                    <p className="text-xs text-brand mt-0.5 font-medium">{user.institutionName}</p>
                  )}
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-canvas hover:text-text-primary transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-canvas hover:text-text-primary transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                </div>
                <div className="py-1 border-t border-border">
                  <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Switch Role / Portal</p>
                  {user?.role !== 'officer' && (
                    <button
                      onClick={() => { login('officer'); navigate('/officer'); setShowUser(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-canvas transition-colors text-left"
                    >
                      <Shield className="w-3.5 h-3.5 text-brand" /> AICTE Officer Portal
                    </button>
                  )}
                  {user?.role !== 'student' && (
                    <button
                      onClick={() => { login('student'); navigate('/student'); setShowUser(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-canvas transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Student Portal
                    </button>
                  )}
                  {user?.role !== 'institution' && (
                    <button
                      onClick={() => { login('institution'); navigate('/institution'); setShowUser(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-canvas transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-600" /> Institution Portal
                    </button>
                  )}
                  <button
                    onClick={() => { navigate('/verify?token=DEMO'); setShowUser(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-text-muted hover:bg-canvas transition-colors text-left"
                  >
                    Public QR Verification Page
                  </button>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop */}
      {(showUser || showNotif || showPortalMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowUser(false); setShowNotif(false); setShowPortalMenu(false); }}
        />
      )}
    </header>
  );
}

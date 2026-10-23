import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [search, setSearch] = useState('');

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-6 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-text-primary">APAAR</span>
          <span className="text-sm font-bold text-brand ml-0.5">Pramaan</span>
        </div>
        <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-soft text-brand border border-brand/20 hidden sm:inline-flex items-center gap-1">
          AICTE Officer Portal
        </span>
      </div>

      <div className="flex-1" />

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
      {(showUser || showNotif) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowUser(false); setShowNotif(false); }}
        />
      )}
    </header>
  );
}

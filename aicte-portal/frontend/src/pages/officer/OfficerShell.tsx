import { AppShell } from '@/components/shell/AppShell';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, ShieldAlert,
  BookOpen, BarChart3, Scale, History, QrCode, GitMerge,
} from 'lucide-react';

const RAIL = [
  { icon: LayoutDashboard, label: 'Overview',        path: '/officer' },
  { icon: Building2,       label: 'Institutions',    path: '/officer/institutions' },
  { icon: Users,           label: 'Enrolments',      path: '/officer/enrolments' },
  { icon: ShieldAlert,     label: 'Integrity Queue', path: '/officer/queue',   badge: 7 },
  { icon: BookOpen,        label: 'Seat Ledger',     path: '/officer/seats' },
  { icon: Scale,           label: 'Policy Studio',   path: '/officer/policy' },
  { icon: GitMerge,        label: 'Identity Graph',  path: '/officer/identity' },
  { icon: QrCode,          label: 'Verifier Portal', path: '/officer/verifier' },
  { icon: History,         label: 'Audit Trail',     path: '/officer/audit' },
  { icon: BarChart3,       label: 'Reports',         path: '/officer/reports' },
];

export default function OfficerShell() {
  return (
    <AppShell navItems={[]} railItems={RAIL}>
      <Outlet />
    </AppShell>
  );
}

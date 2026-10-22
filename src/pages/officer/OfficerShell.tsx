import { AppShell } from '@/components/shell/AppShell';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, ShieldAlert,
  BookOpen, BarChart3,
} from 'lucide-react';

const NAV = [
  { label: 'Overview',       path: '/officer' },
  { label: 'Institutions',   path: '/officer/institutions' },
  { label: 'Enrolments',     path: '/officer/enrolments' },
  { label: 'Integrity Queue',path: '/officer/queue' },
  { label: 'Seat Ledger',    path: '/officer/seats' },
  { label: 'Reports',        path: '/officer/reports' },
];

const RAIL = [
  { icon: LayoutDashboard, label: 'Overview',        path: '/officer' },
  { icon: Building2,       label: 'Institutions',    path: '/officer/institutions' },
  { icon: Users,           label: 'Enrolments',      path: '/officer/enrolments' },
  { icon: ShieldAlert,     label: 'Integrity Queue', path: '/officer/queue',        badge: 7 },
  { icon: BookOpen,        label: 'Seat Ledger',     path: '/officer/seats' },
  { icon: BarChart3,       label: 'Reports',         path: '/officer/reports' },
];

export default function OfficerShell() {
  return (
    <AppShell navItems={NAV} railItems={RAIL}>
      <Outlet />
    </AppShell>
  );
}

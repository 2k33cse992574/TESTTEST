import { AppShell } from '@/components/shell/AppShell';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Upload, ShieldAlert, Briefcase, BarChart3,
} from 'lucide-react';

const NAV = [
  { label: 'Overview',        path: '/institution' },
  { label: 'Students',        path: '/institution/students' },
  { label: 'Submissions',     path: '/institution/submissions' },
  { label: 'Integrity Checks',path: '/institution/integrity' },
  { label: 'Cases',           path: '/institution/cases' },
  { label: 'Reports',         path: '/institution/reports' },
];

const RAIL = [
  { icon: LayoutDashboard, label: 'Overview',        path: '/institution' },
  { icon: Users,           label: 'Students',        path: '/institution/students' },
  { icon: Upload,          label: 'Submissions',     path: '/institution/submissions' },
  { icon: ShieldAlert,     label: 'Integrity',       path: '/institution/integrity',  badge: 3 },
  { icon: Briefcase,       label: 'Cases',           path: '/institution/cases',      badge: 3 },
  { icon: BarChart3,       label: 'Reports',         path: '/institution/reports' },
];

export default function InstitutionShell() {
  return (
    <AppShell navItems={NAV} railItems={RAIL}>
      <Outlet />
    </AppShell>
  );
}

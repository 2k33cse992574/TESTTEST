import { AppShell } from '@/components/shell/AppShell';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen, MessageSquare, HelpCircle,
} from 'lucide-react';

const NAV = [
  { label: 'My Overview', path: '/student' },
  { label: 'My Details',  path: '/student/details' },
  { label: 'Documents',   path: '/student/documents' },
  { label: 'Requests',    path: '/student/requests' },
  { label: 'Help',        path: '/student/help' },
];

const RAIL = [
  { icon: LayoutDashboard, label: 'Overview',  path: '/student' },
  { icon: FileText,        label: 'My Details',path: '/student/details' },
  { icon: FolderOpen,      label: 'Documents', path: '/student/documents' },
  { icon: MessageSquare,   label: 'Requests',  path: '/student/requests' },
  { icon: HelpCircle,      label: 'Help',      path: '/student/help' },
];

export default function StudentShell() {
  return (
    <AppShell navItems={NAV} railItems={RAIL}>
      <Outlet />
    </AppShell>
  );
}

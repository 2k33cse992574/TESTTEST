import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { IconRail } from './IconRail';
import type { LucideIcon } from 'lucide-react';

interface NavItem { label: string; path: string }
interface RailItem { icon: LucideIcon; label: string; path: string; badge?: number }

interface Props {
  navItems: NavItem[];
  railItems: RailItem[];
  children: ReactNode;
}

export function AppShell({ navItems, railItems, children }: Props) {
  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden">
      <TopNav navItems={navItems} />
      <div className="flex flex-1 overflow-hidden">
        <IconRail items={railItems} />
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

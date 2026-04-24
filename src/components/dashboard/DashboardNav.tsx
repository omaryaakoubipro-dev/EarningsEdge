'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, LayoutGrid, Calendar, Clock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_TABS = [
  { href: '/dashboard', label: 'Watchlist', icon: LayoutGrid },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/history', label: 'History', icon: Clock },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="bg-bg-secondary border-b border-bg-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white hidden sm:block">EarningsEdge</span>
          </Link>

          {/* Navigation tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV_TABS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive ? 'tab-active' : 'tab-inactive'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Empty right side for balance */}
          <div className="w-24" />
        </div>
      </div>
    </header>
  );
}

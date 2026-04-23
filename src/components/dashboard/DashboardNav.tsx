'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp, LayoutGrid, Calendar, Clock, Bell, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
}

const NAV_TABS = [
  { href: '/dashboard', label: 'Watchlist', icon: LayoutGrid },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/history', label: 'History', icon: Clock },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
];

export default function DashboardNav({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

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
          <nav className="flex items-center gap-0.5 overflow-x-auto hide-scrollbar">
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

          {/* User menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden md:block max-w-[140px] truncate">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

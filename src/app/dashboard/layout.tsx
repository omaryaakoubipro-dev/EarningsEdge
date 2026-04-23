import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/dashboard/DashboardNav';

export const metadata = { title: 'EarningsEdge — Dashboard' };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

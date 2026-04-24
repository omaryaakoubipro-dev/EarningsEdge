import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import VerdictBanner from '@/components/analysis/VerdictBanner';
import MetricsTable from '@/components/analysis/MetricsTable';
import WhatStoodOut from '@/components/analysis/WhatStoodOut';
import GuidanceUpdate from '@/components/analysis/GuidanceUpdate';
import RedFlags from '@/components/analysis/RedFlags';
import QualityScore from '@/components/analysis/QualityScore';
import Sources from '@/components/analysis/Sources';
import DashboardNav from '@/components/dashboard/DashboardNav';
import type { EarningsAnalysis } from '@/lib/types';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('earnings_analyses')
    .select('ticker, company_name, period')
    .eq('id', params.id)
    .single();
  if (!data) return { title: 'Analysis — EarningsEdge' };
  return { title: `${data.ticker} ${data.period} Earnings — EarningsEdge` };
}

export default async function AnalysisPage({ params }: Props) {
  const supabase = createAdminClient();
  const { data: analysis, error } = await supabase
    .from('earnings_analyses')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !analysis) notFound();
  const a = analysis as EarningsAnalysis;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <DashboardNav />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          ← Back to Dashboard
        </a>
        <div className="mb-8">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{a.ticker}</h1>
            <span className="text-xl text-gray-400">{a.company_name}</span>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            {a.period} Earnings Report{a.report_date ? ` · Reported ${a.report_date}` : ''}
          </p>
        </div>
        <div className="space-y-6 animate-fade-in">
          <VerdictBanner verdict={a.verdict} summary={a.summary} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <MetricsTable metrics={a.metrics} />
              <WhatStoodOut whatStoodOut={a.what_stood_out} />
              <GuidanceUpdate guidance={a.guidance} />
            </div>
            <div className="space-y-6">
              <QualityScore score={a.quality_score} />
              {a.red_flags?.length > 0 && <RedFlags flags={a.red_flags} />}
              <Sources sources={a.sources} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

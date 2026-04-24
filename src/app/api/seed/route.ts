import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OWNER_ID } from '@/lib/owner';

// Protect so it can only be called once intentionally
const SEED_SECRET = process.env.CRON_SECRET ?? 'seed';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Pass ?secret=YOUR_CRON_SECRET to run seed' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // ─── ANALYSES ──────────────────────────────────────────────────────────────

  const analyses = [
    // ── APPLE Q2 FY2025 (Jan–Mar 2025, reported May 1 2025) ──────────────────
    {
      ticker: 'AAPL',
      company_name: 'Apple Inc.',
      period: 'Q2 FY2025',
      fiscal_year: 2025,
      fiscal_quarter: 2,
      report_date: '2025-05-01',
      verdict: 'beat',
      summary: 'Solid beat — Revenue $95.4B (+5% YoY) above $94.2B consensus, EPS $1.65 vs $1.62 est., Services hit all-time record $26.7B; guidance in line.',
      metrics: [
        { name: 'Revenue',          reported: '$95.36B', consensus: '$94.19B', yearAgo: '$90.75B', beat: true  },
        { name: 'EPS (Diluted)',     reported: '$1.65',   consensus: '$1.62',   yearAgo: '$1.53',   beat: true  },
        { name: 'Gross Margin',      reported: '47.1%',   consensus: '46.6%',   yearAgo: '45.5%',   beat: true  },
        { name: 'Operating Income',  reported: '$29.6B',  consensus: '$28.8B',  yearAgo: '$27.9B',  beat: true  },
        { name: 'Net Income',        reported: '$24.78B', consensus: '$24.1B',  yearAgo: '$23.64B', beat: true  },
        { name: 'Free Cash Flow',    reported: '$27.0B',  consensus: '$25.5B',  yearAgo: '$25.0B',  beat: true  },
        { name: 'Services Revenue',  reported: '$26.65B', consensus: '$25.9B',  yearAgo: '$23.87B', beat: true  },
        { name: 'iPhone Revenue',    reported: '$46.84B', consensus: '$46.2B',  yearAgo: '$45.96B', beat: true  },
      ],
      what_stood_out: {
        positives: [
          'Services revenue hit an all-time record of $26.65B, growing 12% YoY and now representing 28% of total revenue — reducing hardware cycle dependency.',
          'Gross margin expanded 160bps YoY to 47.1%, driven by favorable Services mix shift and supply chain improvements.',
          'India revenue grew strong double digits as Apple accelerates geographic diversification away from China.',
          'Capital returns remained aggressive — $29B returned to shareholders via buybacks and dividends in the quarter.',
        ],
        negatives: [
          'iPhone revenue growth was modest at +2% YoY ($46.84B vs $45.96B), with upgrade cycles remaining elongated in developed markets.',
          'Greater China revenue declined slightly, reflecting ongoing competitive pressure from Huawei and local Android brands.',
          'Wearables & Home segment continued its soft trend, down 1% YoY as the Apple Watch and AirPods categories mature.',
        ],
      },
      guidance: {
        action: 'maintained',
        details: 'Management guided Q3 FY2025 revenue to grow low-to-mid single digits YoY, implying approximately $88–90B — consistent with seasonal patterns.',
        vsExpectations: 'Guidance was roughly in line with the Street at ~$89B, neither a positive nor negative catalyst. Forex headwind of ~150bps flagged.',
      },
      red_flags: [
        'Stock-based compensation remained elevated at ~$3.0B for the quarter — a continued drag on true FCF yield.',
        'China exposure (~17% of revenue) remains a geopolitical risk; revenue in the region declined slightly YoY for the third consecutive quarter.',
      ],
      quality_score: 8.5,
      sources: [
        { title: 'Apple Q2 FY2025 Earnings Press Release', url: 'https://investor.apple.com/news/press-releases/detail/97/apple-reports-second-quarter-results', type: 'press_release' },
        { title: 'Apple 10-Q SEC Filing Q2 2025', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=10-Q', type: 'sec_filing' },
      ],
    },

    // ── NVIDIA Q4 FY2025 (Oct–Jan 2025, reported Feb 26 2025) ────────────────
    {
      ticker: 'NVDA',
      company_name: 'NVIDIA Corporation',
      period: 'Q4 FY2025',
      fiscal_year: 2025,
      fiscal_quarter: 4,
      report_date: '2025-02-26',
      verdict: 'beat',
      summary: 'Strong beat — Revenue $39.3B (+78% YoY) vs $38.05B consensus, EPS $0.89 vs $0.848 est., Data Center $35.6B; Q1 FY2026 guidance of $43.0B above Street.',
      metrics: [
        { name: 'Revenue',             reported: '$39.33B', consensus: '$38.05B', yearAgo: '$22.10B', beat: true  },
        { name: 'EPS (Diluted)',        reported: '$0.89',   consensus: '$0.848',  yearAgo: '$0.493',  beat: true  },
        { name: 'Gross Margin',         reported: '73.5%',   consensus: '73.5%',   yearAgo: '76.0%',   beat: null  },
        { name: 'Operating Income',     reported: '$23.55B', consensus: '$22.6B',  yearAgo: '$10.17B', beat: true  },
        { name: 'Net Income',           reported: '$22.09B', consensus: '$21.2B',  yearAgo: '$12.29B', beat: true  },
        { name: 'Free Cash Flow',       reported: '$16.6B',  consensus: '$15.0B',  yearAgo: '$11.1B',  beat: true  },
        { name: 'Data Center Revenue',  reported: '$35.58B', consensus: '$34.1B',  yearAgo: '$18.40B', beat: true  },
        { name: 'Gaming Revenue',       reported: '$2.54B',  consensus: '$2.4B',   yearAgo: '$2.87B',  beat: true  },
      ],
      what_stood_out: {
        positives: [
          'Data Center revenue of $35.6B (+93% YoY) continues to dwarf all expectations, driven by insatiable demand for Blackwell GPU clusters from hyperscalers.',
          'Blackwell architecture ramp is ahead of schedule — management confirmed Blackwell is now in full production and will represent the majority of Data Center revenue going forward.',
          'Q1 FY2026 guidance of $43.0B significantly exceeded the Street consensus of ~$41.8B, signaling the AI capex cycle shows no signs of deceleration.',
          'Geographic diversity strong — no single hyperscaler customer exceeded 13% of revenue, reducing concentration risk.',
        ],
        negatives: [
          'Gross margin of 73.5% came in at the low end of guidance and below the 76%+ levels seen in H1 FY2025 — Blackwell ramp costs are compressing margins temporarily.',
          'Gaming segment declined YoY as the upgrade cycle normalized post-pandemic; RTX 50-series launch timing is a watch item.',
          'Supply constraints on CoWoS packaging remain a bottleneck; some demand is being pushed into future quarters.',
        ],
      },
      guidance: {
        action: 'raised',
        details: 'Q1 FY2026 revenue guidance: $43.0B ±2% (range $42.1B–$43.9B). Gross margin guided to ~70.6% GAAP, ~71.0% non-GAAP — still compressed by Blackwell ramp costs.',
        vsExpectations: 'Revenue guidance ~3% above Street consensus of $41.8B — a clear positive catalyst. Margin guidance slightly below optimistic buy-side estimates of 72%+.',
      },
      red_flags: [
        'Gross margin compression from Blackwell transition is structural near-term — down ~250bps from peak, with recovery expected in H2 FY2026.',
        'Stock-based compensation elevated at ~$1.5B/quarter, representing ~4% of revenue — dilutive to per-share metrics.',
        'Export control risk: ~$5B in potential China Data Center revenue remains restricted; any escalation would impact future quarters.',
        'Customer concentration: top 5 hyperscaler customers represent ~50%+ of Data Center revenue — any capex pause would be felt immediately.',
      ],
      quality_score: 9.0,
      sources: [
        { title: 'NVIDIA Q4 FY2025 Earnings Press Release', url: 'https://investor.nvidia.com/news-and-events/financial-information/press-releases/detail/681/nvidia-announces-financial-results-for-fourth-quarter', type: 'press_release' },
        { title: 'NVIDIA 10-K FY2025 SEC Filing', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=10-K', type: 'sec_filing' },
      ],
    },

    // ── TESLA Q1 2025 (Jan–Mar 2025, reported Apr 22 2025) ───────────────────
    {
      ticker: 'TSLA',
      company_name: 'Tesla, Inc.',
      period: 'Q1 2025',
      fiscal_year: 2025,
      fiscal_quarter: 1,
      report_date: '2025-04-22',
      verdict: 'miss',
      summary: 'Significant miss — Revenue $19.34B (-9% YoY) vs $21.1B consensus, EPS $0.27 vs $0.43 est., auto gross margin fell to 12.5%; FCF turned negative at -$2.2B.',
      metrics: [
        { name: 'Revenue',                    reported: '$19.34B', consensus: '$21.11B', yearAgo: '$21.30B', beat: false },
        { name: 'EPS (Diluted)',               reported: '$0.27',   consensus: '$0.43',   yearAgo: '$0.45',   beat: false },
        { name: 'Gross Margin',                reported: '16.3%',   consensus: '17.1%',   yearAgo: '17.4%',   beat: false },
        { name: 'Automotive Gross Margin',     reported: '12.5%',   consensus: '14.2%',   yearAgo: '16.4%',   beat: false },
        { name: 'Operating Income',            reported: '$399M',   consensus: '$1.35B',  yearAgo: '$1.17B',  beat: false },
        { name: 'Net Income',                  reported: '$409M',   consensus: '$1.1B',   yearAgo: '$1.13B',  beat: false },
        { name: 'Free Cash Flow',              reported: '-$2.2B',  consensus: '$0.5B',   yearAgo: '$2.23B',  beat: false },
        { name: 'Vehicle Deliveries (units)',  reported: '336,681', consensus: '374,000', yearAgo: '386,810', beat: false },
        { name: 'Energy Storage (GWh)',        reported: '10.4 GWh','consensus': '8.5 GWh', yearAgo: '4.1 GWh', beat: true  },
      ],
      what_stood_out: {
        positives: [
          'Energy Generation & Storage revenue surged to $2.73B (+67% YoY), with Megapack deployments of 10.4 GWh smashing estimates — this segment is becoming a meaningful profit contributor.',
          'Full Self-Driving (Supervised) miles driven continue to grow, with management signaling a paid robotaxi service launch in Austin in June 2025.',
          'Service & Other revenue grew to $2.64B (+15% YoY), showing the installed base monetization flywheel is working.',
        ],
        negatives: [
          'Vehicle deliveries of 336,681 units missed consensus of ~374,000 badly (-13% YoY) — a combination of Model Y changeover downtime, brand sentiment headwinds, and weak European demand.',
          'Automotive gross margin collapsed to 12.5% — a multi-year low — as aggressive pricing to stimulate demand, manufacturing inefficiencies during retooling, and rising warranty costs all converged.',
          'Operating income of $399M was down ~66% YoY; net income of $409M was almost entirely supported by $688M in regulatory credit sales — core automotive profitability was essentially breakeven.',
          'Free cash flow turned sharply negative at -$2.2B, driven by high capex for Gigafactory expansion and working capital build ahead of new model launches.',
        ],
      },
      guidance: {
        action: 'lowered',
        details: 'Tesla declined to provide specific numerical guidance for full-year 2025, citing "uncertain macroeconomic environment and evolving trade policy." Management referenced "slight growth" in deliveries vs 2024 (previously had guided to meaningful growth).',
        vsExpectations: 'Withdrawal of quantitative delivery guidance was a significant disappointment — the Street had modeled ~1.9–2.0M deliveries for FY2025. Vague language spooked investors and contributed to the post-earnings stock decline.',
      },
      red_flags: [
        'Free cash flow of -$2.2B diverges massively from net income of +$409M — the gap is driven by $2.77B in capex and unfavorable working capital movements; sustained negative FCF would pressure the balance sheet.',
        '$688M in regulatory credit revenue inflated net income — stripping credits out, automotive operations were barely profitable at the net income level.',
        'Days Sales Outstanding (DSO) increased as more vehicles sit in transit/delivery pipeline, a potential early signal of demand softness.',
        'CEO Elon Musk\'s political activities and role in DOGE have been widely cited by analysts as a brand risk in Europe and among affluent EV buyers — a non-financial but material headwind.',
        'Automotive gross margin at 12.5% is dangerously close to the level where incremental price cuts would destroy profitability entirely.',
      ],
      quality_score: 4.5,
      sources: [
        { title: 'Tesla Q1 2025 Update Letter', url: 'https://ir.tesla.com/news-releases/news-release-details/tesla-q1-2025-financial-results', type: 'press_release' },
        { title: 'Tesla 10-Q Q1 2025 SEC Filing', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=10-Q', type: 'sec_filing' },
      ],
    },
  ];

  // ─── INSERT ANALYSES ────────────────────────────────────────────────────────
  const insertedIds: Record<string, string> = {};

  for (const analysis of analyses) {
    // Skip if already exists
    const { data: existing } = await supabase
      .from('earnings_analyses')
      .select('id')
      .eq('ticker', analysis.ticker)
      .eq('period', analysis.period)
      .maybeSingle();

    if (existing) {
      insertedIds[analysis.ticker] = existing.id;
      continue;
    }

    const { data, error } = await supabase
      .from('earnings_analyses')
      .insert(analysis)
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: `Failed to insert ${analysis.ticker}: ${error.message}` }, { status: 500 });
    insertedIds[analysis.ticker] = data.id;
  }

  // ─── UPSERT WATCHLIST ENTRIES ───────────────────────────────────────────────
  const watchlistEntries = [
    {
      user_id: OWNER_ID,
      ticker: 'AAPL',
      company_name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      logo_url: 'https://financialmodelingprep.com/image-stock/AAPL.png',
      current_price: 207.32,
      price_change: 1.24,
      price_change_pct: 0.6,
      market_cap: 3130000000000,
      next_earnings_date: '2025-07-31',
      last_verdict: 'beat',
      last_analysis_id: insertedIds['AAPL'],
    },
    {
      user_id: OWNER_ID,
      ticker: 'NVDA',
      company_name: 'NVIDIA Corporation',
      sector: 'Technology',
      industry: 'Semiconductors',
      logo_url: 'https://financialmodelingprep.com/image-stock/NVDA.png',
      current_price: 121.44,
      price_change: 3.87,
      price_change_pct: 3.3,
      market_cap: 2970000000000,
      next_earnings_date: '2025-05-28',
      last_verdict: 'beat',
      last_analysis_id: insertedIds['NVDA'],
    },
    {
      user_id: OWNER_ID,
      ticker: 'TSLA',
      company_name: 'Tesla, Inc.',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      logo_url: 'https://financialmodelingprep.com/image-stock/TSLA.png',
      current_price: 248.05,
      price_change: -4.21,
      price_change_pct: -1.67,
      market_cap: 797000000000,
      next_earnings_date: '2025-07-22',
      last_verdict: 'miss',
      last_analysis_id: insertedIds['TSLA'],
    },
  ];

  for (const entry of watchlistEntries) {
    const { error } = await supabase
      .from('watchlist')
      .upsert(entry, { onConflict: 'user_id,ticker' });
    if (error) return NextResponse.json({ error: `Watchlist upsert failed for ${entry.ticker}: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Database seeded with AAPL, NVDA, TSLA earnings analyses',
    analysisIds: insertedIds,
  });
}

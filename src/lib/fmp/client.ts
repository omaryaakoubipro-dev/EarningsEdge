import type {
  FMPCompanyProfile,
  FMPEarningsCalendarEntry,
  FMPIncomeStatement,
  FMPBalanceSheet,
  FMPCashFlow,
  FMPAnalystEstimate,
} from '../types';

// FMP migrated to /stable/ for new accounts (August 2025)
const BASE = 'https://financialmodelingprep.com/stable';
const KEY = process.env.FMP_API_KEY!;

async function fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apikey', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`FMP ${path} → ${res.status}`);
  const data = await res.json();

  if (data && !Array.isArray(data) && data['Error Message']) {
    throw new Error(`FMP: ${data['Error Message']}`);
  }
  return data as T;
}

// ── Company profile: FMP first, Yahoo Finance fallback ──────────────────────

async function getProfileFromYahoo(ticker: string): Promise<FMPCompanyProfile | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const q = data?.quoteResponse?.result?.[0];
    if (!q) return null;

    return {
      symbol: q.symbol,
      companyName: q.longName ?? q.shortName ?? ticker,
      sector: q.sector ?? '',
      industry: q.industry ?? '',
      image: `https://financialmodelingprep.com/image-stock/${ticker}.png`,
      price: q.regularMarketPrice ?? 0,
      changes: q.regularMarketChange ?? 0,
      changesPercentage: q.regularMarketChangePercent ?? 0,
      mktCap: q.marketCap ?? 0,
      description: '',
      website: q.website ?? '',
      ceo: '',
      country: q.country ?? 'US',
    };
  } catch {
    return null;
  }
}

export async function getCompanyProfile(ticker: string): Promise<FMPCompanyProfile | null> {
  // Try FMP stable first
  try {
    const data = await fmpFetch<FMPCompanyProfile[]>('/profile', { symbol: ticker });
    if (Array.isArray(data) && data[0]) return data[0];
  } catch {
    // Fall through to Yahoo Finance
  }
  // Fallback: Yahoo Finance (no API key needed)
  return getProfileFromYahoo(ticker);
}

// ── Financial statements (FMP required for these) ───────────────────────────

export async function getEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarEntry[]> {
  try {
    return await fmpFetch<FMPEarningsCalendarEntry[]>('/earnings-calendar', { from, to });
  } catch {
    return [];
  }
}

export async function getIncomeStatements(ticker: string, limit = 5): Promise<FMPIncomeStatement[]> {
  try {
    return await fmpFetch<FMPIncomeStatement[]>('/income-statement', {
      symbol: ticker, period: 'quarter', limit: String(limit),
    });
  } catch {
    return [];
  }
}

export async function getBalanceSheets(ticker: string, limit = 5): Promise<FMPBalanceSheet[]> {
  try {
    return await fmpFetch<FMPBalanceSheet[]>('/balance-sheet-statement', {
      symbol: ticker, period: 'quarter', limit: String(limit),
    });
  } catch {
    return [];
  }
}

export async function getCashFlows(ticker: string, limit = 5): Promise<FMPCashFlow[]> {
  try {
    return await fmpFetch<FMPCashFlow[]>('/cash-flow-statement', {
      symbol: ticker, period: 'quarter', limit: String(limit),
    });
  } catch {
    return [];
  }
}

export async function getAnalystEstimates(ticker: string, limit = 4): Promise<FMPAnalystEstimate[]> {
  try {
    return await fmpFetch<FMPAnalystEstimate[]>('/analyst-estimates', {
      symbol: ticker, period: 'quarter', limit: String(limit),
    });
  } catch {
    return [];
  }
}

export async function getFullFinancialData(ticker: string) {
  const [income, balance, cashflow, estimates] = await Promise.all([
    getIncomeStatements(ticker, 5),
    getBalanceSheets(ticker, 5),
    getCashFlows(ticker, 5),
    getAnalystEstimates(ticker, 4),
  ]);
  return { income, balance, cashflow, estimates };
}

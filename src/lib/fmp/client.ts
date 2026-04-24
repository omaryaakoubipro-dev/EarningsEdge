import type {
  FMPCompanyProfile,
  FMPEarningsCalendarEntry,
  FMPIncomeStatement,
  FMPBalanceSheet,
  FMPCashFlow,
  FMPAnalystEstimate,
  TickerSearchResult,
} from '../types';

// FMP migrated from /api/v3/ to /stable/ for all new accounts (August 2025)
const BASE = 'https://financialmodelingprep.com/stable';
const KEY = process.env.FMP_API_KEY!;

async function fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apikey', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`FMP ${path} → ${res.status}`);
  const data = await res.json();

  // New API returns errors as objects with "Error Message" key
  if (data && typeof data === 'object' && !Array.isArray(data) && data['Error Message']) {
    throw new Error(`FMP error: ${data['Error Message']}`);
  }

  return data as T;
}

export async function searchTickers(query: string): Promise<TickerSearchResult[]> {
  // New endpoint: /stable/search-ticker
  return fmpFetch<TickerSearchResult[]>('/search-ticker', { query, limit: '10' });
}

export async function getCompanyProfile(ticker: string): Promise<FMPCompanyProfile | null> {
  // New endpoint: /stable/profile?symbol=AAPL
  const data = await fmpFetch<FMPCompanyProfile[]>('/profile', { symbol: ticker });
  return Array.isArray(data) ? (data[0] ?? null) : null;
}

export async function getEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarEntry[]> {
  // New endpoint: /stable/earnings-calendar (was earning_calendar)
  return fmpFetch<FMPEarningsCalendarEntry[]>('/earnings-calendar', { from, to });
}

export async function getIncomeStatements(ticker: string, limit = 5): Promise<FMPIncomeStatement[]> {
  // New endpoint: /stable/income-statement?symbol=AAPL (was /income-statement/AAPL)
  return fmpFetch<FMPIncomeStatement[]>('/income-statement', {
    symbol: ticker,
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getBalanceSheets(ticker: string, limit = 5): Promise<FMPBalanceSheet[]> {
  return fmpFetch<FMPBalanceSheet[]>('/balance-sheet-statement', {
    symbol: ticker,
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getCashFlows(ticker: string, limit = 5): Promise<FMPCashFlow[]> {
  return fmpFetch<FMPCashFlow[]>('/cash-flow-statement', {
    symbol: ticker,
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getAnalystEstimates(ticker: string, limit = 4): Promise<FMPAnalystEstimate[]> {
  return fmpFetch<FMPAnalystEstimate[]>('/analyst-estimates', {
    symbol: ticker,
    period: 'quarter',
    limit: String(limit),
  });
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

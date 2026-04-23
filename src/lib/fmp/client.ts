import type {
  FMPCompanyProfile,
  FMPEarningsCalendarEntry,
  FMPIncomeStatement,
  FMPBalanceSheet,
  FMPCashFlow,
  FMPAnalystEstimate,
  TickerSearchResult,
} from '../types';

const BASE = 'https://financialmodelingprep.com/api/v3';
const KEY = process.env.FMP_API_KEY!;

async function fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apikey', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`FMP ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function searchTickers(query: string): Promise<TickerSearchResult[]> {
  return fmpFetch<TickerSearchResult[]>('/search', { query, limit: '10' });
}

export async function getCompanyProfile(ticker: string): Promise<FMPCompanyProfile | null> {
  const data = await fmpFetch<FMPCompanyProfile[]>(`/profile/${ticker}`);
  return data[0] ?? null;
}

export async function getEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarEntry[]> {
  return fmpFetch<FMPEarningsCalendarEntry[]>('/earning_calendar', { from, to });
}

export async function getIncomeStatements(ticker: string, limit = 5): Promise<FMPIncomeStatement[]> {
  return fmpFetch<FMPIncomeStatement[]>(`/income-statement/${ticker}`, {
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getBalanceSheets(ticker: string, limit = 5): Promise<FMPBalanceSheet[]> {
  return fmpFetch<FMPBalanceSheet[]>(`/balance-sheet-statement/${ticker}`, {
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getCashFlows(ticker: string, limit = 5): Promise<FMPCashFlow[]> {
  return fmpFetch<FMPCashFlow[]>(`/cash-flow-statement/${ticker}`, {
    period: 'quarter',
    limit: String(limit),
  });
}

export async function getAnalystEstimates(ticker: string, limit = 4): Promise<FMPAnalystEstimate[]> {
  return fmpFetch<FMPAnalystEstimate[]>(`/analyst-estimates/${ticker}`, {
    period: 'quarter',
    limit: String(limit),
  });
}

// Fetch all financial data needed for analysis in parallel
export async function getFullFinancialData(ticker: string) {
  const [income, balance, cashflow, estimates] = await Promise.all([
    getIncomeStatements(ticker, 5),
    getBalanceSheets(ticker, 5),
    getCashFlows(ticker, 5),
    getAnalystEstimates(ticker, 4),
  ]);
  return { income, balance, cashflow, estimates };
}

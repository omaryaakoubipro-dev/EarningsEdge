// ─────────────────────────────────────────────────────────────
// Core domain types for EarningsEdge
// ─────────────────────────────────────────────────────────────

export type Verdict = 'beat' | 'miss' | 'inline';

export interface WatchlistItem {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  logo_url: string | null;
  current_price: number | null;
  price_change: number | null;
  price_change_pct: number | null;
  market_cap: number | null;
  next_earnings_date: string | null;
  last_report_date: string | null;
  last_verdict: Verdict | null;
  last_analysis_id: string | null;
  added_at: string;
  updated_at: string;
}

export interface AnalysisMetric {
  name: string;
  reported: string;
  consensus: string;
  yearAgo: string;
  beat: boolean | null; // true = beat, false = miss, null = no consensus
}

export interface WhatStoodOut {
  positives: string[];
  negatives: string[];
}

export interface GuidanceUpdate {
  action: 'raised' | 'maintained' | 'lowered' | 'withdrawn' | 'none';
  details: string;
  vsExpectations: string;
}

export interface AnalysisSource {
  title: string;
  url: string;
  type: 'press_release' | 'sec_filing' | 'analyst' | 'news' | 'other';
}

export interface EarningsAnalysis {
  id: string;
  ticker: string;
  company_name: string;
  period: string;
  fiscal_year: number;
  fiscal_quarter: number;
  report_date: string | null;
  verdict: Verdict;
  summary: string;
  metrics: AnalysisMetric[];
  what_stood_out: WhatStoodOut;
  guidance: GuidanceUpdate;
  red_flags: string[];
  quality_score: number;
  sources: AnalysisSource[];
  raw_income_statement?: unknown;
  raw_balance_sheet?: unknown;
  raw_cash_flow?: unknown;
  created_at: string;
}

export interface AlertHistoryItem {
  id: string;
  user_id: string;
  ticker: string;
  analysis_id: string | null;
  verdict: Verdict;
  summary: string;
  channel: 'telegram' | 'email';
  delivered: boolean;
  sent_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  telegram_chat_id: string | null;
  telegram_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// FMP API response shapes
export interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  image: string;
  price: number;
  changes: number;
  changesPercentage: number;
  mktCap: number;
  description: string;
  website: string;
  ceo: string;
  country: string;
}

export interface FMPEarningsCalendarEntry {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding: string;
  updatedFromDate: string | null;
  time: 'bmo' | 'amc' | 'dmh'; // before market open / after market close / during market hours
}

export interface FMPIncomeStatement {
  date: string;
  symbol: string;
  period: string;
  reportedCurrency: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsDiluted: number;
  ebitda: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
}

export interface FMPBalanceSheet {
  date: string;
  symbol: string;
  period: string;
  cashAndCashEquivalents: number;
  totalCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  netDebt: number;
  accountsReceivable: number;
  inventory: number;
  shortTermDebt: number;
  longTermDebt: number;
}

export interface FMPCashFlow {
  date: string;
  symbol: string;
  period: string;
  netCashProvidedByOperatingActivities: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  netCashUsedForInvestingActivities: number;
  netCashUsedProvidedByFinancingActivities: number;
  stockBasedCompensation: number;
  dividendsPaid: number;
}

export interface FMPAnalystEstimate {
  symbol: string;
  date: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedRevenueAvg: number;
  estimatedEpsAvg: number;
  estimatedEpsHigh: number;
  estimatedEpsLow: number;
  estimatedNetIncomeLow: number;
  estimatedNetIncomeHigh: number;
  estimatedNetIncomeAvg: number;
  estimatedEbitdaAvg: number;
  numberAnalystEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
}

export interface TickerSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

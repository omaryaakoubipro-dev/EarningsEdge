-- EarningsEdge Database Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- Watchlist
-- ─────────────────────────────────────────────
create table if not exists watchlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  company_name text not null,
  sector text,
  industry text,
  logo_url text,
  current_price numeric(12, 2),
  price_change numeric(6, 2),
  price_change_pct numeric(6, 4),
  market_cap numeric(20, 2),
  next_earnings_date date,
  last_verdict text check (last_verdict in ('beat', 'miss', 'inline')),
  last_analysis_id uuid,
  added_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, ticker)
);

-- ─────────────────────────────────────────────
-- Earnings Analyses (shared across users)
-- ─────────────────────────────────────────────
create table if not exists earnings_analyses (
  id uuid default uuid_generate_v4() primary key,
  ticker text not null,
  company_name text not null,
  period text not null,         -- e.g. "Q3 2024"
  fiscal_year integer not null,
  fiscal_quarter integer not null check (fiscal_quarter between 1 and 4),
  report_date date,

  -- Core verdict
  verdict text check (verdict in ('beat', 'miss', 'inline')) not null,
  summary text not null,

  -- Structured analysis (stored as JSONB)
  metrics jsonb not null default '[]',
  what_stood_out jsonb not null default '{"positives":[],"negatives":[]}',
  guidance jsonb not null default '{}',
  red_flags jsonb not null default '[]',
  quality_score numeric(3, 1) not null check (quality_score between 0 and 10),
  sources jsonb default '[]',

  -- Raw financial data snapshot
  raw_income_statement jsonb,
  raw_balance_sheet jsonb,
  raw_cash_flow jsonb,

  created_at timestamp with time zone default now()
);

create index if not exists idx_analyses_ticker on earnings_analyses(ticker);
create index if not exists idx_analyses_report_date on earnings_analyses(report_date desc);
create index if not exists idx_analyses_ticker_date on earnings_analyses(ticker, report_date desc);

-- ─────────────────────────────────────────────
-- Alert History
-- ─────────────────────────────────────────────
create table if not exists alert_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  analysis_id uuid references earnings_analyses(id) on delete set null,
  verdict text check (verdict in ('beat', 'miss', 'inline')) not null,
  summary text not null,
  channel text check (channel in ('telegram', 'email')) not null,
  delivered boolean default true,
  sent_at timestamp with time zone default now()
);

create index if not exists idx_alerts_user on alert_history(user_id, sent_at desc);

-- ─────────────────────────────────────────────
-- User Preferences
-- ─────────────────────────────────────────────
create table if not exists user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  telegram_chat_id text,
  telegram_enabled boolean default false,
  email_enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- Row-Level Security Policies
-- ─────────────────────────────────────────────
alter table watchlist enable row level security;
alter table alert_history enable row level security;
alter table user_preferences enable row level security;
alter table earnings_analyses enable row level security;

-- Watchlist: users manage their own rows only
create policy "Users manage own watchlist"
  on watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Alert history: users see their own alerts
create policy "Users view own alerts"
  on alert_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User preferences: users manage their own prefs
create policy "Users manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Earnings analyses: readable by authenticated users; writable by service role
create policy "Authenticated users can read analyses"
  on earnings_analyses for select
  using (auth.role() = 'authenticated');

create policy "Service role can write analyses"
  on earnings_analyses for insert
  with check (true);

-- ─────────────────────────────────────────────
-- Updated_at trigger helper
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger watchlist_updated_at
  before update on watchlist
  for each row execute function update_updated_at();

create trigger preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();

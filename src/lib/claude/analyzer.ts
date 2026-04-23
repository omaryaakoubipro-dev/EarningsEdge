import Anthropic from '@anthropic-ai/sdk';
import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import type {
  EarningsAnalysis,
  FMPIncomeStatement,
  FMPBalanceSheet,
  FMPCashFlow,
  FMPAnalystEstimate,
  Verdict,
} from '../types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model — update to a newer version if needed
const MODEL = 'claude-sonnet-4-6';

interface FinancialData {
  income: FMPIncomeStatement[];
  balance: FMPBalanceSheet[];
  cashflow: FMPCashFlow[];
  estimates: FMPAnalystEstimate[];
}

function buildAnalysisPrompt(
  ticker: string,
  companyName: string,
  period: string,
  data: FinancialData
): string {
  const latest = data.income[0];
  const prevYear = data.income[4] ?? data.income[data.income.length - 1];
  const latestCF = data.cashflow[0];
  const latestBS = data.balance[0];
  const estimate = data.estimates[0];

  return `You are a senior equity research analyst. Analyze the latest quarterly earnings for ${companyName} (${ticker}) for ${period}.

## Financial Data Provided

### Latest Quarter Income Statement (${latest?.date ?? 'N/A'})
- Revenue: $${latest?.revenue?.toLocaleString() ?? 'N/A'}
- Gross Profit: $${latest?.grossProfit?.toLocaleString() ?? 'N/A'} (${((latest?.grossProfitRatio ?? 0) * 100).toFixed(1)}% margin)
- Operating Income: $${latest?.operatingIncome?.toLocaleString() ?? 'N/A'} (${((latest?.operatingIncomeRatio ?? 0) * 100).toFixed(1)}% margin)
- Net Income: $${latest?.netIncome?.toLocaleString() ?? 'N/A'}
- EPS Diluted: $${latest?.epsDiluted ?? 'N/A'}
- EBITDA: $${latest?.ebitda?.toLocaleString() ?? 'N/A'}
- R&D Expenses: $${latest?.researchAndDevelopmentExpenses?.toLocaleString() ?? 'N/A'}

### Prior Year Same Quarter (${prevYear?.date ?? 'N/A'})
- Revenue: $${prevYear?.revenue?.toLocaleString() ?? 'N/A'}
- Gross Profit Ratio: ${((prevYear?.grossProfitRatio ?? 0) * 100).toFixed(1)}%
- EPS Diluted: $${prevYear?.epsDiluted ?? 'N/A'}

### Cash Flow (Latest Quarter)
- Operating Cash Flow: $${latestCF?.netCashProvidedByOperatingActivities?.toLocaleString() ?? 'N/A'}
- Free Cash Flow: $${latestCF?.freeCashFlow?.toLocaleString() ?? 'N/A'}
- CapEx: $${latestCF?.capitalExpenditure?.toLocaleString() ?? 'N/A'}
- Stock-Based Compensation: $${latestCF?.stockBasedCompensation?.toLocaleString() ?? 'N/A'}

### Balance Sheet (Latest Quarter)
- Cash & Equivalents: $${latestBS?.cashAndCashEquivalents?.toLocaleString() ?? 'N/A'}
- Total Debt: $${latestBS?.totalDebt?.toLocaleString() ?? 'N/A'}
- Net Debt: $${latestBS?.netDebt?.toLocaleString() ?? 'N/A'}
- Accounts Receivable: $${latestBS?.accountsReceivable?.toLocaleString() ?? 'N/A'}
- Inventory: $${latestBS?.inventory?.toLocaleString() ?? 'N/A'}
- Total Stockholders' Equity: $${latestBS?.totalStockholdersEquity?.toLocaleString() ?? 'N/A'}

### Analyst Consensus Estimates
- Revenue Estimate (avg): $${estimate?.estimatedRevenueAvg?.toLocaleString() ?? 'N/A'}
- EPS Estimate (avg): $${estimate?.estimatedEpsAvg ?? 'N/A'}
- Net Income Estimate (avg): $${estimate?.estimatedNetIncomeAvg?.toLocaleString() ?? 'N/A'}
- Analysts covering: ${estimate?.numberAnalystEstimatedRevenue ?? 'N/A'}

## Your Task

1. Use your web_search tool to find:
   - The current analyst consensus estimates for ${ticker} revenue and EPS for ${period} (check Yahoo Finance, MarketWatch, Seeking Alpha, Bloomberg, or similar sources)
   - Initial market reaction to this earnings report (stock price movement after-hours or next day)
   - Any notable guidance the company gave for the next quarter or full year
   - Recent analyst commentary or price target changes

2. Based on ALL the data above and your web search findings, produce a COMPLETE earnings analysis.

## Output Format

Respond ONLY with a valid JSON object (no markdown, no backticks) with exactly this structure:
{
  "verdict": "beat" | "miss" | "inline",
  "summary": "One sentence, e.g.: Strong beat — Revenue +12% YoY above expectations, EPS $1.46 vs $1.38 consensus, FY guidance raised",
  "metrics": [
    {
      "name": "Revenue",
      "reported": "$X.XB",
      "consensus": "$X.XB",
      "yearAgo": "$X.XB",
      "beat": true | false | null
    }
  ],
  "what_stood_out": {
    "positives": ["3-4 bullet points as strings"],
    "negatives": ["3-4 bullet points as strings"]
  },
  "guidance": {
    "action": "raised" | "maintained" | "lowered" | "withdrawn" | "none",
    "details": "Specific numbers: management guided FY revenue to $X-Y range",
    "vsExpectations": "How this compared to street consensus"
  },
  "red_flags": ["List of specific red flags found, or empty array if none"],
  "quality_score": 7.5,
  "sources": [
    { "title": "Source title", "url": "https://...", "type": "press_release" | "sec_filing" | "analyst" | "news" | "other" }
  ]
}

Rules:
- verdict: "beat" if meaningfully above consensus on revenue AND/OR EPS; "miss" if below; "inline" if within ~1-2%
- metrics must include: Revenue, Gross Margin, Operating Income, Net Income, EPS, Free Cash Flow (add sector-specific ones if relevant)
- quality_score 0-10: based on earnings quality, FCF vs net income coherence, guidance visibility, absence of red flags
- red_flags examples: FCF diverging from net income, DSO increase, SBC inflating earnings, accounting changes, one-time revenue
- All monetary values in human-readable format (e.g., "$4.62B", "68.2%", "$1.46")
- Use null for consensus/yearAgo if genuinely unavailable`;
}

export async function analyzeEarnings(
  ticker: string,
  companyName: string,
  period: string,
  fiscalYear: number,
  fiscalQuarter: number,
  reportDate: string,
  data: FinancialData
): Promise<Omit<EarningsAnalysis, 'id' | 'created_at'>> {
  const prompt = buildAnalysisPrompt(ticker, companyName, period, data);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      } as unknown as Tool,
    ],
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract the final text content (after tool use)
  let jsonText = '';
  for (const block of response.content) {
    if (block.type === 'text') {
      jsonText = block.text.trim();
    }
  }

  // Strip any accidental markdown fences
  jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed: {
    verdict: Verdict;
    summary: string;
    metrics: EarningsAnalysis['metrics'];
    what_stood_out: EarningsAnalysis['what_stood_out'];
    guidance: EarningsAnalysis['guidance'];
    red_flags: string[];
    quality_score: number;
    sources: EarningsAnalysis['sources'];
  };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse Claude analysis JSON: ${jsonText.slice(0, 200)}`);
  }

  return {
    ticker,
    company_name: companyName,
    period,
    fiscal_year: fiscalYear,
    fiscal_quarter: fiscalQuarter,
    report_date: reportDate,
    verdict: parsed.verdict,
    summary: parsed.summary,
    metrics: parsed.metrics ?? [],
    what_stood_out: parsed.what_stood_out ?? { positives: [], negatives: [] },
    guidance: parsed.guidance ?? { action: 'none', details: '', vsExpectations: '' },
    red_flags: parsed.red_flags ?? [],
    quality_score: parsed.quality_score ?? 5,
    sources: parsed.sources ?? [],
    raw_income_statement: data.income,
    raw_balance_sheet: data.balance,
    raw_cash_flow: data.cashflow,
  };
}

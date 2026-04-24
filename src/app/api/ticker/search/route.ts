import { NextResponse } from 'next/server';

interface YahooQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    // Use Yahoo Finance search — no API key needed, very reliable
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Yahoo search failed: ${res.status}`);

    const data = await res.json();
    const quotes: YahooQuote[] = data?.finance?.result?.[0]?.quotes ?? [];

    // Filter to equities only (exclude crypto, ETF, mutual funds for cleaner results)
    const equities = quotes
      .filter((q) => q.quoteType === 'EQUITY' && q.symbol)
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname ?? q.shortname ?? q.symbol,
        currency: 'USD',
        stockExchange: q.exchange ?? '',
        exchangeShortName: q.exchange ?? '',
      }))
      .slice(0, 8);

    return NextResponse.json(equities);
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';

// Direct ticker lookup via Yahoo Finance quote API — much more reliable than search
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim().toUpperCase();
  if (!query) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${query}&fields=symbol,longName,shortName,regularMarketPrice,exchange`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const results = data?.quoteResponse?.result ?? [];
      if (results.length > 0) {
        return NextResponse.json(
          results
            .filter((q: { quoteType?: string }) => q.quoteType === 'EQUITY')
            .map((q: { symbol: string; longName?: string; shortName?: string; exchange?: string }) => ({
              symbol: q.symbol,
              name: q.longName ?? q.shortName ?? q.symbol,
              currency: 'USD',
              stockExchange: q.exchange ?? '',
              exchangeShortName: q.exchange ?? '',
            }))
        );
      }
    }

    // If Yahoo fails, return the ticker itself as a result so user can still add it
    return NextResponse.json([
      {
        symbol: query,
        name: query,
        currency: 'USD',
        stockExchange: '',
        exchangeShortName: '',
      },
    ]);
  } catch {
    // Always return something so the user can still add the ticker
    return NextResponse.json([
      {
        symbol: query,
        name: query,
        currency: 'USD',
        stockExchange: '',
        exchangeShortName: '',
      },
    ]);
  }
}

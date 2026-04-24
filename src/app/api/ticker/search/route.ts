import { NextResponse } from 'next/server';
import { searchTickers, getCompanyProfile } from '@/lib/fmp/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    const results = await searchTickers(query);

    // If search returns results, filter loosely (include all major US exchanges)
    if (Array.isArray(results) && results.length > 0) {
      const filtered = results.filter((r) => {
        const ex = (r.exchangeShortName ?? '').toUpperCase();
        // Accept any US exchange
        return (
          ex.includes('NYSE') ||
          ex.includes('NASDAQ') ||
          ex.includes('AMEX') ||
          ex === 'ETF' ||
          ex === '' // include if no exchange listed
        );
      });
      // If filter removes everything, return unfiltered
      return NextResponse.json((filtered.length > 0 ? filtered : results).slice(0, 8));
    }

    // Fallback: try direct profile lookup if query looks like a ticker
    if (query.length <= 5) {
      const profile = await getCompanyProfile(query.toUpperCase());
      if (profile) {
        return NextResponse.json([
          {
            symbol: profile.symbol,
            name: profile.companyName,
            currency: 'USD',
            stockExchange: profile.sector ?? '',
            exchangeShortName: 'NYSE',
          },
        ]);
      }
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error('Ticker search error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}

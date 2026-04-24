import { NextResponse } from 'next/server';
import { searchTickers } from '@/lib/fmp/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    const results = await searchTickers(query);
    const filtered = results.filter(
      (r) => ['NYSE', 'NASDAQ', 'AMEX'].includes(r.exchangeShortName)
    );
    return NextResponse.json(filtered.slice(0, 8));
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}

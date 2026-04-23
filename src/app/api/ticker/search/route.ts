import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchTickers } from '@/lib/fmp/client';

// GET /api/ticker/search?q=apple
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();
  if (!query || query.length < 1) return NextResponse.json([]);

  try {
    const results = await searchTickers(query);
    // Filter to equities on major exchanges
    const filtered = results.filter(
      (r) => ['NYSE', 'NASDAQ', 'AMEX'].includes(r.exchangeShortName)
    );
    return NextResponse.json(filtered.slice(0, 8));
  } catch (err) {
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}

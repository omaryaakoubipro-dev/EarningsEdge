import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OWNER_ID } from '@/lib/owner';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', OWNER_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? {});
}

export async function PUT(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();
  const allowed = ['telegram_chat_id', 'telegram_enabled', 'email_enabled'] as const;
  const update: Record<string, unknown> = { user_id: OWNER_ID, updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(update, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

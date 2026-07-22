import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?select=section,data,description,updated_at`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: res.status });
    const rows = await res.json();
    const config: Record<string, any> = {};
    for (const row of rows) {
      config[row.section] = { ...row.data, _description: row.description, _updated_at: row.updated_at };
    }
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { section, data } = await req.json();
    if (!section || !data) {
      return NextResponse.json({ error: 'section and data required' }, { status: 400 });
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?section=eq.${encodeURIComponent(section)}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ data, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function fetchFromSupabase(
  table: string,
  options?: {
    select?: string;
    eq?: [string, string];
    single?: boolean;
    schema?: string;
  },
) {
  const schema = options?.schema || "public";
  let url = `${supabaseUrl}/rest/v1/${table}?select=${options?.select || "*"}`;

  if (options?.eq) {
    url += `&${options.eq[0]}=eq.${encodeURIComponent(options.eq[1])}`;
  }
  if (options?.single) {
    url += "&limit=1";
  }

  const res = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Accept-Profile": schema,
      "Content-Profile": schema,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (options?.single) {
    return data?.[0] || null;
  }
  return data;
}

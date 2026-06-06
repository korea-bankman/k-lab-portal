export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.endsWith(".supabase.co")) {
      return null;
    }
  } catch {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

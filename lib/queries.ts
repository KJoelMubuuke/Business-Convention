import { createClient } from "./supabase/server";
import type { Convention, Lookups, Profile } from "./types";

export async function getActiveConvention(): Promise<Convention | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conventions")
    .select("*")
    .eq("is_active", true)
    .order("year", { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

export async function getLookups(): Promise<Lookups> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lookups")
    .select("category,value")
    .order("value");
  const out: Lookups = { district: [], church: [], occupation: [] };
  for (const r of data ?? []) {
    const k = r.category as keyof Lookups;
    if (out[k]) out[k].push(r.value);
  }
  return out;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data ?? null;
}

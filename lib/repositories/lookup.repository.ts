import { createClient } from "../supabase/server";
import type { Lookup, Lookups } from "../types";

/**
 * Data-access layer for the `lookups` table.
 */

/** Returns lookup values grouped by category (used on the registration form). */
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

/** Returns all raw lookup rows (used by the admin management page). */
export async function getAllLookupRows(): Promise<Lookup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lookups")
    .select("*")
    .order("category")
    .order("value");
  return (data ?? []) as Lookup[];
}

export async function insertLookup(
  row: Pick<Lookup, "category" | "value">
): Promise<{ error: string | null; code?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("lookups").insert(row);
  return { error: error?.message ?? null, code: error?.code };
}

export async function deleteLookup(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("lookups").delete().eq("id", id);
}

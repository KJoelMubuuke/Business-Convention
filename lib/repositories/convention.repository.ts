import { createClient } from "../supabase/server";
import type { Convention } from "../types";

/**
 * Data-access layer for the `conventions` table.
 */

export async function getActiveConvention(): Promise<Convention | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conventions")
    .select("*")
    .eq("is_active", true)
    .order("year", { ascending: false })
    .limit(1)
    .single();
  return (data as Convention) ?? null;
}

export async function getAllConventions(): Promise<Convention[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conventions")
    .select("*")
    .order("year", { ascending: false });
  return (data ?? []) as Convention[];
}

export async function insertConvention(
  row: Omit<Convention, "id">
): Promise<{ error: string | null; code?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("conventions").insert(row);
  return { error: error?.message ?? null, code: error?.code };
}

export async function activateConvention(id: string): Promise<void> {
  const supabase = await createClient();
  // Deactivate all conventions first
  await supabase
    .from("conventions")
    .update({ is_active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  // Activate only the chosen one
  await supabase.from("conventions").update({ is_active: true }).eq("id", id);
}

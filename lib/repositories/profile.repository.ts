import { createClient } from "../supabase/server";
import type { Profile, Role } from "../types";

/**
 * Data-access layer for the `profiles` table.
 */

/** Returns the profile of the currently authenticated user. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

/** Returns all user profiles (used by the admin users page). */
export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("role");
  return (data ?? []) as Profile[];
}

export async function updateProfileRole(id: string, role: Role): Promise<void> {
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
}

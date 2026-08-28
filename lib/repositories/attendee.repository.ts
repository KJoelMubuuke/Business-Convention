import { createClient } from "../supabase/server";
import type { Attendee } from "../types";

/**
 * Data-access layer for the `attendees` table.
 * All functions return raw Supabase data — no business logic here.
 */

export async function getAttendeeById(id: string): Promise<Attendee | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendees")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Attendee) ?? null;
}

export async function getAttendeesByConvention(conventionId: string): Promise<Attendee[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendees")
    .select("*")
    .eq("convention_id", conventionId)
    .order("full_name");
  return (data ?? []) as Attendee[];
}

export async function insertAttendee(
  row: Omit<Attendee, "id" | "created_at" | "checked_in_at">
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("attendees").insert(row);
  return { error: error?.message ?? null };
}

export async function updateAttendee(
  id: string,
  row: Partial<Omit<Attendee, "id" | "created_at" | "created_by">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("attendees").update(row).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteAttendee(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("attendees").delete().eq("id", id);
}

export async function checkDuplicateAttendee(
  fullName: string,
  church: string,
  conventionId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendees")
    .select("id")
    .eq("full_name", fullName)
    .eq("church", church)
    .eq("convention_id", conventionId)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export async function checkInAttendee(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("attendees")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

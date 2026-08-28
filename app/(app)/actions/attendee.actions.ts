"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerAttendee, removeAttendee, performCheckIn } from "../../../lib/services/attendee.service";
import { updateProfileRole as updateProfileRoleRepo } from "../../../lib/repositories/profile.repository";
import { clean } from "../../../lib/format";
import type { Role } from "../../../lib/types";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Thin Next.js Server Action wrappers for attendee operations.
 * These functions parse FormData, delegate to the service layer, and
 * handle framework-specific side effects (revalidation, redirects).
 */

export async function saveAttendee(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const isEdit = Boolean(clean(fd.get("id")));
  const result = await registerAttendee(fd);

  if (result?.error) return result;

  if (isEdit) {
    revalidatePath("/records");
    redirect("/records");
  }

  revalidatePath("/");
  revalidatePath("/records");
  return result;
}

export async function deleteAttendee(fd: FormData): Promise<void> {
  await removeAttendee(String(fd.get("id")));
  revalidatePath("/records");
}

export async function checkInAttendee(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const result = await performCheckIn(String(fd.get("id")));
  if (result?.error) return result;
  revalidatePath("/checkin");
  return result;
}

export async function updateUserRole(fd: FormData): Promise<void> {
  const role = String(fd.get("role")) as Role;
  if (!["system_admin", "supervisor", "registerer"].includes(role)) return;
  await updateProfileRoleRepo(String(fd.get("id")), role);
  revalidatePath("/admin/users");
}

export async function deleteUser(fd: FormData): Promise<void> {
  const { createClient } = await import("../../../lib/supabase/server");
  const supabase = await createClient();
  const targetId = String(fd.get("id"));
  await supabase.rpc('delete_user_admin', { target_user_id: targetId });
  revalidatePath("/admin/users");
}

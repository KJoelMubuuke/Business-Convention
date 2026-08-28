"use server";

import { revalidatePath } from "next/cache";
import { addLookupValue, removeLookupValue } from "../../../lib/services/lookup.service";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Thin Next.js Server Action wrappers for lookup management (admin only).
 */

export async function addLookup(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const result = await addLookupValue(fd);
  if (result?.ok) revalidatePath("/admin/lookups");
  return result;
}

export async function deleteLookup(fd: FormData): Promise<void> {
  await removeLookupValue(String(fd.get("id")));
  revalidatePath("/admin/lookups");
}

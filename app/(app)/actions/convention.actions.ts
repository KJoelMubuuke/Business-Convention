"use server";

import { revalidatePath } from "next/cache";
import { createConvention as createConventionService, setActiveConvention } from "../../../lib/services/convention.service";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Thin Next.js Server Action wrappers for convention management.
 */

export async function createConvention(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const result = await createConventionService(fd);
  if (result?.ok) revalidatePath("/admin/conventions");
  return result;
}

export async function activateConvention(fd: FormData): Promise<void> {
  await setActiveConvention(String(fd.get("id")));
  revalidatePath("/admin/conventions");
  revalidatePath("/");
}

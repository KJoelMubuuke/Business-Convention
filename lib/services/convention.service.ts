import { clean } from "../format";
import {
  insertConvention,
  activateConvention as activateConventionRepo,
} from "../repositories/convention.repository";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Application service for convention lifecycle management.
 */

export async function createConvention(fd: FormData): Promise<ActionState> {
  const title = clean(fd.get("title"));
  const year = Number(fd.get("year"));
  const fee_resident = Number(fd.get("fee_resident"));
  const fee_non_resident = Number(fd.get("fee_non_resident"));

  if (!title || !year || !fee_resident || !fee_non_resident) {
    return { error: "All fields are required." };
  }

  const { error, code } = await insertConvention({
    title,
    year,
    fee_resident,
    fee_non_resident,
    is_active: false,
  });

  if (error) {
    if (code === "23505")
      return { error: `A convention for ${year} already exists.` };
    return { error };
  }

  return { ok: `Convention "${title}" created.` };
}

export async function setActiveConvention(id: string): Promise<void> {
  await activateConventionRepo(id);
}

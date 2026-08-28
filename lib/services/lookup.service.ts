import { lookupSchema } from "../schema";
import { normalise, clean } from "../format";
import {
  insertLookup as insertLookupRow,
  deleteLookup as deleteLookupRow,
} from "../repositories/lookup.repository";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Application service for managing lookup values (admin only).
 */

export async function addLookupValue(fd: FormData): Promise<ActionState> {
  const parsed = lookupSchema.safeParse({
    category: clean(fd.get("category")),
    value: normalise(fd.get("value") as string),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error, code } = await insertLookupRow(parsed.data);

  if (error) {
    if (code === "23505") return { error: "This value already exists." };
    return { error };
  }

  return { ok: `Added "${parsed.data.value}" to ${parsed.data.category}.` };
}

export async function removeLookupValue(id: string): Promise<void> {
  await deleteLookupRow(id);
}

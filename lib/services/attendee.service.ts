import { createClient } from "../supabase/server";
import { attendeeSchema } from "../schema";
import { normalise, clean } from "../format";
import { getActiveConvention } from "../repositories/convention.repository";
import {
  insertAttendee,
  updateAttendee,
  deleteAttendee,
  checkDuplicateAttendee,
  checkInAttendee as checkInAttendeeRepo,
} from "../repositories/attendee.repository";

type ActionState = { error?: string; ok?: string } | null;

/**
 * Validates, enforces business rules, and persists a new or updated attendee.
 */
export async function registerAttendee(
  fd: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const convention = await getActiveConvention();
  if (!convention) return { error: "No active convention found." };

  const raw = {
    id: clean(fd.get("id")) || undefined,
    convention_id: convention.id,
    full_name: normalise(fd.get("full_name") as string),
    occupation: normalise(fd.get("occupation") as string),
    district: normalise(fd.get("district") as string),
    church: normalise(fd.get("church") as string),
    gender: clean(fd.get("gender")),
    residency: clean(fd.get("residency")),
    amount_paid: fd.get("amount_paid"),
    payment_method: clean(fd.get("payment_method")),
    phone: clean(fd.get("phone")),
    notes: clean(fd.get("notes")),
    allow_duplicate: clean(fd.get("allow_duplicate")),
  };

  const parsed = attendeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Business rule: fee cap enforcement
  const expectedFee =
    data.residency === "Resident"
      ? convention.fee_resident
      : convention.fee_non_resident;
  if (data.payment_method !== "Waived" && data.amount_paid > expectedFee) {
    return {
      error: `Amount paid (${data.amount_paid.toLocaleString()}) exceeds the ${
        data.residency
      } fee of UGX ${expectedFee.toLocaleString()}.`,
    };
  }

  // Business rule: duplicate prevention on new registrations
  const { id, allow_duplicate, ...row } = data;
  if (!id && allow_duplicate !== "yes") {
    const isDuplicate = await checkDuplicateAttendee(
      data.full_name,
      data.church,
      convention.id
    );
    if (isDuplicate) {
      return {
        error: `${data.full_name} from ${data.church} is already registered. Tick "Allow duplicate" if this is a different person.`,
      };
    }
  }

  if (id) {
    const { error } = await updateAttendee(id, row);
    if (error) return { error };
    return { ok: "updated" }; // caller handles redirect
  }

  const { error } = await insertAttendee({ ...row, created_by: user.id });
  if (error) return { error };

  return { ok: `✓ ${data.full_name} registered successfully.` };
}

export async function removeAttendee(id: string): Promise<void> {
  await deleteAttendee(id);
}

export async function performCheckIn(id: string): Promise<ActionState> {
  const { error } = await checkInAttendeeRepo(id);
  if (error) return { error };
  return { ok: "Checked in!" };
}

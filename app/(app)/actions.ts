"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { attendeeSchema, lookupSchema } from "../../lib/schema";
import { normalise, clean } from "../../lib/format";
import { getActiveConvention } from "../../lib/queries";
import { getSiteOrigin } from "../../lib/site-url";

type ActionState = { error?: string; ok?: string } | null;

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function login(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = clean(fd.get("email"));
  const password = clean(fd.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signup(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = clean(fd.get("email"));
  const password = clean(fd.get("password"));

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: email.split("@")[0],
      }
    }
  });
  
  if (error) return { error: error.message };
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── ATTENDEES ────────────────────────────────────────────────────────────────

export async function saveAttendee(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

  // Fee validation
  const expectedFee =
    data.residency === "Resident" ? convention.fee_resident : convention.fee_non_resident;
  if (data.payment_method !== "Waived" && data.amount_paid > expectedFee) {
    return {
      error: `Amount paid (${data.amount_paid.toLocaleString()}) exceeds the ${data.residency} fee of UGX ${expectedFee.toLocaleString()}.`,
    };
  }

  // Duplicate check (new records only)
  if (!data.id && data.allow_duplicate !== "yes") {
    const { data: dupes } = await supabase
      .from("attendees")
      .select("id")
      .eq("full_name", data.full_name)
      .eq("church", data.church)
      .eq("convention_id", convention.id)
      .limit(1);
    if (dupes && dupes.length > 0) {
      return {
        error: `${data.full_name} from ${data.church} is already registered. Tick "Allow duplicate" if this is a different person.`,
      };
    }
  }

  const { id, allow_duplicate, ...row } = data;

  if (id) {
    const { error } = await supabase.from("attendees").update(row).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/records");
    redirect("/records");
  }

  const { error } = await supabase
    .from("attendees")
    .insert({ ...row, created_by: user.id });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/records");
  return { ok: `✓ ${data.full_name} registered successfully.` };
}

export async function deleteAttendee(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("attendees").delete().eq("id", String(fd.get("id")));
  revalidatePath("/records");
}

export async function checkInAttendee(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const id = String(fd.get("id"));
  const { error } = await supabase
    .from("attendees")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/checkin");
  return { ok: "Checked in!" };
}

// ─── LOOKUPS (admin only) ─────────────────────────────────────────────────────

export async function addLookup(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const parsed = lookupSchema.safeParse({
    category: clean(fd.get("category")),
    value: normalise(fd.get("value") as string),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("lookups")
    .insert(parsed.data);
  if (error) {
    if (error.code === "23505") return { error: "This value already exists." };
    return { error: error.message };
  }
  revalidatePath("/admin/lookups");
  return { ok: `Added "${parsed.data.value}" to ${parsed.data.category}.` };
}

export async function deleteLookup(fd: FormData) {
  const supabase = await createClient();
  await supabase.from("lookups").delete().eq("id", String(fd.get("id")));
  revalidatePath("/admin/lookups");
}

// ─── CONVENTIONS (admin only) ─────────────────────────────────────────────────

export async function createConvention(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const title = clean(fd.get("title"));
  const year = Number(fd.get("year"));
  const fee_resident = Number(fd.get("fee_resident"));
  const fee_non_resident = Number(fd.get("fee_non_resident"));

  if (!title || !year || !fee_resident || !fee_non_resident) {
    return { error: "All fields are required." };
  }

  const { error } = await supabase.from("conventions").insert({
    title, year, fee_resident, fee_non_resident, is_active: false,
  });
  if (error) {
    if (error.code === "23505") return { error: `A convention for ${year} already exists.` };
    return { error: error.message };
  }
  revalidatePath("/admin/conventions");
  return { ok: `Convention "${title}" created.` };
}

export async function activateConvention(fd: FormData) {
  const supabase = await createClient();
  const id = String(fd.get("id"));
  // Deactivate all
  await supabase.from("conventions").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
  // Activate the selected one
  await supabase.from("conventions").update({ is_active: true }).eq("id", id);
  revalidatePath("/admin/conventions");
  revalidatePath("/");
}

// ─── USER MANAGEMENT (admin only) ────────────────────────────────────────────

export async function updateUserRole(fd: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const targetId = String(fd.get("id"));
  const role = String(fd.get("role"));
  if (!["system_admin", "supervisor", "registerer"].includes(role)) return;

  await supabase.from("profiles").update({ role }).eq("id", targetId);
  revalidatePath("/admin/users");
}

// ─── PASSWORD RECOVERY ────────────────────────────────────────────────────────

export async function forgotPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const email = clean(fd.get("email"));
  if (!email) return { error: "Email is required." };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteOrigin()}/reset-password`,
  });
  if (error) return { error: error.message };
  return { ok: "Password reset email sent! Check your inbox." };
}

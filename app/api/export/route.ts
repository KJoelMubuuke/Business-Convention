import { NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getActiveConvention } from "../../../lib/repositories/convention.repository";
import type { Attendee } from "../../../lib/types";

const HEADERS: (keyof Attendee)[] = [
  "full_name", "occupation", "district", "church", "gender", "residency",
  "amount_paid", "payment_method", "phone", "notes", "checked_in_at", "created_at",
];

function esc(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const convention = await getActiveConvention();
  if (!convention) return new Response("No active convention", { status: 404 });

  const { data } = await supabase
    .from("attendees")
    .select("*")
    .eq("convention_id", convention.id)
    .order("full_name");

  const rows = (data ?? []) as Attendee[];
  const csv = [
    HEADERS.join(","),
    ...rows.map((r) => HEADERS.map((h) => esc(r[h])).join(",")),
  ].join("\n");

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convention-${convention.year}.csv"`,
    },
  });
}

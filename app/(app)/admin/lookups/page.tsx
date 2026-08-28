import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/repositories/profile.repository";
import { redirect } from "next/navigation";
import LookupsManager from "../../../../components/features/admin/lookups-manager";
import type { Lookup } from "../../../../lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLookupsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "system_admin") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("lookups")
    .select("*")
    .order("category")
    .order("value");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Lookups</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add verified Uganda district names, church names, and occupations for autocomplete.
          The form will only suggest values from this list.
        </p>
      </div>
      <LookupsManager lookups={(data ?? []) as Lookup[]} />
    </div>
  );
}

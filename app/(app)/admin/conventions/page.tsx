import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/queries";
import { redirect } from "next/navigation";
import { createConvention, activateConvention } from "../../actions";
import type { Convention } from "../../../../lib/types";
import { money } from "../../../../lib/format";
import ConventionForm from "./form";

export const dynamic = "force-dynamic";

export default async function ConventionsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "system_admin") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("conventions")
    .select("*")
    .order("year", { ascending: false });

  const conventions = (data ?? []) as Convention[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Convention Management</h1>
        <p className="text-slate-500 text-sm mt-1">Create conventions and set registration fees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {conventions.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 ${
                c.is_active ? "border-blue-400 ring-1 ring-blue-300" : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{c.title}</span>
                  {c.is_active && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Resident: {money(c.fee_resident)} · Non-Resident: {money(c.fee_non_resident)}
                </div>
              </div>
              {!c.is_active && (
                <form action={activateConvention}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap">
                    Set Active
                  </button>
                </form>
              )}
            </div>
          ))}
          {conventions.length === 0 && (
            <p className="text-slate-500 text-sm">No conventions yet.</p>
          )}
        </div>

        {/* Create form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Create New Convention</h2>
          <ConventionForm action={createConvention} />
        </div>
      </div>
    </div>
  );
}

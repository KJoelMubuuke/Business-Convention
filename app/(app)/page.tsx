import { getLookups, getActiveConvention } from "../../lib/queries";
import { createClient } from "../../lib/supabase/server";
import AttendeeForm from "../../components/attendee-form";
import { money } from "../../lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lookups, convention] = await Promise.all([getLookups(), getActiveConvention()]);
  if (!convention) {
    return <p className="text-red-400">No active convention found. Please contact admin.</p>;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("attendees")
    .select("*", { count: "exact", head: true })
    .eq("convention_id", convention.id);

  const { data: totals } = await supabase
    .from("attendees")
    .select("amount_paid, residency")
    .eq("convention_id", convention.id);

  const totalCollected = (totals ?? []).reduce((s, r) => s + Number(r.amount_paid), 0);
  const residents = (totals ?? []).filter((r) => r.residency === "Resident").length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{convention.title}</h1>
        <p className="text-slate-500 text-sm mt-1">New Attendee Registration</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Registered", value: String(count ?? 0) },
          { label: "Total Collected", value: money(totalCollected) },
          { label: "Residents", value: String(residents) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className="font-semibold text-slate-900 text-sm">{value}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <AttendeeForm lookups={lookups} convention={convention} />
      </div>
    </div>
  );
}

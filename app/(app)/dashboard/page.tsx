import { createClient } from "../../../lib/supabase/server";
import { getActiveConvention, getProfile } from "../../../lib/queries";
import { redirect } from "next/navigation";
import { money } from "../../../lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [profile, convention] = await Promise.all([getProfile(), getActiveConvention()]);
  if (!profile || (profile.role !== "system_admin" && profile.role !== "supervisor")) redirect("/");
  if (!convention) return <p className="text-red-400">No active convention.</p>;

  const supabase = await createClient();
  const { data } = await supabase
    .from("attendees")
    .select("gender, residency, amount_paid, payment_method, district, church, checked_in_at")
    .eq("convention_id", convention.id);

  const rows = data ?? [];
  const total = rows.length;
  const collected = rows.reduce((s, r) => s + Number(r.amount_paid), 0);
  const male = rows.filter((r) => r.gender === "Male").length;
  const female = total - male;
  const residents = rows.filter((r) => r.residency === "Resident").length;
  const nonResidents = total - residents;
  const checkedIn = rows.filter((r) => r.checked_in_at).length;

  // Expected revenue & outstanding
  const expected =
    residents * convention.fee_resident + nonResidents * convention.fee_non_resident;
  const outstanding = expected - collected;

  // Payment breakdown
  const byPayment: Record<string, number> = {};
  rows.forEach((r) => {
    byPayment[r.payment_method] = (byPayment[r.payment_method] ?? 0) + 1;
  });

  // Top districts
  const byDistrict: Record<string, number> = {};
  rows.forEach((r) => {
    byDistrict[r.district] = (byDistrict[r.district] ?? 0) + 1;
  });
  const topDistricts = Object.entries(byDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top churches
  const byChurch: Record<string, number> = {};
  rows.forEach((r) => {
    byChurch[r.church] = (byChurch[r.church] ?? 0) + 1;
  });
  const topChurches = Object.entries(byChurch)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const StatCard = ({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) => (
    <div className={`bg-white border rounded-2xl p-5 ${accent ?? "border-slate-200"}`}>
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{convention.title} · Admin View</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <StatCard label="Total Attendees" value={String(total)} />
        <StatCard label="Total Collected" value={money(collected)} />
        <StatCard label="Male / Female" value={`${male} / ${female}`} />
        <StatCard label="Checked In" value={String(checkedIn)} sub={`${total - checkedIn} pending`} />
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Expected Revenue" value={money(expected)} sub={`${residents} Resident × ${money(convention.fee_resident)} + ${nonResidents} Non-Res × ${money(convention.fee_non_resident)}`} />
        <StatCard label="Outstanding Payments" value={money(outstanding < 0 ? 0 : outstanding)} accent={outstanding > 0 ? "border-orange-300" : "border-emerald-300"} />
        <StatCard label="Resident / Non-Resident" value={`${residents} / ${nonResidents}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment method breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {Object.entries(byPayment).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{method}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-orange-600"
                    style={{ width: `${(count / total) * 80}px` }}
                  />
                  <span className="text-slate-900 text-sm font-medium w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top districts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Top Districts</h2>
          <div className="space-y-2">
            {topDistricts.map(([district, count]) => (
              <div key={district} className="flex items-center justify-between">
                <span className="text-sm text-slate-500 truncate flex-1 mr-2">{district}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${(count / (topDistricts[0]?.[1] ?? 1)) * 60}px` }}
                  />
                  <span className="text-slate-900 text-sm font-medium w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
            {topDistricts.length === 0 && <p className="text-slate-500 text-sm">No data yet.</p>}
          </div>
        </div>

        {/* Top churches */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Top Churches</h2>
          <div className="space-y-2">
            {topChurches.map(([church, count]) => (
              <div key={church} className="flex items-center justify-between">
                <span className="text-sm text-slate-500 truncate flex-1 mr-2">{church}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(count / (topChurches[0]?.[1] ?? 1)) * 60}px` }}
                  />
                  <span className="text-slate-900 text-sm font-medium w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
            {topChurches.length === 0 && <p className="text-slate-500 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

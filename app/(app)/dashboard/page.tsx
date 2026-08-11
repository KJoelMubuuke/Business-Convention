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
  const expected = residents * convention.fee_resident + nonResidents * convention.fee_non_resident;
  const outstanding = expected - collected;

  // Top districts
  const byDistrict: Record<string, number> = {};
  rows.forEach((r) => {
    byDistrict[r.district] = (byDistrict[r.district] ?? 0) + 1;
  });
  const topDistricts = Object.entries(byDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const residentPercentage = total === 0 ? 0 : Math.round((residents / total) * 100);

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-[#005596] hidden md:block tracking-tight">Overview</h2>
          <h2 className="text-2xl font-bold text-[#005596] md:hidden tracking-tight">Overview</h2>
          <p className="text-base text-[#45464d] mt-2">Live convention metrics & alerts.</p>
        </div>
        <button className="bg-[#F15A24] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm hover:-translate-y-0.5 transition-transform">
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Total Attendees</p>
            <h3 className="text-5xl font-bold text-[#005596] mt-2 tracking-tight">{total}</h3>
          </div>
          <div className="mt-4 flex items-center text-sm text-[#F15A24]">
             <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
             <span>+{total} total</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group bg-[#eff4ff]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Total Revenue (UGX)</p>
            <h3 className="text-3xl font-bold text-[#005596] mt-2 tracking-tight">{money(collected).replace('UGX ', '')}</h3>
          </div>
          <div className="mt-4 flex items-center text-sm text-[#F15A24]">
             <span className="material-symbols-outlined mr-1 text-sm">account_balance_wallet</span>
             <span>{money(expected)} expected</span>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined" style={{ fontSize: '80px', fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#45464d] uppercase tracking-wider">Checked-In</p>
            <div className="flex items-baseline mt-2 gap-2">
              <h3 className="text-5xl font-bold text-[#005596] tracking-tight">{checkedIn}</h3>
              <span className="text-lg font-semibold text-[#45464d]">/ {total}</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-[#d3e4fe] rounded-full h-2">
            <div className="bg-[#F15A24] h-2 rounded-full" style={{ width: `${total === 0 ? 0 : (checkedIn / total) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card rounded-xl p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-[#005596] mb-4">Resident vs Non-Resident</h3>
          <div className="flex-grow flex items-center justify-center relative min-h-[250px]">
             <div className="w-48 h-48 rounded-full border-[16px] border-[#d3e4fe] relative flex items-center justify-center">
                <div 
                  className="absolute inset-[-16px] rounded-full border-[16px] border-[#F15A24]" 
                  style={{ clipPath: `polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - residentPercentage}%)` }}
                ></div>
                <div className="text-center">
                  <span className="text-3xl font-semibold text-[#005596] block tracking-tight">{residentPercentage}%</span>
                  <span className="text-xs font-bold text-[#45464d] uppercase">Resident</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#F15A24]"></div>
                <span className="text-sm text-[#45464d]">Resident ({residents})</span>
             </div>
             <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#d3e4fe]"></div>
                <span className="text-sm text-[#45464d]">Non-Resident ({nonResidents})</span>
             </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col">
           <h3 className="text-lg font-semibold text-[#005596] mb-4">Top Districts</h3>
           <div className="flex-grow flex flex-col gap-2">
             {topDistricts.map(([district, count], idx) => (
                <div key={district} className="flex justify-between items-center p-2 hover:bg-[#e5eeff] transition-colors rounded-lg">
                   <span className="text-base font-medium text-[#005596] capitalize">{district}</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium font-mono text-[#45464d]">{count}</span>
                      <div className="w-16 bg-[#d3e4fe] rounded-full h-1.5">
                         <div className="bg-[#F15A24] h-1.5 rounded-full" style={{ width: `${(count / (topDistricts[0][1] || 1)) * 100}%`, opacity: 1 - (idx * 0.2) }}></div>
                      </div>
                   </div>
                </div>
             ))}
             {topDistricts.length === 0 && <p className="text-sm text-[#45464d]">No data available.</p>}
           </div>
        </div>
      </div>

      {outstanding > 0 && (
        <div className="bg-[#ffdad6] text-[#93000a] rounded-xl p-4 flex items-start gap-4 border border-[#ba1a1a]/20">
          <span className="material-symbols-outlined mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <div>
            <h4 className="text-lg font-semibold">Outstanding Payments Detected</h4>
            <p className="text-sm mt-1 opacity-90">Totaling {money(outstanding)} in uncollected registration fees. Please review the desk queue.</p>
          </div>
          <button className="ml-auto bg-[#F15A24] text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap">
            Review Queue
          </button>
        </div>
      )}
    </>
  );
}


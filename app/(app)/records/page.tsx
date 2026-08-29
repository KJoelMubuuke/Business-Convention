import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { getActiveConvention } from "../../../lib/repositories/convention.repository";
import { getProfile } from "../../../lib/repositories/profile.repository";
import { money, formatDate } from "../../../lib/format";
import type { Attendee } from "../../../lib/types";
import { DeleteButton } from "./delete-button";
import { QrBadge } from "../../../components/features/attendees/qr-badge";

export const dynamic = "force-dynamic";

const PAYMENT_BADGE: Record<string, string> = {
  Cash: "bg-[#eaf1ff] text-[#005596] border border-[#005596]/30",
  MoMo: "bg-[#eaf1ff] text-[#005596] border border-[#005596]/30",
  Bank: "bg-[#eaf1ff] text-[#005596] border border-[#005596]/30",
  Waived: "bg-[#ffebd6] text-[#ba1a1a] border border-[#F15A24]/30",
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gender?: string; residency?: string; created_by?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const genderFilter = sp.gender ?? "";
  const residencyFilter = sp.residency ?? "";
  const createdByFilter = sp.created_by ?? "";

  const [convention, profile] = await Promise.all([getActiveConvention(), getProfile()]);
  if (!convention) return <p className="text-[#ba1a1a]">No active convention.</p>;
  const isManagement = profile?.role === "system_admin" || profile?.role === "supervisor";
  const canDelete = profile?.role === "system_admin";

  const supabase = await createClient();
  
  // Fetch profiles for the "Registered By" mapping
  const { data: profilesData } = await supabase.from("profiles").select("id, full_name");
  const profilesMap = new Map(profilesData?.map((p) => [p.id, p.full_name]) ?? []);
  
  let query = supabase
    .from("attendees")
    .select("*")
    .eq("convention_id", convention.id)
    .order("created_at", { ascending: false });

  if (!isManagement) {
    query = query.eq("created_by", profile?.id);
  } else if (createdByFilter) {
    query = query.eq("created_by", createdByFilter);
  }

  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,church.ilike.%${q}%,district.ilike.%${q}%,occupation.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (genderFilter) query = query.eq("gender", genderFilter);
  if (residencyFilter) query = query.eq("residency", residencyFilter);

  const { data } = await query;
  const rows = (data ?? []) as Attendee[];

  const total = rows.reduce((s, r) => s + Number(r.amount_paid), 0);
  const totalOutstanding = rows.reduce((s, r) => {
    if (r.payment_method === "Waived") return s;
    const expectedFee = r.residency === "Resident" ? convention.fee_resident : convention.fee_non_resident;
    return s + Math.max(0, expectedFee - Number(r.amount_paid));
  }, 0);
  const male = rows.filter((r) => r.gender === "Male").length;
  const resident = rows.filter((r) => r.residency === "Resident").length;

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#005596] tracking-tight mb-1">
            {isManagement ? "Attendee Oversight" : "My Registrations"}
          </h2>
          <p className="text-sm text-[#45464d]">
            {isManagement 
              ? "Monitor and manage all convention attendees." 
              : `Viewing records created by you.`}
          </p>
        </div>
        {isManagement && (
          <a
            href={`/api/export`}
            className="bg-white border border-[#c6c6cd] text-[#0b1c30] px-4 py-2 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#e5eeff] transition-colors flex items-center gap-2 self-start md:self-auto h-10"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </a>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#005596]">Total Registered</h3>
            <span className="material-symbols-outlined text-[#F15A24]">person_add</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30] tracking-tight">{rows.length}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#005596]">Collected (UGX)</h3>
            <span className="material-symbols-outlined text-[#F15A24]">account_balance_wallet</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30] tracking-tight">{money(total).replace('UGX ', '')}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm hover:-translate-y-0.5 transition-transform hidden lg:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#005596]">Male / Female</h3>
            <span className="material-symbols-outlined text-[#F15A24]">wc</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30] tracking-tight">{male} / {rows.length - male}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd] shadow-sm hover:-translate-y-0.5 transition-transform hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#005596]">Res / Non-Res</h3>
            <span className="material-symbols-outlined text-[#F15A24]">location_on</span>
          </div>
          <div className="text-3xl font-bold text-[#0b1c30] tracking-tight">{resident} / {rows.length - resident}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-300 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-700">Outstanding (UGX)</h3>
            <span className="material-symbols-outlined text-amber-500">account_balance</span>
          </div>
          <div className="text-3xl font-bold text-amber-700 tracking-tight">{totalOutstanding === 0 ? "—" : money(totalOutstanding).replace('UGX ', '')}</div>
          {totalOutstanding > 0 && <p className="text-xs text-amber-600 mt-1">Partial payments on record</p>}
        </div>
      </div>

      {/* Toolbar / Search & Filters */}
      <form className="flex flex-col xl:flex-row gap-4 mb-4 bg-white p-4 rounded-xl border border-[#c6c6cd] shadow-sm">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#76777d]">search</span>
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, church, district, phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24] text-sm text-[#0b1c30] h-10 transition-shadow"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <select
            name="gender"
            defaultValue={genderFilter}
            className="h-10 rounded-lg bg-[#f8f9ff] border border-[#c6c6cd] px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#F15A24] min-w-[120px]"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select
            name="residency"
            defaultValue={residencyFilter}
            className="h-10 rounded-lg bg-[#f8f9ff] border border-[#c6c6cd] px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#F15A24] min-w-[130px]"
          >
            <option value="">All Residency</option>
            <option value="Resident">Resident</option>
            <option value="Non-Resident">Non-Resident</option>
          </select>
          
          {isManagement && (
            <select
              name="created_by"
              defaultValue={createdByFilter}
              className="h-10 rounded-lg bg-[#f8f9ff] border border-[#c6c6cd] px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#F15A24] min-w-[150px]"
            >
              <option value="">All Clerks</option>
              {profilesData?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <button className="h-10 rounded-lg bg-[#005596] hover:bg-[#00437a] px-4 py-2 text-sm font-semibold text-white transition-colors flex-grow sm:flex-grow-0 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Apply
            </button>
            <a href="/records" className="h-10 rounded-lg bg-white hover:bg-[#e5eeff] border border-[#c6c6cd] px-4 py-2 text-sm font-semibold text-[#45464d] transition-colors flex-grow sm:flex-grow-0 flex items-center justify-center">
              Clear
            </a>
          </div>
        </div>
      </form>

      {/* List View */}
      <div className="bg-white rounded-xl border border-[#c6c6cd] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#c6c6cd]">
          {rows.map((r) => {
             const initials = r.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
             const isResident = r.residency === "Resident";

             return (
              <div key={r.id} className="p-4 md:p-6 hover:bg-[#f8f9ff] transition-colors flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4 w-full xl:w-auto">
                  <div className="w-12 h-12 rounded-full bg-[#ffebd6] text-[#F15A24] flex items-center justify-center font-bold text-lg flex-shrink-0 border border-[#F15A24]/20 hidden sm:flex">
                     {initials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg text-[#0b1c30]">{r.full_name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${isResident ? 'bg-[#d3e4fe] text-[#005596]' : 'bg-[#e5eeff] text-[#45464d]'}`}>
                        {r.residency}
                      </span>
                    </div>
                    <div className="text-sm text-[#45464d] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#76777d]">church</span> {r.church}</span>
                      <span className="hidden sm:inline text-[#c6c6cd]">•</span>
                      <span className="font-mono text-[13px] font-medium text-[#76777d]">ID: {r.id.substring(0,8).toUpperCase()}</span>
                      <span className="hidden sm:inline text-[#c6c6cd]">•</span>
                      <span className="text-[#45464d]">{r.gender}</span>
                    </div>
                    <div className="text-xs text-[#76777d]">
                      Registered by <span className="font-medium text-[#45464d]">{profilesMap.get(r.created_by) || "Unknown"}</span> on {formatDate(r.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto xl:justify-end mt-2 xl:mt-0">
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-lg font-bold text-[#0b1c30] tracking-tight">{money(r.amount_paid)}</span>
                    {(() => {
                      if (r.payment_method === "Waived") return null;
                      const expectedFee = r.residency === "Resident" ? convention.fee_resident : convention.fee_non_resident;
                      const rowBalance = Math.max(0, expectedFee - Number(r.amount_paid));
                      if (rowBalance === 0) {
                        return (
                          <span className="px-2 py-0.5 rounded mt-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 bg-green-100 text-green-700 border border-green-300">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Fully Paid
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 rounded mt-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-300">
                          <span className="material-symbols-outlined text-[12px]">pending</span>
                          Bal: {money(rowBalance).replace('UGX ','')}
                        </span>
                      );
                    })()}
                    <span className={`px-2 py-0.5 rounded mt-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${PAYMENT_BADGE[r.payment_method] || 'bg-slate-100 text-slate-500'}`}>
                      <span className="material-symbols-outlined text-[12px]">
                         {r.payment_method === 'Waived' ? 'stars' : 'check_circle'}
                      </span>
                      {r.payment_method}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                    <QrBadge id={r.id} name={r.full_name} />
                    {(profile?.role !== "registerer" || profile?.id === r.created_by) && (
                      <Link href={`/records/${r.id}`} className="px-4 py-2 border border-[#F15A24] text-[#F15A24] rounded-lg hover:bg-[#ffebd6] transition-colors font-semibold text-sm flex items-center gap-2 h-10 w-full sm:w-auto justify-center xl:opacity-0 xl:group-hover:opacity-100 xl:focus-within:opacity-100">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit
                      </Link>
                    )}
                    {canDelete && <DeleteButton id={r.id} name={r.full_name} />}
                  </div>
                </div>
              </div>
             );
          })}
          
          {rows.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#76777d] mb-3">inbox</span>
              <p className="text-[#45464d] text-lg font-medium">No registrations found.</p>
              <p className="text-sm text-[#76777d] mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
        
        {rows.length > 0 && (
          <div className="p-4 border-t border-[#c6c6cd] bg-[#f8f9ff] flex justify-center">
            <button className="text-sm font-semibold text-[#005596] hover:underline px-4 py-2 rounded-lg hover:bg-[#e5eeff] transition-colors h-10">
              Load More Registrations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


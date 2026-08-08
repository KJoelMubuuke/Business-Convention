import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { getActiveConvention, getProfile } from "../../../lib/queries";
import { money, formatDate } from "../../../lib/format";
import type { Attendee } from "../../../lib/types";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

const PAYMENT_BADGE: Record<string, string> = {
  Cash: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MoMo: "bg-blue-50 text-blue-700 border-blue-200",
  Bank: "bg-purple-50 text-purple-700 border-purple-200",
  Waived: "bg-slate-100 text-slate-500 border-slate-300",
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gender?: string; residency?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const genderFilter = sp.gender ?? "";
  const residencyFilter = sp.residency ?? "";

  const [convention, profile] = await Promise.all([getActiveConvention(), getProfile()]);
  if (!convention) return <p className="text-red-400">No active convention.</p>;
  const canDelete = profile?.role === "system_admin";

  const supabase = await createClient();
  let query = supabase
    .from("attendees")
    .select("*")
    .eq("convention_id", convention.id)
    .order("created_at", { ascending: false });

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
  const male = rows.filter((r) => r.gender === "Male").length;
  const resident = rows.filter((r) => r.residency === "Resident").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Records</h1>
          <p className="text-slate-500 text-sm">{convention.title}</p>
        </div>
        <a
          href={`/api/export`}
          className="ml-auto rounded-xl bg-slate-50 border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:border-slate-600 transition-colors"
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          ["Total", String(rows.length)],
          ["Collected", money(total)],
          ["Male / Female", `${male} / ${rows.length - male}`],
          ["Res / Non-Res", `${resident} / ${rows.length - resident}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="mt-1 font-semibold text-slate-900 text-sm">{v}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <form className="flex flex-wrap gap-2 mb-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, church, district, phone…"
          className="flex-1 min-w-48 rounded-xl bg-slate-50 border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <select
          name="gender"
          defaultValue={genderFilter}
          className="rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          name="residency"
          defaultValue={residencyFilter}
          className="rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Residency</option>
          <option value="Resident">Resident</option>
          <option value="Non-Resident">Non-Resident</option>
        </select>
        <button className="rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors">
          Search
        </button>
        <a href="/records" className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors border border-slate-300">
          Clear
        </a>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Church</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">District</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">G</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Residency</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Payment</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Paid</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Registered</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{r.full_name}</div>
                  {r.occupation && <div className="text-xs text-slate-500">{r.occupation}</div>}
                  {r.checked_in_at && (
                    <div className="text-xs text-emerald-400 mt-0.5">✓ Checked in</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{r.church}</td>
                <td className="px-4 py-3 text-slate-700">{r.district}</td>
                <td className="px-4 py-3 text-slate-500">{r.gender[0]}</td>
                <td className="px-4 py-3 text-slate-700">{r.residency}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${PAYMENT_BADGE[r.payment_method] ?? ""}`}>
                    {r.payment_method}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-900 font-medium">{money(r.amount_paid)}</td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {profile?.role !== "registerer" && (
                    <Link href={`/records/${r.id}`} className="text-blue-600 hover:text-blue-800 text-xs mr-3 transition-colors font-medium">
                      Edit
                    </Link>
                  )}
                  {canDelete && <DeleteButton id={r.id} name={r.full_name} />}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

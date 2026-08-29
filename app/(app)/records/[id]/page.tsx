import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getLookups } from "../../../../lib/repositories/lookup.repository";
import { getActiveConvention } from "../../../../lib/repositories/convention.repository";
import { getProfile } from "../../../../lib/repositories/profile.repository";
import AttendeeForm from "../../../../components/features/attendees/attendee-form";
import type { Attendee } from "../../../../lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("attendees").select("*").eq("id", id).single();
  if (!data) notFound();

  // Clerks can only edit their own records
  const profile = await getProfile();
  if (profile?.role === "registerer" && data.created_by !== profile.id) {
    redirect("/records");
  }

  const [lookups, convention] = await Promise.all([getLookups(), getActiveConvention()]);
  if (!convention) return <p className="text-red-400">No active convention.</p>;

  // Compute balance for the banner
  const expectedFee =
    (data as Attendee).residency === "Resident"
      ? convention.fee_resident
      : convention.fee_non_resident;
  const balance =
    (data as Attendee).payment_method === "Waived"
      ? 0
      : Math.max(0, expectedFee - Number((data as Attendee).amount_paid));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/records" className="flex items-center gap-1 text-[#005596] hover:text-[#00437a] text-sm font-semibold bg-[#e5eeff] px-3 py-1.5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Records
        </Link>
        <div>
           <h2 className="text-2xl md:text-3xl font-semibold text-[#005596] tracking-tight">Edit Record</h2>
        </div>
      </div>

      {/* Balance status banner */}
      {(data as Attendee).payment_method !== "Waived" && (
        balance > 0 ? (
          <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-amber-500 text-[22px]">account_balance</span>
            <div>
              <p className="text-sm font-bold text-amber-700">Outstanding Balance</p>
              <p className="text-xs text-amber-600">
                This attendee has an outstanding balance of{" "}
                <span className="font-bold">UGX {balance.toLocaleString()}</span>.
                Update the amount paid below to clear it.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-green-600 text-[22px]">check_circle</span>
            <p className="text-sm font-bold text-green-700">Fully Paid — no outstanding balance.</p>
          </div>
        )
      )}

      <div>
        <AttendeeForm lookups={lookups} convention={convention} existing={data as Attendee} />
      </div>
    </div>
  );
}


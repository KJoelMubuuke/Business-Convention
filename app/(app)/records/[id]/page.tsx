import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getLookups, getActiveConvention, getProfile } from "../../../../lib/queries";
import AttendeeForm from "../../../../components/attendee-form";
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
      <div>
        <AttendeeForm lookups={lookups} convention={convention} existing={data as Attendee} />
      </div>
    </div>
  );
}


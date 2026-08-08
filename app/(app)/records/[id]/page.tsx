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
        <Link href="/records" className="text-slate-500 hover:text-slate-700 text-sm transition-colors">
          ← Records
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Record</h1>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl">
        <AttendeeForm lookups={lookups} convention={convention} existing={data as Attendee} />
      </div>
    </div>
  );
}

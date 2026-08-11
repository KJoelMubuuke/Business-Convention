import { getLookups, getActiveConvention } from "../../lib/queries";
import { createClient } from "../../lib/supabase/server";
import AttendeeForm from "../../components/attendee-form";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lookups, convention] = await Promise.all([getLookups(), getActiveConvention()]);
  if (!convention) {
    return <p className="text-red-400">No active convention found. Please contact admin.</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#005596] mb-1">Register Attendee</h2>
        <p className="text-sm text-[#45464d]">Enter details to process a new convention registration.</p>
      </div>

      <AttendeeForm lookups={lookups} convention={convention} />
    </div>
  );
}

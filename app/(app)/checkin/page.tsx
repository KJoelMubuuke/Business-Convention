"use client";

import { useActionState, useState } from "react";
import { checkInAttendee } from "../actions";
import { createClient } from "../../../lib/supabase/client";
import type { Attendee } from "../../../lib/types";
import { formatDate } from "../../../lib/format";

type State = { error?: string; ok?: string } | null;

function CheckInButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(checkInAttendee, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {state?.ok && <span className="text-emerald-400 text-xs mr-2">✓ Done</span>}
      {state?.error && <span className="text-red-400 text-xs mr-2">{state.error}</span>}
      <button
        disabled={pending}
        className="rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
      >
        {pending ? "…" : "Check In"}
      </button>
    </form>
  );
}

export default function CheckInPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);

  async function search() {
    if (q.trim().length < 2) return;
    setSearching(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("attendees")
      .select("*")
      .or(`full_name.ilike.%${q}%,church.ilike.%${q}%,phone.ilike.%${q}%`)
      .order("full_name")
      .limit(20);
    setResults((data ?? []) as Attendee[]);
    setSearching(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Check-in</h1>
        <p className="text-slate-500 text-sm mt-1">Search by name, church, or phone to mark arrival</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Name, church, or phone…"
          className="flex-1 rounded-xl bg-slate-50 border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          autoFocus
        />
        <button
          onClick={search}
          disabled={searching}
          className="rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-5 py-2.5 font-semibold text-slate-900 text-sm transition-colors"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
              r.checked_in_at
                ? "bg-emerald-950/30 border-emerald-900"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900">{r.full_name}</div>
              <div className="text-sm text-slate-500">{r.church} · {r.district}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {r.residency} · {r.phone || "No phone"}
              </div>
              {r.checked_in_at && (
                <div className="text-xs text-emerald-400 mt-1">
                  ✓ Checked in at {formatDate(r.checked_in_at)}
                </div>
              )}
            </div>
            {!r.checked_in_at && <CheckInButton id={r.id} />}
            {r.checked_in_at && (
              <span className="text-emerald-400 text-sm font-medium">✓ Arrived</span>
            )}
          </div>
        ))}
        {results.length === 0 && q.length >= 2 && !searching && (
          <p className="text-center text-slate-500 py-8">No attendees found for "{q}".</p>
        )}
      </div>
    </div>
  );
}

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
      {state?.error && <span className="text-[#ba1a1a] text-xs mr-2">{state.error}</span>}
      <button
        disabled={pending}
        className="px-4 py-2 bg-[#F15A24] text-white rounded-lg hover:opacity-90 transition-colors font-semibold text-sm flex items-center gap-2 h-10 disabled:opacity-50"
      >
        {pending ? (
          <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
        ) : (
          <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
        )}
        {pending ? "Processing..." : "Check In"}
      </button>
    </form>
  );
}

export default function CheckInPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
    setHasSearched(true);
  }

  const todayCount = results.filter(r => r.checked_in_at).length;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#005596] mb-1">Check-in Desk</h2>
          <p className="text-sm text-[#45464d]">Scan QR or search to record attendee arrival.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#d3e4fe] px-4 py-2 rounded-lg border border-[#005596]/20 shadow-sm self-start md:self-auto">
           <span className="material-symbols-outlined text-[#005596]">how_to_reg</span>
           <span className="text-sm font-bold text-[#005596]">{todayCount} Check-ins matching</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96 flex">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <span className="material-symbols-outlined text-[#76777d]">search</span>
           </span>
           <input 
             value={q}
             onChange={(e) => setQ(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && search()}
             className="w-full pl-10 pr-4 py-2 bg-white border border-[#c6c6cd] rounded-l-lg focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24] text-sm text-[#0b1c30] placeholder-[#76777d] h-10 transition-shadow" 
             placeholder="Search by name, ID, or church..." 
             type="text" 
             autoFocus
           />
           <button
             onClick={search}
             disabled={searching}
             className="bg-[#005596] text-white px-4 rounded-r-lg font-semibold text-sm hover:bg-[#00437a] transition-colors h-10 flex items-center justify-center min-w-[80px]"
           >
             {searching ? "..." : "Search"}
           </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c6c6cd] rounded-lg hover:bg-[#e5eeff] transition-colors font-semibold text-sm text-[#0b1c30] h-10 shadow-sm w-full md:w-auto justify-center">
           <span className="material-symbols-outlined text-[#005596] text-[18px]">qr_code_scanner</span>
           Scan QR Code
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#c6c6cd] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="divide-y divide-[#c6c6cd]">
          {results.map((r) => {
            const initials = r.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            const isResident = r.residency === "Resident";
            
            return (
              <div key={r.id} className="p-4 md:p-6 hover:bg-[#f8f9ff] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-[#ffebd6] text-[#F15A24] flex items-center justify-center font-bold text-lg flex-shrink-0 border border-[#F15A24]/20">
                     {initials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg text-[#0b1c30]">{r.full_name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${isResident ? 'bg-[#d3e4fe] text-[#005596]' : 'bg-[#e5eeff] text-[#45464d]'}`}>
                        {r.residency}
                      </span>
                    </div>
                    <div className="text-sm text-[#45464d] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#76777d]">church</span> {r.church}</span>
                      <span className="hidden sm:inline text-[#c6c6cd]">•</span>
                      <span className="font-mono text-[13px] font-medium text-[#76777d]">{r.district}</span>
                      {r.phone && (
                        <>
                          <span className="hidden sm:inline text-[#c6c6cd]">•</span>
                          <span className="font-mono text-[13px] font-medium text-[#76777d]">{r.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-2 md:mt-0">
                  {r.checked_in_at ? (
                    <span className="px-3 py-1.5 rounded-lg bg-[#eaf1ff] text-[#005596] font-bold text-sm border border-[#005596]/30 flex items-center gap-2 h-10">
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span> Checked In
                    </span>
                  ) : (
                    <CheckInButton id={r.id} />
                  )}
                </div>
              </div>
            );
          })}
          
          {results.length === 0 && hasSearched && !searching && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#76777d] mb-3">search_off</span>
              <p className="text-[#45464d] text-lg font-medium">No attendees found.</p>
              <p className="text-sm text-[#76777d] mt-1">Try searching with a different name or church.</p>
            </div>
          )}
          
          {results.length === 0 && !hasSearched && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#c6c6cd] mb-3">person_search</span>
              <p className="text-[#45464d] text-lg font-medium">Search for an attendee</p>
              <p className="text-sm text-[#76777d] mt-1">Type in the box above to find attendees to check in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


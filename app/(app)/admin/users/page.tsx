import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/repositories/profile.repository";
import { redirect } from "next/navigation";
import { updateUserRole } from "../../actions/attendee.actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "system_admin") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("role");

  const users = data ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#005596] tracking-tight mb-1">User Management</h2>
          <p className="text-sm text-[#45464d]">Assign roles and manage system access for staff members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative pb-20">
        {users.map((u) => {
          const initials = u.full_name ? u.full_name.substring(0, 2).toUpperCase() : "U";
          const isAdmin = u.role === "system_admin";
          const isSupervisor = u.role === "supervisor";
          
          return (
            <div key={u.id} className="bg-white rounded-xl border border-[#c6c6cd] shadow-sm p-6 flex flex-col relative overflow-hidden group hover:border-[#005596]/30 hover:shadow-md transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-outlined text-[60px]">{isAdmin ? 'shield_person' : isSupervisor ? 'supervisor_account' : 'person'}</span>
               </div>
               
               <div className="flex items-start gap-4 mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-full border border-[#c6c6cd] bg-[#e5eeff] flex items-center justify-center text-[#005596] font-bold text-lg flex-shrink-0">
                   {initials}
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-[#0b1c30] truncate pr-8">{u.full_name}</h3>
                   <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider inline-block mt-1 ${
                     isAdmin ? "bg-[#ffebd6] text-[#ba1a1a]" : 
                     isSupervisor ? "bg-[#d3e4fe] text-[#005596]" : 
                     "bg-[#e5eeff] text-[#45464d]"
                   }`}>
                     {isAdmin ? "System Admin" : isSupervisor ? "Supervisor" : "Registerer"}
                   </span>
                 </div>
               </div>
               
               <div className="mt-auto pt-4 border-t border-[#c6c6cd] relative z-10">
                 {u.id !== profile.id ? (
                   <form action={updateUserRole} className="flex items-center gap-2">
                     <input type="hidden" name="id" value={u.id} />
                     <div className="relative flex-grow">
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="w-full appearance-none rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] px-3 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#F15A24] focus:ring-1 focus:ring-[#F15A24] transition-colors pr-8 h-10"
                        >
                          <option value="system_admin">System Admin</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="registerer">Registerer</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <span className="material-symbols-outlined text-[#76777d]">expand_more</span>
                        </span>
                     </div>
                     <button className="rounded-lg bg-[#005596] hover:bg-[#00437a] text-white px-3 h-10 text-sm font-semibold transition-colors flex-shrink-0 flex items-center justify-center min-w-[70px]">
                       Save
                     </button>
                   </form>
                 ) : (
                   <div className="flex items-center justify-center gap-2 h-10 bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg text-[#76777d] text-sm font-medium italic">
                     <span className="material-symbols-outlined text-[18px]">verified_user</span> This is you
                   </div>
                 )}
               </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="col-span-full p-10 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-[#c6c6cd]">
            <span className="material-symbols-outlined text-4xl text-[#76777d] mb-3">group_off</span>
            <p className="text-[#45464d] text-lg font-medium">No users found.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}

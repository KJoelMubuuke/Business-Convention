import { createClient } from "../../../../lib/supabase/server";
import { getProfile } from "../../../../lib/queries";
import { redirect } from "next/navigation";
import { updateUserRole } from "../../actions";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">Assign roles to staff members — System Admin, Supervisor or Registerer</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Role</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">{u.full_name}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    u.role === "system_admin"
                      ? "bg-orange-100 text-orange-700"
                      : u.role === "supervisor"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {u.role === "system_admin" ? "System Admin" : u.role === "supervisor" ? "Supervisor" : "Registerer"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {u.id !== profile.id ? (
                    <form action={updateUserRole} className="inline-flex justify-end items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value="system_admin">System Admin</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="registerer">Registerer</option>
                      </select>
                      <button className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 text-xs font-semibold transition-colors">
                        Save
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-400 italic">You</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-slate-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

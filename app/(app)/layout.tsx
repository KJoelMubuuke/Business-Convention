import Link from "next/link";
import { getProfile, getActiveConvention } from "../../lib/queries";
import { logout } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, convention] = await Promise.all([getProfile(), getActiveConvention()]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 flex items-center h-14 gap-1">
          {/* Brand */}
          <div className="flex items-center mr-4">
            <img src="/logo.png" alt="Convention 2026" className="h-8 w-auto object-contain" />
          </div>

          {/* Links — registerer sees Register + Records; supervisor adds Dashboard; system_admin sees everything */}
          <Link href="/" className="nav-link">Register</Link>
          <Link href="/records" className="nav-link">Records</Link>
          {(profile?.role === "supervisor" || profile?.role === "system_admin") && (
            <Link href="/checkin" className="nav-link">Check-in</Link>
          )}
          {(profile?.role === "supervisor" || profile?.role === "system_admin") && (
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
          )}
          {profile?.role === "system_admin" && (
            <>
              <Link href="/admin/lookups" className="nav-link">Lookups</Link>
              <Link href="/admin/conventions" className="nav-link">Conventions</Link>
              <Link href="/admin/users" className="nav-link">Users</Link>
            </>
          )}

          {/* Spacer + user */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-slate-500 text-xs hidden sm:block">
              {profile?.full_name || profile?.role}
              {profile?.role === "system_admin" && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[10px] font-medium">
                  SYS ADMIN
                </span>
              )}
              {profile?.role === "supervisor" && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                  SUPERVISOR
                </span>
              )}
            </span>
            <form action={logout}>
              <button className="text-slate-500 hover:text-slate-700 text-xs transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>

    </div>
  );
}

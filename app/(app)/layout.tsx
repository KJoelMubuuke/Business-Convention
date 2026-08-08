import Link from "next/link";
import { getProfile, getActiveConvention } from "../../lib/queries";
import { logout } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, convention] = await Promise.all([getProfile(), getActiveConvention()]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0f2d6e] text-white flex flex-col shadow-xl z-20">
        {/* Brand Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 bg-white">
          <img src="/logo.png" alt="Convention 2026" className="h-10 w-auto object-contain" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 px-3">
            Menu
          </div>
          
          <Link href="/" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            <span className="mr-3">📝</span> Register Attendee
          </Link>
          <Link href="/records" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            <span className="mr-3">📋</span> All Records
          </Link>
          
          {(profile?.role === "supervisor" || profile?.role === "system_admin") && (
            <>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mt-6 mb-2 px-3">
                Management
              </div>
              <Link href="/checkin" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <span className="mr-3">✅</span> Check-in Desk
              </Link>
              <Link href="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <span className="mr-3">📊</span> Analytics Dashboard
              </Link>
            </>
          )}

          {profile?.role === "system_admin" && (
            <>
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mt-6 mb-2 px-3">
                System Admin
              </div>
              <Link href="/admin/lookups" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <span className="mr-3">⚙️</span> Lookups
              </Link>
              <Link href="/admin/conventions" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <span className="mr-3">📅</span> Conventions
              </Link>
              <Link href="/admin/users" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                <span className="mr-3">👥</span> User Management
              </Link>
            </>
          )}
        </nav>

        {/* User Role Badge (Bottom Sidebar) */}
        <div className="p-4 border-t border-white/10">
           <div className="px-3 py-2 rounded-lg bg-black/20">
             <div className="text-xs text-white/60 uppercase">Current Role</div>
             <div className="text-sm font-bold text-white tracking-wide">
               {profile?.role === "system_admin" ? "System Admin" : profile?.role === "supervisor" ? "Supervisor" : "Registerer"}
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex flex-shrink-0 items-center justify-between px-8 z-10 shadow-sm">
          <div>
             <h2 className="text-lg font-bold text-slate-800">Welcome, {profile?.full_name || profile?.role}!</h2>
          </div>
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button className="rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { NavLink } from "../../components/ui/nav-link";
import { BottomNav } from "../../components/ui/bottom-nav";
import { getProfile } from "../../lib/repositories/profile.repository";
import { getActiveConvention } from "../../lib/repositories/convention.repository";
import { logout } from "./actions/auth.actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, convention] = await Promise.all([getProfile(), getActiveConvention()]);

  return (
    <div className="min-h-screen font-sans text-[#0b1c30] antialiased flex flex-col md:flex-row bg-[#f8f9ff]">
      
      {/* Navigation Drawer (Desktop) / Hide on Mobile */}
      <nav className="hidden md:flex h-full w-80 rounded-r-xl bg-white shadow-[2px_0_8px_rgba(0,0,0,0.02)] fixed inset-y-0 left-0 z-[60] flex-col p-4 border-r border-[#c6c6cd]">
        {/* Drawer Header */}
        <div className="mb-8 flex items-center gap-4 px-2 pt-2">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#c6c6cd] bg-[#e5eeff] flex items-center justify-center text-[#005596] font-bold text-xl">
            {profile?.full_name ? profile.full_name.substring(0,2).toUpperCase() : profile?.role?.substring(0,2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#005596] truncate w-48">{profile?.full_name || profile?.role}</span>
            <span className="text-sm text-[#45464d] uppercase tracking-wider">{profile?.role === "system_admin" ? "System Admin" : profile?.role === "supervisor" ? "Supervisor" : "Registerer"}</span>
          </div>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col gap-2 flex-grow overflow-y-auto px-2">
          <div className="text-xs font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3 mt-2">Main Menu</div>
          <NavLink href="/" icon="person_add">Register Attendee</NavLink>
          <NavLink href="/records" icon="group">Attendee List</NavLink>

          {(profile?.role === "supervisor" || profile?.role === "system_admin") && (
            <>
              <div className="text-xs font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3 mt-6">Management</div>
              <NavLink href="/checkin" icon="qr_code_scanner">Check-in Desk</NavLink>
              <NavLink href="/dashboard" icon="dashboard">Dashboard</NavLink>
            </>
          )}

          {profile?.role === "system_admin" && (
            <>
              <div className="text-xs font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3 mt-6">System Admin</div>
              <NavLink href="/admin/lookups" icon="settings">Lookups</NavLink>
              <NavLink href="/admin/conventions" icon="event">Conventions</NavLink>
              <NavLink href="/admin/users" icon="manage_accounts">User Management</NavLink>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-[#c6c6cd] px-2">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-4 w-full p-3 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
              <span className="text-lg font-semibold">Logout</span>
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-80">
        
        {/* TopAppBar */}
        <header className="w-full top-0 sticky z-40 bg-white shadow-sm border-b border-[#c6c6cd] flex justify-between items-center px-4 md:px-10 h-16">
          <div className="flex items-center gap-4">
            {/* Logo is visible on all screens, hamburger removed because BottomNav handles mobile navigation */}
            <img src="/logo.png" alt="Business Convention" className="h-12 object-contain hidden md:block" />
            <h1 className="text-2xl font-bold text-[#005596] md:hidden truncate">Business Convention</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-lg font-semibold text-[#F15A24]">
                 {profile?.role === "system_admin" ? "System Admin" : profile?.role === "supervisor" ? "Supervisor" : "Registerer"}
               </span>
            </div>
            {/* Trailing Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c6c6cd] bg-[#e5eeff] flex items-center justify-center text-[#005596] font-bold shadow-sm">
               {profile?.full_name ? profile.full_name.substring(0,2).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-10 bg-[#ffffff] pb-[100px] md:pb-10">
          {children}
        </main>
      </div>

      <BottomNav role={profile?.role} />
    </div>
  );
}

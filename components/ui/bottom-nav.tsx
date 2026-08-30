"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../../app/(app)/actions/auth.actions";

export function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const isManagement = role === "supervisor" || role === "system_admin";

  const links = [
    ...(isManagement ? [{ href: "/dashboard", icon: "dashboard", label: "Dashboard" }] : []),
    { href: "/", icon: "person_add", label: "Register" },
    { href: "/records", icon: "group", label: "Attendees" },
    ...(isManagement ? [{ href: "/checkin", icon: "qr_code_scanner", label: "Check-In" }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-2 bg-white z-50 border-t border-[#c6c6cd] shadow-lg pb-[env(safe-area-inset-bottom,16px)]">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href)) ||
          (link.href === "/dashboard" && pathname === "/dashboard");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center transition-transform active:scale-95 flex-1 ${
              isActive
                ? "text-[#F15A24]"
                : "text-[#45464d] hover:text-[#F15A24]"
            }`}
          >
            <span
              className={`material-symbols-outlined mb-1 ${isActive ? "bg-[#ffebd6] rounded-xl px-4 py-0.5" : ""}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {link.icon}
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold`}
            >
              {link.label}
            </span>
          </Link>
        );
      })}

      <form action={logout} className="flex-1 flex flex-col items-center justify-center transition-transform active:scale-95 text-[#45464d] hover:text-[#ba1a1a]">
        <button type="submit" className="flex flex-col items-center justify-center w-full">
          <span className="material-symbols-outlined mb-1">logout</span>
          <span className="text-[10px] uppercase tracking-wider font-bold">Logout</span>
        </button>
      </form>
    </nav>
  );
}

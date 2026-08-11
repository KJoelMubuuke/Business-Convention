"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: "dashboard", label: "Home" },
    { href: "/", icon: "person_add", label: "Register" },
    { href: "/records", icon: "group", label: "Attendees" },
    { href: "/checkin", icon: "qr_code_scanner", label: "Check-In" },
    { href: "/reports", icon: "analytics", label: "Reports" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-white z-50 border-t border-[#c6c6cd] shadow-lg pb-[env(safe-area-inset-bottom,16px)]">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)) || (link.href === "/dashboard" && pathname === "/dashboard");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center transition-transform active:scale-95 w-16 ${
              isActive
                ? "bg-[#ffebd6] text-[#F15A24] rounded-xl px-3 py-1"
                : "text-[#45464d] hover:text-[#F15A24]"
            }`}
          >
            <span
              className={`material-symbols-outlined mb-1 ${isActive ? "text-[#F15A24]" : ""}`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {link.icon}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-bold ${isActive ? "text-[#F15A24]" : ""}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

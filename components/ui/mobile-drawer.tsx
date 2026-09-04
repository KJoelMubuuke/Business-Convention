"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../../app/(app)/actions/auth.actions";

interface MobileDrawerProps {
  role?: string;
  fullName?: string;
}

function DrawerLink({
  href,
  icon,
  children,
  onClose,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl text-base font-semibold transition-all duration-150 ${
        isActive
          ? "bg-[#FFF0E6] text-[#F15A24]"
          : "text-[#45464d] hover:bg-[#f0f4ff] hover:text-[#005596]"
      }`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}

export function MobileDrawer({ role, fullName }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isManagement = role === "supervisor" || role === "system_admin";
  const isAdmin = role === "system_admin";

  const roleLabel =
    role === "system_admin"
      ? "System Admin"
      : role === "supervisor"
      ? "Supervisor"
      : "Registerer";

  const initials = fullName
    ? fullName.substring(0, 2).toUpperCase()
    : role?.substring(0, 2).toUpperCase() ?? "U";

  return (
    <>
      {/* Hamburger Button */}
      <button
        id="mobile-hamburger-btn"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#005596] hover:bg-[#e5eeff] transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
          menu
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in Drawer */}
      <aside
        id="mobile-nav-drawer"
        aria-label="Navigation menu"
        className={`md:hidden fixed inset-y-0 left-0 z-[80] w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#005596] font-bold text-lg border border-[#c6c6cd]">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#005596] truncate max-w-[140px]">
                {fullName || roleLabel}
              </span>
              <span className="text-xs text-[#76777d] uppercase tracking-wider">{roleLabel}</span>
            </div>
          </div>
          <button
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[#45464d] hover:bg-[#f0f4ff] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col gap-1 flex-grow overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3">
            Main Menu
          </p>
          <DrawerLink href="/" icon="person_add" onClose={() => setOpen(false)}>
            Register Attendee
          </DrawerLink>
          <DrawerLink href="/records" icon="group" onClose={() => setOpen(false)}>
            Attendee List
          </DrawerLink>

          {isManagement && (
            <>
              <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3 mt-5">
                Management
              </p>
              <DrawerLink href="/checkin" icon="qr_code_scanner" onClose={() => setOpen(false)}>
                Check-in Desk
              </DrawerLink>
              <DrawerLink href="/dashboard" icon="dashboard" onClose={() => setOpen(false)}>
                Dashboard
              </DrawerLink>
            </>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] font-bold text-[#76777d] uppercase tracking-wider mb-1 px-3 mt-5">
                System Admin
              </p>
              <DrawerLink href="/admin/lookups" icon="settings" onClose={() => setOpen(false)}>
                Lookups
              </DrawerLink>
              <DrawerLink href="/admin/conventions" icon="event" onClose={() => setOpen(false)}>
                Conventions
              </DrawerLink>
              <DrawerLink href="/admin/users" icon="manage_accounts" onClose={() => setOpen(false)}>
                User Management
              </DrawerLink>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#e5e7eb]">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-4 w-full px-3 py-3 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors font-semibold"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                logout
              </span>
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

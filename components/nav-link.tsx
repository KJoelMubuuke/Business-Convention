"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon: string;
  children: ReactNode;
}

export function NavLink({ href, icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`sidebar-link ${isActive ? "sidebar-link-active" : "text-[#45464d]"}`}
    >
      <span className={`material-symbols-outlined mr-3 ${isActive ? "text-[#F15A24]" : "text-[#76777d]"}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span> {children}
    </Link>
  );
}

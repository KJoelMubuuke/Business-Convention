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
      className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
    >
      <span className="mr-3">{icon}</span> {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tag,
  Megaphone,
  User,
  QrCode,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navGroups = [
  {
    label: "MANAGE",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu Items" },
      { href: "/admin/categories", icon: Tag, label: "Categories" },
      { href: "/admin/offers", icon: Megaphone, label: "Offers" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/admin/profile", icon: User, label: "Profile" },
      { href: "/admin/qr", icon: QrCode, label: "QR Code" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-56 flex-col"
      style={{ background: "var(--lawha-ink)", color: "#fff" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-14 shrink-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: "var(--lawha-brand)" }}
        >
          ☕
        </div>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-bold text-sm text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Lawha
          </span>
          <span className="text-xs" style={{ color: "var(--lawha-brand)" }}>
            لوحة
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 pt-3 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p
              className="px-5 pb-2 font-bold uppercase"
              style={{
                color: "rgba(255,255,255,0.20)",
                fontSize: "0.52rem",
                letterSpacing: "0.15em",
              }}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-5 text-sm font-medium transition-colors",
                    "border-l-[3px]"
                  )}
                  style={{
                    background: isActive
                      ? "rgba(232,98,42,0.12)"
                      : "transparent",
                    color: isActive
                      ? "var(--lawha-brand)"
                      : "rgba(255,255,255,0.50)",
                    borderLeftColor: isActive
                      ? "var(--lawha-brand)"
                      : "transparent",
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div
        className="px-3 pb-4 pt-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-colors text-white/40 hover:text-white/80 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

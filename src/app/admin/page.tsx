import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  UtensilsCrossed,
  Tag,
  Megaphone,
  QrCode,
  ExternalLink,
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const restaurantId = session.user.restaurantId;

  const [restaurant, categoryCount, menuItemCount, activeOffers, qrCode] =
    await Promise.all([
      prisma.restaurant.findUnique({ where: { id: restaurantId } }),
      prisma.category.count({ where: { restaurantId, isActive: true } }),
      prisma.menuItem.count({ where: { restaurantId } }),
      prisma.offer.count({
        where: { restaurantId, isActive: true, endsAt: { gte: new Date() } },
      }),
      prisma.qrCode.findUnique({ where: { restaurantId } }),
    ]);

  if (!restaurant) redirect("/login");

  const unavailableItems = await prisma.menuItem.count({
    where: { restaurantId, isAvailable: false },
  });

  const stats = [
    {
      label: "Total Menu Items",
      value: menuItemCount,
      icon: UtensilsCrossed,
      href: "/admin/menu",
      sub: `${unavailableItems} sold out`,
      iconBg: "var(--lawha-brand-pale)",
      iconColor: "var(--lawha-brand)",
    },
    {
      label: "Categories",
      value: categoryCount,
      icon: Tag,
      href: "/admin/categories",
      sub: "active",
      iconBg: "var(--lawha-gold-pale)",
      iconColor: "var(--lawha-gold)",
    },
    {
      label: "Active Offers",
      value: activeOffers,
      icon: Megaphone,
      href: "/admin/offers",
      sub: "running now",
      iconBg: "var(--lawha-green-pale)",
      iconColor: "var(--lawha-green)",
    },
    {
      label: "QR Code",
      value: qrCode ? "Ready" : "Not set",
      icon: QrCode,
      href: "/admin/qr",
      sub: "scan to view menu",
      iconBg: "#EBF1FD",
      iconColor: "#2D6BE4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--lawha-ink)" }}>
          {restaurant.name}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--lawha-ink-2)" }}>
          Welcome back · Here&apos;s your menu overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div
              className="rounded-xl p-4 border cursor-pointer transition-shadow hover:shadow-md"
              style={{
                background: "#fff",
                borderColor: "var(--lawha-border)",
                boxShadow: "0 1px 4px rgba(26,18,10,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.iconBg }}
                >
                  <stat.icon className="h-4 w-4" style={{ color: stat.iconColor }} />
                </div>
              </div>
              <p
                className="font-medium leading-none mb-1"
                style={{
                  fontFamily: "var(--font-dm-mono, monospace)",
                  fontSize: "1.5rem",
                  color: "var(--lawha-ink)",
                }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-medium"
                style={{ color: "var(--lawha-ink-2)" }}
              >
                {stat.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--lawha-ink-3)" }}>
                {stat.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--lawha-ink)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              href: "/admin/menu",
              icon: UtensilsCrossed,
              label: "Add Item",
              sub: "New menu item",
            },
            {
              href: "/admin/categories",
              icon: Tag,
              label: "Category",
              sub: "Create a category",
            },
            {
              href: "/admin/offers",
              icon: Megaphone,
              label: "New Offer",
              sub: "Set today’s deal",
            },
            {
              href: "/admin/qr",
              icon: QrCode,
              label: "QR Code",
              sub: "Download or print",
            },
          ].map((qa) => (
            <Link key={qa.href} href={qa.href}>
              <div
                className="rounded-xl p-4 border text-center cursor-pointer transition-all
                  hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "#fff",
                  borderColor: "var(--lawha-border)",
                  boxShadow: "0 1px 4px rgba(26,18,10,0.06)",
                }}
              >
                <qa.icon
                  className="h-5 w-5 mx-auto mb-2"
                  style={{ color: "var(--lawha-brand)" }}
                />
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--lawha-ink)" }}
                >
                  {qa.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--lawha-ink-2)" }}>
                  {qa.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Public menu URL */}
      <div
        className="rounded-xl p-4 border"
        style={{
          background: "#fff",
          borderColor: "var(--lawha-border)",
          boxShadow: "0 1px 4px rgba(26,18,10,0.06)",
        }}
      >
        <p
          className="text-xs font-bold uppercase mb-3"
          style={{ color: "var(--lawha-ink-2)", letterSpacing: "0.1em" }}
        >
          Public Menu URL
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 text-xs rounded-lg px-3 py-2 truncate"
            style={{
              background: "var(--lawha-admin-bg)",
              color: "var(--lawha-ink-2)",
            }}
          >
            {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/
            {restaurant.slug}
          </code>
          <Link
            href={`/r/${restaurant.slug}`}
            target="_blank"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
              text-xs font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "var(--lawha-brand-pale)",
              color: "var(--lawha-brand)",
            }}
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

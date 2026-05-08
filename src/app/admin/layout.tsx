import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const restaurant = session.user.restaurantId
    ? await prisma.restaurant.findUnique({
        where: { id: session.user.restaurantId },
        select: { name: true, isActive: true, slug: true },
      })
    : null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--lawha-admin-bg)" }}
    >
      {/* Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AdminSidebar />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="shrink-0 flex h-14 items-center justify-between px-6 border-b"
          style={{ background: "#fff", borderColor: "var(--lawha-border)" }}
        >
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--lawha-ink)" }}>
              {restaurant?.name ?? "Admin Panel"}
            </p>
            <p
              className="text-xs"
              style={{
                color: restaurant?.isActive
                  ? "var(--lawha-green)"
                  : "var(--lawha-red)",
              }}
            >
              {restaurant?.isActive ? "● Active" : "● Inactive"}
            </p>
          </div>
          {restaurant?.slug && (
            <Link
              href={`/r/${restaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                transition-opacity hover:opacity-80"
              style={{
                background: "var(--lawha-brand-pale)",
                color: "var(--lawha-brand)",
              }}
            >
              <ExternalLink className="h-3 w-3" />
              Preview
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

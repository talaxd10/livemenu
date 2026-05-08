import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemsClient } from "./menu-items-client";

export default async function AdminMenuPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const restaurantId = session.user.restaurantId;

  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Items</h1>
        <p className="text-muted-foreground mt-1">
          Manage your menu items, prices, photos, and availability.
        </p>
      </div>
      <MenuItemsClient
        categories={categories}
        menuItems={menuItems as any}
      />
    </div>
  );
}

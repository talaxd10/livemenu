import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Organize your menu into categories that customers can browse.
        </p>
      </div>
      <CategoriesClient categories={categories} />
    </div>
  );
}

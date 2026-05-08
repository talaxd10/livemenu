import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OffersClient } from "./offers-client";

export default async function OffersPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const offers = await prisma.offer.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
        <p className="text-muted-foreground mt-1">
          Create special offers and promotions that appear on your public menu.
        </p>
      </div>
      <OffersClient offers={offers as any} />
    </div>
  );
}

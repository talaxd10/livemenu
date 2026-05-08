import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your restaurant information shown to customers.
        </p>
      </div>
      <ProfileClient restaurant={restaurant as any} />
    </div>
  );
}

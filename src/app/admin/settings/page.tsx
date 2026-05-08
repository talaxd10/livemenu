import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const openingHours = await prisma.openingHour.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your opening hours and other settings.</p>
      </div>
      <SettingsClient openingHours={openingHours} />
    </div>
  );
}

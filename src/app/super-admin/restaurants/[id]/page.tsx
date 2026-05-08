import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestaurantEditClient } from "./restaurant-edit-client";

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      users: { where: { role: { not: "SUPER_ADMIN" } } },
      _count: { select: { menuItems: true, categories: true } },
    },
  });

  if (!restaurant) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/restaurants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
            <Badge variant={restaurant.isActive ? "success" : "secondary"}>
              {restaurant.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">/r/{restaurant.slug}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/r/${restaurant.slug}`} target="_blank" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            View Menu
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Menu Items", value: restaurant._count.menuItems },
          { label: "Categories", value: restaurant._count.categories },
          { label: "Users", value: restaurant.users.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit form */}
      <RestaurantEditClient restaurant={restaurant} />

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users</CardTitle>
        </CardHeader>
        <CardContent>
          {restaurant.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users assigned to this restaurant.</p>
          ) : (
            <div className="divide-y">
              {restaurant.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{u.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="secondary">{u.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

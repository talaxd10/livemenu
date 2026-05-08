import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Coffee, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SuperAdminPage() {
  const [restaurantCount, userCount] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage all restaurants on the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Restaurants
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurantCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/super-admin/restaurants">Manage Restaurants</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/super-admin/restaurants/new">Add New Restaurant</Link>
        </Button>
      </div>
    </div>
  );
}

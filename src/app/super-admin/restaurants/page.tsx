import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toggleRestaurantActive } from "@/actions/restaurants";

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true, users: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground mt-1">{restaurants.length} restaurants total</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/super-admin/restaurants/new">
            <Plus className="h-4 w-4" /> New Restaurant
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {restaurants.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <Badge variant={r.isActive ? "success" : "secondary"}>
                      {r.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 space-x-3">
                    <span>/{r.slug}</span>
                    <span>·</span>
                    <span>{r._count.menuItems} items</span>
                    <span>·</span>
                    <span>{r._count.users} users</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/r/${r.slug}`} target="_blank" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Menu
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/super-admin/restaurants/${r.id}`}>Manage</Link>
                  </Button>
                  <form
                    action={async () => {
                      "use server";
                      await toggleRestaurantActive(r.id, !r.isActive);
                    }}
                  >
                    <Button variant="ghost" size="sm" type="submit" className="gap-1.5">
                      {r.isActive ? (
                        <><EyeOff className="h-3.5 w-3.5" /> Deactivate</>
                      ) : (
                        <><Eye className="h-3.5 w-3.5" /> Activate</>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

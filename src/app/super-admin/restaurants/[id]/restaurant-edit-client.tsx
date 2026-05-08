"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRestaurant } from "@/actions/restaurants";
import { toast } from "@/hooks/use-toast";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  instagramUrl: string | null;
  locationText: string | null;
  googleMapsUrl: string | null;
  primaryLanguage: string;
  isActive: boolean;
};

export function RestaurantEditClient({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: restaurant.name,
    phone: restaurant.phone || "",
    instagramUrl: restaurant.instagramUrl || "",
    locationText: restaurant.locationText || "",
    googleMapsUrl: restaurant.googleMapsUrl || "",
    primaryLanguage: restaurant.primaryLanguage,
    isActive: restaurant.isActive,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      try {
        await updateRestaurant(restaurant.id, fd);
        toast({ title: "Restaurant updated" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit Restaurant</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={form.locationText}
                onChange={(e) => setForm((f) => ({ ...f, locationText: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instagram URL</Label>
              <Input
                value={form.instagramUrl}
                onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <Label>Active (visible to customers)</Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

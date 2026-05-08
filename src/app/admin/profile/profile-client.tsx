"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRestaurant } from "@/actions/restaurants";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/image-upload";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  instagramUrl: string | null;
  locationText: string | null;
  googleMapsUrl: string | null;
  primaryLanguage: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
};

export function ProfileClient({ restaurant }: { restaurant: Restaurant }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: restaurant.name,
    phone: restaurant.phone || "",
    instagramUrl: restaurant.instagramUrl || "",
    locationText: restaurant.locationText || "",
    googleMapsUrl: restaurant.googleMapsUrl || "",
    primaryLanguage: restaurant.primaryLanguage,
    logoUrl: restaurant.logoUrl || "",
    coverImageUrl: restaurant.coverImageUrl || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("isActive", "true");
      try {
        await updateRestaurant(restaurant.id, fd);
        toast({ title: "Profile updated successfully" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Restaurant Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Menu URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">/r/</span>
              <Input value={restaurant.slug} disabled className="bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground">Slug cannot be changed after creation</p>
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+964 750 000 0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Primary Language</Label>
            <Input
              value={form.primaryLanguage}
              onChange={(e) => setForm((f) => ({ ...f, primaryLanguage: e.target.value }))}
              placeholder="en, ar, ku"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location & Social</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Location Text</Label>
            <Input
              value={form.locationText}
              onChange={(e) => setForm((f) => ({ ...f, locationText: e.target.value }))}
              placeholder="e.g. Erbil, Kurdistan Region"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Google Maps URL</Label>
            <Input
              value={form.googleMapsUrl}
              onChange={(e) => setForm((f) => ({ ...f, googleMapsUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Instagram URL</Label>
            <Input
              value={form.instagramUrl}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Restaurant Logo</Label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
              bucket="LOGOS"
            />
          </div>
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload
              value={form.coverImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
              bucket="COVERS"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

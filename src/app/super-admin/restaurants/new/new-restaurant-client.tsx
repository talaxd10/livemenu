"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRestaurant, createOwnerAccount } from "@/actions/restaurants";
import { toast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

export function NewRestaurantClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"restaurant" | "owner">("restaurant");
  const [restaurantId, setRestaurantId] = useState("");

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    phone: "",
    locationText: "",
    instagramUrl: "",
  });

  const [ownerForm, setOwnerForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleCreateRestaurant() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(restaurantForm).forEach(([k, v]) => fd.append(k, v));
      fd.append("slug", slugify(restaurantForm.name));
      try {
        const result = await createRestaurant(fd);
        setRestaurantId(result.restaurantId);
        setStep("owner");
        toast({ title: "Restaurant created!" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  function handleCreateOwner() {
    startTransition(async () => {
      try {
        await createOwnerAccount(
          restaurantId,
          ownerForm.name,
          ownerForm.email,
          ownerForm.password
        );
        toast({ title: "Owner account created!" });
        router.push("/super-admin/restaurants");
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  if (step === "owner") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Owner Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Owner Name</Label>
            <Input
              value={ownerForm.name}
              onChange={(e) => setOwnerForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Restaurant owner's name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Owner Email *</Label>
            <Input
              type="email"
              value={ownerForm.email}
              onChange={(e) => setOwnerForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="owner@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input
              type="password"
              value={ownerForm.password}
              onChange={(e) => setOwnerForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/super-admin/restaurants")}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleCreateOwner}
              disabled={isPending || !ownerForm.email || !ownerForm.password}
            >
              {isPending ? "Creating..." : "Create Owner Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Restaurant Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Restaurant Name *</Label>
          <Input
            value={restaurantForm.name}
            onChange={(e) => setRestaurantForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Dilan Café"
          />
          {restaurantForm.name && (
            <p className="text-xs text-muted-foreground">
              Slug: /r/{slugify(restaurantForm.name)}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            value={restaurantForm.phone}
            onChange={(e) => setRestaurantForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            value={restaurantForm.locationText}
            onChange={(e) => setRestaurantForm((f) => ({ ...f, locationText: e.target.value }))}
            placeholder="e.g. Erbil, Kurdistan"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Instagram URL</Label>
          <Input
            value={restaurantForm.instagramUrl}
            onChange={(e) => setRestaurantForm((f) => ({ ...f, instagramUrl: e.target.value }))}
          />
        </div>
        <div className="pt-2">
          <Button
            onClick={handleCreateRestaurant}
            disabled={isPending || !restaurantForm.name}
          >
            {isPending ? "Creating..." : "Create Restaurant"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

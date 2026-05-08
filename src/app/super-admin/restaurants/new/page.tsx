import { NewRestaurantClient } from "./new-restaurant-client";

export default function NewRestaurantPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Restaurant</h1>
        <p className="text-muted-foreground mt-1">Create a new restaurant on the platform.</p>
      </div>
      <NewRestaurantClient />
    </div>
  );
}

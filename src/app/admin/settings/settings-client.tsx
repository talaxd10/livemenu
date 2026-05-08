"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOpeningHours } from "@/actions/restaurants";
import { toast } from "@/hooks/use-toast";
import { DAY_NAMES } from "@/lib/utils";

type OpeningHour = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

const defaultHours = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false,
}));

export function SettingsClient({ openingHours }: { openingHours: OpeningHour[] }) {
  const [isPending, startTransition] = useTransition();

  const mergedHours = DAY_NAMES.map((_, i) => {
    const found = openingHours.find((h) => h.dayOfWeek === i);
    return found || defaultHours[i];
  });

  const [hours, setHours] = useState(mergedHours);

  function updateHour(index: number, field: keyof OpeningHour, value: string | boolean) {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateOpeningHours(hours);
        toast({ title: "Opening hours saved" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opening Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hours.map((hour, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium">{DAY_NAMES[i]}</span>
                <Switch
                  checked={!hour.isClosed}
                  onCheckedChange={(v) => updateHour(i, "isClosed", !v)}
                />
                {hour.isClosed ? (
                  <span className="text-sm text-muted-foreground">Closed</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hour.openTime || "09:00"}
                      onChange={(e) => updateHour(i, "openTime", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={hour.closeTime || "22:00"}
                      onChange={(e) => updateHour(i, "closeTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

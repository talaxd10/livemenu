"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createOffer, updateOffer, deleteOffer, toggleOfferActive } from "@/actions/offers";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/image-upload";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  priceIqd: number | null;
  photoUrl: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

const emptyForm = {
  title: "",
  description: "",
  priceIqd: "",
  photoUrl: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export function OffersClient({ offers }: { offers: Offer[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditing(offer);
    setForm({
      title: offer.title,
      description: offer.description || "",
      priceIqd: offer.priceIqd ? String(offer.priceIqd) : "",
      photoUrl: offer.photoUrl || "",
      isActive: offer.isActive,
      startsAt: offer.startsAt ? new Date(offer.startsAt).toISOString().slice(0, 16) : "",
      endsAt: offer.endsAt ? new Date(offer.endsAt).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      try {
        if (editing) {
          await updateOffer(editing.id, fd);
          toast({ title: "Offer updated" });
        } else {
          await createOffer(fd);
          toast({ title: "Offer created" });
        }
        setOpen(false);
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteOffer(id);
        toast({ title: "Offer deleted" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  function getStatus(offer: Offer) {
    if (!offer.isActive) return { label: "Inactive", variant: "secondary" as const };
    const now = new Date();
    if (offer.endsAt && new Date(offer.endsAt) < now)
      return { label: "Expired", variant: "destructive" as const };
    if (offer.startsAt && new Date(offer.startsAt) > now)
      return { label: "Upcoming", variant: "outline" as const };
    return { label: "Active", variant: "success" as const };
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No offers yet. Create your first special offer.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => {
            const status = getStatus(offer);
            return (
              <div
                key={offer.id}
                className="rounded-xl border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{offer.title}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {offer.description}
                      </p>
                    )}
                    {offer.priceIqd && (
                      <span className="text-sm font-semibold text-accent block mt-1">
                        {formatPrice(offer.priceIqd)}
                      </span>
                    )}
                  </div>
                  {offer.photoUrl && (
                    <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={offer.photoUrl}
                        alt={offer.title}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {(offer.startsAt || offer.endsAt) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {offer.startsAt && (
                      <span>From {new Date(offer.startsAt).toLocaleDateString()}</span>
                    )}
                    {offer.endsAt && (
                      <span>— Until {new Date(offer.endsAt).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch
                      checked={offer.isActive}
                      onCheckedChange={(v) => {
                        startTransition(async () => {
                          await toggleOfferActive(offer.id, v);
                        });
                      }}
                    />
                    <span>{offer.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete offer?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{offer.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(offer.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Offer" : "Add Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Weekend Special"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (IQD)</Label>
              <Input
                type="number"
                value={form.priceIqd}
                onChange={(e) => setForm((f) => ({ ...f, priceIqd: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Photo</Label>
              <ImageUpload
                value={form.photoUrl}
                onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))}
                bucket="OFFERS"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Starts At</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

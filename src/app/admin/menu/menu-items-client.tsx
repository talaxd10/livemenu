"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } from "@/actions/menu-items";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/image-upload";

type Category = { id: string; name: string };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceIqd: number;
  photoUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  category: Category;
};

interface Props {
  categories: Category[];
  menuItems: MenuItem[];
}

const emptyForm = {
  name: "",
  description: "",
  priceIqd: "",
  photoUrl: "",
  categoryId: "",
  isAvailable: true,
  isFeatured: false,
  sortOrder: "0",
};

export function MenuItemsClient({ categories, menuItems }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = menuItems.filter((item) => {
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      filterCategory === "all" || item.categoryId === filterCategory;
    return matchSearch && matchCat;
  });

  // Group by category
  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = filtered.filter((i) => i.categoryId === cat.id);
    return acc;
  }, {});

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "" });
    setOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      priceIqd: String(item.priceIqd),
      photoUrl: item.photoUrl || "",
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      sortOrder: String(item.sortOrder),
    });
    setOpen(true);
  }

  function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      try {
        if (editing) {
          await updateMenuItem(editing.id, fd);
          toast({ title: "Item updated" });
        } else {
          await createMenuItem(fd);
          toast({ title: "Item created" });
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
        await deleteMenuItem(id);
        toast({ title: "Item deleted" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleItemAvailability(id, !current);
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {/* Items grouped by category */}
      {categories.map((cat) => {
        const items = grouped[cat.id] || [];
        if (filterCategory !== "all" && filterCategory !== cat.id) return null;
        if (items.length === 0 && search) return null;

        return (
          <div key={cat.id}>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {cat.name}
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                No items in this category
              </p>
            ) : (
              <div className="divide-y rounded-lg border bg-card overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-muted">
                      {item.photoUrl ? (
                        <Image
                          src={item.photoUrl}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                          No photo
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.name}</span>
                        {item.isFeatured && (
                          <Badge variant="accent" className="text-xs">Featured</Badge>
                        )}
                        {!item.isAvailable && (
                          <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <span className="text-sm font-semibold text-accent mt-0.5 block">
                        {formatPrice(item.priceIqd)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(item.id, item.isAvailable)}
                        title={item.isAvailable ? "Mark as sold out" : "Mark as available"}
                      >
                        {item.isAvailable ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                      >
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
                            <AlertDialogTitle>Delete item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &quot;{item.name}&quot;. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Cappuccino"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Price (IQD) *</Label>
              <Input
                type="number"
                value={form.priceIqd}
                onChange={(e) => setForm((f) => ({ ...f, priceIqd: e.target.value }))}
                placeholder="e.g. 4500"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Photo</Label>
              <ImageUpload
                value={form.photoUrl}
                onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))}
                bucket="MENU_ITEMS"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="available">Available</Label>
              <Switch
                id="available"
                checked={form.isAvailable}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isAvailable: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="featured">Featured</Label>
              <Switch
                id="featured"
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
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

"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { toast } from "@/hooks/use-toast";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { menuItems: number };
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  function openCreate() {
    setEditing(null);
    setName("");
    setIsActive(true);
    setSortOrder(String(categories.length));
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setIsActive(cat.isActive);
    setSortOrder(String(cat.sortOrder));
    setOpen(true);
  }

  function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("isActive", String(isActive));
      fd.append("sortOrder", sortOrder);

      try {
        if (editing) {
          await updateCategory(editing.id, fd);
          toast({ title: "Category updated" });
        } else {
          await createCategory(fd);
          toast({ title: "Category created" });
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
        await deleteCategory(id);
        toast({ title: "Category deleted" });
      } catch (e: unknown) {
        toast({ title: "Error", description: e instanceof Error ? e.message : "An error occurred", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No categories yet. Create your first category.
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y overflow-hidden">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{cat.name}</span>
                  {!cat.isActive && (
                    <Badge variant="secondary" className="text-xs">Hidden</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Sort order: {cat.sortOrder}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
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
                      <AlertDialogTitle>Delete category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Deleting &quot;{cat.name}&quot; will also delete all its menu items. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(cat.id)}
                        className="bg-destructive text-destructive-foreground"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hot Drinks"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show on menu</Label>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

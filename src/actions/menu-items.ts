"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const menuItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  priceIqd: z.coerce.number().int().positive("Price must be positive"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

async function getRestaurantId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!session.user.restaurantId) throw new Error("No restaurant assigned");
  return session.user.restaurantId;
}

export async function createMenuItem(formData: FormData) {
  const restaurantId = await getRestaurantId();

  const data = menuItemSchema.parse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceIqd: formData.get("priceIqd"),
    photoUrl: formData.get("photoUrl") || undefined,
    isAvailable: formData.get("isAvailable") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    sortOrder: formData.get("sortOrder") || 0,
  });

  await prisma.menuItem.create({
    data: {
      ...data,
      restaurantId,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
    },
  });

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function updateMenuItem(id: string, formData: FormData) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  const data = menuItemSchema.parse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceIqd: formData.get("priceIqd"),
    photoUrl: formData.get("photoUrl") || undefined,
    isAvailable: formData.get("isAvailable") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    sortOrder: formData.get("sortOrder") || 0,
  });

  await prisma.menuItem.update({
    where: { id },
    data: {
      ...data,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
    },
  });

  revalidatePath("/admin/menu");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function toggleItemAvailability(id: string, isAvailable: boolean) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) throw new Error("Item not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  await prisma.menuItem.update({ where: { id }, data: { isAvailable } });
  revalidatePath("/admin/menu");
  return { success: true };
}

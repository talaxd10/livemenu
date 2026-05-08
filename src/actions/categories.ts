"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

async function getRestaurantId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role === "SUPER_ADMIN") return null;
  if (!session.user.restaurantId) throw new Error("No restaurant assigned");
  return session.user.restaurantId;
}

export async function createCategory(formData: FormData) {
  const restaurantId = await getRestaurantId();
  if (!restaurantId) throw new Error("Select a restaurant first");

  const data = categorySchema.parse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "true",
  });

  await prisma.category.create({
    data: { ...data, restaurantId },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error("Category not found");
  if (restaurantId && existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  const data = categorySchema.parse({
    name: formData.get("name"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "true",
  });

  await prisma.category.update({ where: { id }, data });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new Error("Category not found");
  if (restaurantId && existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu");
  return { success: true };
}

export async function getCategories(restaurantId: string) {
  return prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
  });
}

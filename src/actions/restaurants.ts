"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const restaurantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).optional(),
  phone: z.string().max(30).optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  locationText: z.string().max(200).optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  primaryLanguage: z.string().default("en"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

async function getRestaurantId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!session.user.restaurantId) throw new Error("No restaurant assigned");
  return session.user.restaurantId;
}

export async function createRestaurant(formData: FormData) {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const data = restaurantSchema.parse({
    name,
    slug: (formData.get("slug") as string) || slugify(name),
    phone: formData.get("phone") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    locationText: formData.get("locationText") || undefined,
    googleMapsUrl: formData.get("googleMapsUrl") || undefined,
    primaryLanguage: (formData.get("primaryLanguage") as string) || "en",
    logoUrl: formData.get("logoUrl") || undefined,
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    isActive: formData.get("isActive") !== "false",
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      slug: data.slug || slugify(name),
      phone: data.phone || null,
      instagramUrl: data.instagramUrl || null,
      locationText: data.locationText || null,
      googleMapsUrl: data.googleMapsUrl || null,
      logoUrl: data.logoUrl || null,
      coverImageUrl: data.coverImageUrl || null,
    },
  });

  // Create QR code record
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await prisma.qrCode.create({
    data: {
      restaurantId: restaurant.id,
      publicUrl: `${appUrl}/r/${restaurant.slug}`,
    },
  });

  revalidatePath("/super-admin/restaurants");
  return { success: true, restaurantId: restaurant.id };
}

export async function updateRestaurant(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // OWNER can only update their own restaurant
  if (session.user.role !== "SUPER_ADMIN") {
    if (session.user.restaurantId !== id) throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const data = restaurantSchema.parse({
    name,
    phone: formData.get("phone") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    locationText: formData.get("locationText") || undefined,
    googleMapsUrl: formData.get("googleMapsUrl") || undefined,
    primaryLanguage: (formData.get("primaryLanguage") as string) || "en",
    logoUrl: formData.get("logoUrl") || undefined,
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    isActive: formData.get("isActive") !== "false",
  });

  await prisma.restaurant.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      instagramUrl: data.instagramUrl || null,
      locationText: data.locationText || null,
      googleMapsUrl: data.googleMapsUrl || null,
      primaryLanguage: data.primaryLanguage,
      logoUrl: data.logoUrl || null,
      coverImageUrl: data.coverImageUrl || null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/profile");
  revalidatePath("/super-admin/restaurants");
  return { success: true };
}

export async function toggleRestaurantActive(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await prisma.restaurant.update({ where: { id }, data: { isActive } });
  revalidatePath("/super-admin/restaurants");
  return { success: true };
}

export async function createOwnerAccount(
  restaurantId: string,
  name: string,
  email: string,
  password: string
) {
  await requireSuperAdmin();

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.default.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "OWNER",
      restaurantId,
    },
  });

  revalidatePath("/super-admin/restaurants");
  return { success: true, userId: user.id };
}

export async function updateOpeningHours(
  hours: Array<{
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>
) {
  const restaurantId = await getRestaurantId();

  // Delete existing and recreate
  await prisma.openingHour.deleteMany({ where: { restaurantId } });
  await prisma.openingHour.createMany({
    data: hours.map((h) => ({ ...h, restaurantId })),
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const offerSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priceIqd: z.coerce.number().int().positive().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

async function getRestaurantId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!session.user.restaurantId) throw new Error("No restaurant assigned");
  return session.user.restaurantId;
}

export async function createOffer(formData: FormData) {
  const restaurantId = await getRestaurantId();

  const data = offerSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceIqd: formData.get("priceIqd") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    isActive: formData.get("isActive") === "true",
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });

  await prisma.offer.create({
    data: {
      ...data,
      restaurantId,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });

  revalidatePath("/admin/offers");
  return { success: true };
}

export async function updateOffer(id: string, formData: FormData) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new Error("Offer not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  const data = offerSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceIqd: formData.get("priceIqd") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    isActive: formData.get("isActive") === "true",
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });

  await prisma.offer.update({
    where: { id },
    data: {
      ...data,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });

  revalidatePath("/admin/offers");
  return { success: true };
}

export async function deleteOffer(id: string) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new Error("Offer not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offers");
  return { success: true };
}

export async function toggleOfferActive(id: string, isActive: boolean) {
  const restaurantId = await getRestaurantId();

  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new Error("Offer not found");
  if (existing.restaurantId !== restaurantId) throw new Error("Unauthorized");

  await prisma.offer.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/offers");
  return { success: true };
}

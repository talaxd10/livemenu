"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";

export async function generateQrCode(restaurantId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = restaurantId || session.user.restaurantId;
  if (!id) throw new Error("No restaurant");

  // Only allow owners to manage their own QR, super admin can manage any
  if (session.user.role !== "SUPER_ADMIN" && session.user.restaurantId !== id) {
    throw new Error("Unauthorized");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new Error("Restaurant not found");

  const publicUrl = `${appUrl}/r/${restaurant.slug}`;

  // Generate QR code as base64 data URL
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: "#1a0f0a",
      light: "#ffffff",
    },
  });

  // Upsert QR code record
  await prisma.qrCode.upsert({
    where: { restaurantId: id },
    create: { restaurantId: id, publicUrl, qrImageUrl: qrDataUrl },
    update: { publicUrl, qrImageUrl: qrDataUrl },
  });

  revalidatePath("/admin/qr");
  return { success: true, qrDataUrl, publicUrl };
}

export async function getQrCode(restaurantId: string) {
  return prisma.qrCode.findUnique({ where: { restaurantId } });
}

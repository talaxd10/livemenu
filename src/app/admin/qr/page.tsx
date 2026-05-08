import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QrCodeClient } from "./qr-code-client";

export default async function QrPage() {
  const session = await auth();
  if (!session?.user?.restaurantId) redirect("/login");

  const [restaurant, qrCode] = await Promise.all([
    prisma.restaurant.findUnique({
      where: { id: session.user.restaurantId },
      select: { slug: true, name: true },
    }),
    prisma.qrCode.findUnique({
      where: { restaurantId: session.user.restaurantId },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Code</h1>
        <p className="text-muted-foreground mt-1">
          Generate and download your restaurant's permanent QR code.
        </p>
      </div>
      <QrCodeClient
        restaurantId={session.user.restaurantId}
        restaurantSlug={restaurant?.slug || ""}
        existingQr={qrCode as any}
      />
    </div>
  );
}

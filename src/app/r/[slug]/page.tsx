import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicMenuClient } from "./public-menu-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: restaurant ? `${restaurant.name} — Menu` : "Menu",
    description: `View the live menu for ${restaurant?.name}`,
  };
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          menuItems: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!restaurant || !restaurant.isActive) {
    notFound();
  }

  // Get active offers
  const now = new Date();
  const activeOffers = await prisma.offer.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <PublicMenuClient
      restaurant={restaurant}
      activeOffers={activeOffers}
    />
  );
}

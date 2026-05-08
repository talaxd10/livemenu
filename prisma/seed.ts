import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // Idempotent: skip if already seeded to protect existing production data
  const existing = await prisma.restaurant.findUnique({
    where: { slug: "dilan-cafe" },
  });
  if (existing) {
    console.log("⏭️  Seed data already exists (restaurant 'dilan-cafe' found). Skipping.");
    return;
  }

  // Create Dilan Café restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Dilan Café",
      slug: "dilan-cafe",
      phone: "+964 750 000 0000",
      instagramUrl: "https://instagram.com/dilancafe",
      locationText: "Erbil, Kurdistan Region, Iraq",
      googleMapsUrl: "https://maps.google.com",
      primaryLanguage: "en",
      isActive: true,
    },
  });

  console.log(`✅ Created restaurant: ${restaurant.name}`);

  // Create super admin user
  const superAdminHash = await bcrypt.hash("admin123", 12);
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@dilancafe.com",
      passwordHash: superAdminHash,
      role: "SUPER_ADMIN",
    },
  });

  // Create restaurant owner
  const ownerHash = await bcrypt.hash("owner123", 12);
  const owner = await prisma.user.create({
    data: {
      name: "Dilan Owner",
      email: "owner@dilancafe.com",
      passwordHash: ownerHash,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  });

  console.log(`✅ Created users: ${superAdmin.email}, ${owner.email}`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Hot Drinks",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Cold Drinks",
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Food",
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Desserts",
        sortOrder: 4,
        isActive: true,
      },
    }),
  ]);

  const [hotDrinks, coldDrinks, food, desserts] = categories;
  console.log(`✅ Created ${categories.length} categories`);

  // Create menu items
  const menuItems = [
    // Hot Drinks
    {
      restaurantId: restaurant.id,
      categoryId: hotDrinks.id,
      name: "Espresso",
      description: "Strong and rich single shot of espresso",
      priceIqd: 3000,
      sortOrder: 1,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: hotDrinks.id,
      name: "Cappuccino",
      description: "Espresso with steamed milk foam",
      priceIqd: 4000,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: hotDrinks.id,
      name: "Café Latte",
      description: "Smooth espresso with creamy steamed milk",
      priceIqd: 4500,
      sortOrder: 3,
      isAvailable: true,
      isFeatured: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: hotDrinks.id,
      name: "Kurdish Chai",
      description: "Traditional Kurdish black tea",
      priceIqd: 2000,
      sortOrder: 4,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: hotDrinks.id,
      name: "Chai Latte",
      description: "Spiced chai with steamed milk and cinnamon",
      priceIqd: 4500,
      sortOrder: 5,
      isAvailable: true,
    },
    // Cold Drinks
    {
      restaurantId: restaurant.id,
      categoryId: coldDrinks.id,
      name: "Cold Brew",
      description: "Slow-steeped cold brew coffee served over ice",
      priceIqd: 5000,
      sortOrder: 1,
      isAvailable: true,
      isFeatured: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: coldDrinks.id,
      name: "Iced Latte",
      description: "Chilled espresso with cold milk over ice",
      priceIqd: 5000,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: coldDrinks.id,
      name: "Frappé",
      description: "Blended iced coffee with cream topping",
      priceIqd: 5500,
      sortOrder: 3,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: coldDrinks.id,
      name: "Fresh Juice",
      description: "Freshly squeezed seasonal fruit juice",
      priceIqd: 4000,
      sortOrder: 4,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: coldDrinks.id,
      name: "Smoothie Bowl",
      description: "Mixed berry smoothie with granola topping",
      priceIqd: 6000,
      sortOrder: 5,
      isAvailable: false,
    },
    // Food
    {
      restaurantId: restaurant.id,
      categoryId: food.id,
      name: "Club Sandwich",
      description: "Triple-decker with chicken, cheese, and vegetables",
      priceIqd: 8000,
      sortOrder: 1,
      isAvailable: true,
      isFeatured: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: food.id,
      name: "Butter Croissant",
      description: "Flaky, buttery French-style croissant",
      priceIqd: 4500,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: food.id,
      name: "Avocado Toast",
      description: "Sourdough toast with smashed avocado and poached egg",
      priceIqd: 8500,
      sortOrder: 3,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: food.id,
      name: "Eggs Benedict",
      description: "Classic eggs benedict with hollandaise sauce",
      priceIqd: 9000,
      sortOrder: 4,
      isAvailable: true,
    },
    // Desserts
    {
      restaurantId: restaurant.id,
      categoryId: desserts.id,
      name: "Tiramisu",
      description: "Classic Italian tiramisu with mascarpone and espresso",
      priceIqd: 6000,
      sortOrder: 1,
      isAvailable: true,
      isFeatured: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: desserts.id,
      name: "New York Cheesecake",
      description: "Creamy baked cheesecake with berry compote",
      priceIqd: 5500,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: desserts.id,
      name: "Baklava",
      description: "Traditional Kurdish baklava with honey and pistachios",
      priceIqd: 4000,
      sortOrder: 3,
      isAvailable: true,
    },
    {
      restaurantId: restaurant.id,
      categoryId: desserts.id,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center, served with ice cream",
      priceIqd: 6500,
      sortOrder: 4,
      isAvailable: true,
    },
  ];

  await prisma.menuItem.createMany({ data: menuItems });
  console.log(`✅ Created ${menuItems.length} menu items`);

  // Create opening hours
  const openingHours = [
    { dayOfWeek: 0, openTime: "08:00", closeTime: "23:00", isClosed: false }, // Sunday
    { dayOfWeek: 1, openTime: "08:00", closeTime: "23:00", isClosed: false }, // Monday
    { dayOfWeek: 2, openTime: "08:00", closeTime: "23:00", isClosed: false }, // Tuesday
    { dayOfWeek: 3, openTime: "08:00", closeTime: "23:00", isClosed: false }, // Wednesday
    { dayOfWeek: 4, openTime: "08:00", closeTime: "23:00", isClosed: false }, // Thursday
    { dayOfWeek: 5, openTime: null, closeTime: null, isClosed: true },        // Friday - closed
    { dayOfWeek: 6, openTime: "10:00", closeTime: "23:00", isClosed: false }, // Saturday
  ];

  await prisma.openingHour.createMany({
    data: openingHours.map((h) => ({ ...h, restaurantId: restaurant.id })),
  });
  console.log(`✅ Created opening hours`);

  // Create a demo offer
  const now = new Date();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.offer.create({
    data: {
      restaurantId: restaurant.id,
      title: "Weekly Special: Latte + Croissant",
      description: "Enjoy our café latte paired with a warm butter croissant at a special price. Available all week!",
      priceIqd: 7500,
      isActive: true,
      startsAt: now,
      endsAt: endDate,
    },
  });
  console.log(`✅ Created demo offer`);

  // Create QR code record
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await prisma.qrCode.create({
    data: {
      restaurantId: restaurant.id,
      publicUrl: `${appUrl}/r/${restaurant.slug}`,
    },
  });
  console.log(`✅ Created QR code record`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nDemo credentials:");
  console.log(`  Super Admin: admin@dilancafe.com / admin123`);
  console.log(`  Owner:       owner@dilancafe.com / owner123`);
  console.log(`\nPublic menu: ${appUrl}/r/dilan-cafe`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

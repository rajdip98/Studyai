import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    [
      { slug: "bone-care", name: "Bone Care" },
      { slug: "womens-care", name: "Women's Care" },
      { slug: "diabetes", name: "Diabetes" },
      { slug: "digestion", name: "Digestion" },
      { slug: "heart-care", name: "Heart Care" },
      { slug: "immunity", name: "Immunity" },
    ].map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }),
    ),
  );

  const boneCare = categories.find((c) => c.slug === "bone-care")!;
  const womensCare = categories.find((c) => c.slug === "womens-care")!;

  await prisma.product.upsert({
    where: { slug: "prakriti-bone-relief" },
    update: {},
    create: {
      slug: "prakriti-bone-relief",
      name: "Prakriti Bone Relief",
      subtitle: "Ortho Care — Supports Stronger Bones & Joints",
      description:
        "Ancient Ayurvedic herbology engineered for modern joint vitality. Clinically inspired whole-herb bio-actives targeted to alleviate joint inflammation, support mobility, and nourish structural bone density naturally.",
      images: ["/assets/products/bone-relief-1.jpg"],
      priceInPaise: 99900,
      mrpInPaise: 139900,
      stockQuantity: 500,
      sku: "PHC-BONE-60",
      isBestseller: true,
      tags: ["100% Ayurvedic", "Joint Pain Relief"],
      ingredients: ["Shallaki", "Ashwagandha", "Guggul"],
      categoryId: boneCare.id,
      ratingAverage: 4.4,
      ratingCount: 508,
    },
  });

  await prisma.product.upsert({
    where: { slug: "prakriti-divyasakhi" },
    update: {},
    create: {
      slug: "prakriti-divyasakhi",
      name: "Prakriti Divyasakhi",
      subtitle: "Happy Woman — Natural Hormone & Cycle Support",
      description:
        "A time-tested clinical formulation supporting hormonal balance and cycle wellness with standardized potent herbal extracts.",
      images: ["/assets/products/divyasakhi-1.jpg"],
      priceInPaise: 99900,
      mrpInPaise: 139900,
      stockQuantity: 500,
      sku: "PHC-DIVY-60",
      isBestseller: true,
      tags: ["100% Ayurvedic"],
      ingredients: ["Shatavari", "Lodhra"],
      categoryId: womensCare.id,
      ratingAverage: 4.3,
      ratingCount: 220,
    },
  });

  const adminEmail = "admin@prakritihealthcare.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!12345";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Prakriti Admin",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      passwordHash: await argon2.hash(adminPassword, { type: argon2.argon2id }),
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete. Admin login:", adminEmail, "(password from SEED_ADMIN_PASSWORD env or default)");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

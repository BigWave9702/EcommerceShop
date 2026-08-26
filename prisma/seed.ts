/**
 * Seeds MongoDB (Atlas or local) with sample data for the whole platform:
 * an admin account, a demo buyer (with address + UserAnalytics), fashion
 * sellers/shops/products/discount codes, product images, ProductAnalytics,
 * shopReviews, and a sample buyer<->seller chat (conversationGroup +
 * participants + messages). Also seeds the site_config category list used
 * by the "Create Product" category/subcategory dropdowns.
 *
 * Usage:
 *   npx prisma db seed
 *
 * Safe to re-run: uses upsert / existence checks on unique-ish keys
 * (email, slug, discountCode, userId+shopsId, conversation participants...)
 * instead of blind create, so running it twice won't create duplicates.
 *
 * Note: the `images` model has optional-but-unique `userId`/`shopId` fields,
 * and `shops` has an optional-but-unique `imagesId` field. MongoDB does not
 * make unique indexes on optional fields sparse by default, so once more
 * than one document naturally omits that field this seed (and the real
 * "create product" flow) fails with a P2002 unique constraint error. If you
 * hit that, drop and recreate those 3 indexes in Atlas with "unique" AND
 * "sparse" both enabled.
 */
import bcrypt from "bcryptjs";
// relative import (not the "@packages/*" alias) so this file runs directly
// under ts-node without needing tsconfig path resolution.
import prisma from "../packages/libs/prisma";

const CATEGORIES = ["Fashion"];

const SUB_CATEGORIES: Record<string, string[]> = {
  Fashion: ["Men", "Women", "Kids", "Footwear", "Accessories"],
};

// Real product photos, already uploaded to this project's own ImageKit
// account under /products (originally sourced from Pexels, free to use).
const PRODUCT_IMAGES: Record<string, { fileId: string; url: string }> = {
  "oversized-fleece-hoodie": {
    fileId: "6a8e9b395c7cd75eb8bbaf65",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/oversized-fleece-hoodie_6nN6TFEOG.jpg",
  },
  "cargo-utility-joggers": {
    fileId: "6a8e9b3a5c7cd75eb8bbb31d",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/cargo-utility-joggers_HXmi-2AE8.jpg",
  },
  "graphic-print-tee": {
    fileId: "6a8e9b3c5c7cd75eb8bbb995",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/graphic-print-tee_4LKTvYZwg.jpg",
  },
  "end-of-season-bomber-jacket": {
    fileId: "6a8e9b3e5c7cd75eb8bbcab0",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/end-of-season-bomber-jacket_yO2b9ip2N.jpg",
  },
  "floral-summer-dress": {
    fileId: "6a8e9b3f5c7cd75eb8bbd191",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/floral-summer-dress_xAAF9gPE0.jpg",
  },
  "silk-wrap-blouse": {
    fileId: "6a8e9b415c7cd75eb8bbd4fa",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/silk-wrap-blouse_9mpVaso2d.jpg",
  },
  "pleated-midi-skirt": {
    fileId: "6a8e9b425c7cd75eb8bbd932",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/pleated-midi-skirt_lv_h7_kPB.jpg",
  },
  "autumn-trench-coat": {
    fileId: "6a8e9b445c7cd75eb8bbdc55",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/autumn-trench-coat__Zlf0fEoY.jpg",
  },
  "classic-canvas-sneakers": {
    fileId: "6a8e9b455c7cd75eb8bbe108",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/classic-canvas-sneakers_d9a0buM-v.jpg",
  },
  "genuine-leather-belt": {
    fileId: "6a8e9b465c7cd75eb8bbe578",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/genuine-leather-belt_nPDdh3KOb.jpg",
  },
  "crossbody-canvas-bag": {
    fileId: "6a8e9b485c7cd75eb8bbebff",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/crossbody-canvas-bag_E3YvacaHL.jpg",
  },
  "chelsea-leather-boots": {
    fileId: "6a8e9b495c7cd75eb8bbf0a3",
    url: "https://ik.imagekit.io/bigwavehaibuithe/products/chelsea-leather-boots_0Pxts2Nnc.jpg",
  },
};

interface SeedProduct {
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  brand: string;
  colors: string[];
  sizes: string[];
  stock: number;
  regular_price: number;
  sale_price: number;
  tags: string[];
  // when both are set, this product also shows up under "Top Offers" (an
  // Event is just a product with a starting_date/ending_date, per schema)
  starting_date?: string;
  ending_date?: string;
}

interface SeedShop {
  seller: {
    name: string;
    email: string;
    phone_number: string;
    country: string;
  };
  shop: {
    name: string;
    bio: string;
    category: string;
    address: string;
    opening_hours: string;
  };
  discountCodes: { public_name: string; discountCode: string; discountValue: number }[];
  products: SeedProduct[];
}

const SELLERS: SeedShop[] = [
  {
    seller: {
      name: "Hai Bui",
      email: "buihaibq9702@gmail.com",
      phone_number: "0900000001",
      country: "Vietnam",
    },
    shop: {
      name: "Hai's Streetwear Co.",
      bio: "Urban streetwear essentials for men — hoodies, joggers and tees.",
      category: "Fashion",
      address: "123 Nguyen Trai, Ha Noi",
      opening_hours: "Mon-Sat 9am-6pm",
    },
    discountCodes: [
      { public_name: "Welcome 10%", discountCode: "WELCOME10", discountValue: 10 },
      { public_name: "Flash 50k", discountCode: "FLASH50K", discountValue: 50 },
    ],
    products: [
      {
        title: "Oversized Fleece Hoodie",
        slug: "oversized-fleece-hoodie",
        category: "Fashion",
        subCategory: "Men",
        short_description: "Heavyweight fleece hoodie with a relaxed, oversized fit.",
        detailed_description:
          "Cut from heavyweight brushed fleece, this oversized hoodie keeps its shape wash after wash while staying soft against the skin. A kangaroo pocket and adjustable drawcord hood round out an everyday streetwear staple. ".repeat(
            4
          ),
        brand: "Hai Streetwear",
        colors: ["#000000", "#6b7280", "#ffffff"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        stock: 80,
        regular_price: 45,
        sale_price: 35,
        tags: ["hoodie", "streetwear", "men"],
      },
      {
        title: "Cargo Utility Joggers",
        slug: "cargo-utility-joggers",
        category: "Fashion",
        subCategory: "Men",
        short_description: "Tapered cargo joggers with multiple utility pockets.",
        detailed_description:
          "Durable cotton-blend joggers with a tapered leg, elastic cuffs, and six utility pockets for everyday carry — built for both comfort and function. ".repeat(
            4
          ),
        brand: "Hai Streetwear",
        colors: ["#000000", "#4b5320"],
        sizes: ["S", "M", "L", "XL"],
        stock: 65,
        regular_price: 39,
        sale_price: 32,
        tags: ["joggers", "cargo", "men"],
      },
      {
        title: "Graphic Print Tee",
        slug: "graphic-print-tee",
        category: "Fashion",
        subCategory: "Men",
        short_description: "100% cotton tee with an original screen-printed graphic.",
        detailed_description:
          "A boxy-fit tee cut from 100% combed cotton and finished with a hand-drawn screen-printed graphic that won't crack or fade after repeated washes. ".repeat(
            4
          ),
        brand: "Hai Streetwear",
        colors: ["#000000", "#ffffff", "#dc2626"],
        sizes: ["S", "M", "L", "XL"],
        stock: 120,
        regular_price: 19,
        sale_price: 15,
        tags: ["tee", "graphic", "streetwear"],
      },
      {
        title: "End of Season Bomber Jacket",
        slug: "end-of-season-bomber-jacket",
        category: "Fashion",
        subCategory: "Men",
        short_description: "Limited-time flash sale on our signature bomber jacket.",
        detailed_description:
          "Water-resistant shell, ribbed cuffs and hem, and a quilted lining make this bomber a cold-weather staple — on flash sale for a limited time only. ".repeat(
            4
          ),
        brand: "Hai Streetwear",
        colors: ["#000000", "#4b5320"],
        sizes: ["S", "M", "L", "XL"],
        stock: 30,
        regular_price: 89,
        sale_price: 59,
        tags: ["jacket", "bomber", "flash-sale"],
        starting_date: "2026-08-01",
        ending_date: "2026-09-30",
      },
    ],
  },
  {
    seller: {
      name: "Mai Tran",
      email: "seller.mai@example.com",
      phone_number: "0900000002",
      country: "Vietnam",
    },
    shop: {
      name: "Mai's Fashion House",
      bio: "Everyday fashion for women.",
      category: "Fashion",
      address: "45 Le Loi, Ho Chi Minh City",
      opening_hours: "Daily 8am-9pm",
    },
    discountCodes: [
      { public_name: "New Season", discountCode: "SEASON15", discountValue: 15 },
    ],
    products: [
      {
        title: "Floral Summer Dress",
        slug: "floral-summer-dress",
        category: "Fashion",
        subCategory: "Women",
        short_description: "Lightweight floral dress for warm days.",
        detailed_description:
          "Breathable floral-print dress with a flattering A-line cut, ideal for summer outings. ".repeat(5),
        brand: "Bloom",
        colors: ["#f472b6", "#ffffff"],
        sizes: ["XS", "S", "M", "L"],
        stock: 45,
        regular_price: 39,
        sale_price: 29,
        tags: ["dress", "summer", "women"],
      },
      {
        title: "Silk Wrap Blouse",
        slug: "silk-wrap-blouse",
        category: "Fashion",
        subCategory: "Women",
        short_description: "Elegant wrap blouse in soft satin-touch fabric.",
        detailed_description:
          "A soft, satin-touch wrap blouse with a flattering V-neckline and tie waist — dresses up easily for the office or a night out. ".repeat(
            5
          ),
        brand: "Bloom",
        colors: ["#fef3c7", "#111827"],
        sizes: ["XS", "S", "M", "L"],
        stock: 38,
        regular_price: 49,
        sale_price: 39,
        tags: ["blouse", "silk", "women"],
      },
      {
        title: "Pleated Midi Skirt",
        slug: "pleated-midi-skirt",
        category: "Fashion",
        subCategory: "Women",
        short_description: "High-waisted pleated skirt in a flowy midi length.",
        detailed_description:
          "A high-waisted pleated midi skirt that moves beautifully with every step — pairs easily with a blouse or a fitted tee. ".repeat(
            5
          ),
        brand: "Bloom",
        colors: ["#000000", "#6b7280", "#f472b6"],
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 42,
        regular_price: 35,
        sale_price: 27,
        tags: ["skirt", "midi", "women"],
      },
      {
        title: "Autumn Trench Coat",
        slug: "autumn-trench-coat",
        category: "Fashion",
        subCategory: "Women",
        short_description: "Classic belted trench coat, on sale for the new season.",
        detailed_description:
          "A timeless double-breasted trench coat with a belted waist and classic lapel — this season's must-have, on sale for a limited time. ".repeat(
            4
          ),
        brand: "Bloom",
        colors: ["#d4c5a3", "#000000"],
        sizes: ["XS", "S", "M", "L"],
        stock: 22,
        regular_price: 119,
        sale_price: 79,
        tags: ["coat", "trench", "flash-sale"],
        starting_date: "2026-08-10",
        ending_date: "2026-10-10",
      },
    ],
  },
  {
    seller: {
      name: "Duc Pham",
      email: "seller.duc@example.com",
      phone_number: "0900000003",
      country: "Vietnam",
    },
    shop: {
      name: "Duc Footwear & Accessories",
      bio: "Shoes, bags and accessories to complete every outfit.",
      category: "Fashion",
      address: "9 Tran Phu, Da Nang",
      opening_hours: "Mon-Sun 9am-8pm",
    },
    discountCodes: [
      { public_name: "Step Up Sale", discountCode: "STEPUP20", discountValue: 20 },
    ],
    products: [
      {
        title: "Classic Canvas Sneakers",
        slug: "classic-canvas-sneakers",
        category: "Fashion",
        subCategory: "Footwear",
        short_description: "Everyday low-top canvas sneakers with a rubber sole.",
        detailed_description:
          "Durable canvas upper, cushioned insole, and a grippy rubber sole make these low-top sneakers an everyday go-to for any casual outfit. ".repeat(
            5
          ),
        brand: "Duc Footwear",
        colors: ["#ffffff", "#000000", "#1e3a8a"],
        sizes: ["S", "M", "L", "XL"],
        stock: 70,
        regular_price: 45,
        sale_price: 35,
        tags: ["sneakers", "canvas", "footwear"],
      },
      {
        title: "Genuine Leather Belt",
        slug: "genuine-leather-belt",
        category: "Fashion",
        subCategory: "Accessories",
        short_description: "Full-grain leather belt with a brushed metal buckle.",
        detailed_description:
          "Handcrafted from full-grain leather that develops a natural patina over time, finished with a brushed metal buckle. ".repeat(
            5
          ),
        brand: "Duc Footwear",
        colors: ["#3b2412", "#000000"],
        sizes: [],
        stock: 55,
        regular_price: 29,
        sale_price: 22,
        tags: ["belt", "leather", "accessories"],
      },
      {
        title: "Crossbody Canvas Bag",
        slug: "crossbody-canvas-bag",
        category: "Fashion",
        subCategory: "Accessories",
        short_description: "Compact crossbody bag with adjustable strap.",
        detailed_description:
          "A compact, water-resistant canvas crossbody bag with an adjustable strap and enough room for your daily essentials. ".repeat(
            5
          ),
        brand: "Duc Footwear",
        colors: ["#4b5320", "#000000", "#78350f"],
        sizes: [],
        stock: 48,
        regular_price: 32,
        sale_price: 25,
        tags: ["bag", "crossbody", "accessories"],
      },
      {
        title: "Chelsea Leather Boots",
        slug: "chelsea-leather-boots",
        category: "Fashion",
        subCategory: "Footwear",
        short_description: "Premium leather Chelsea boots, on sale this month only.",
        detailed_description:
          "Hand-finished full-grain leather Chelsea boots with an elastic side panel and a durable rubber outsole — on sale for a limited time. ".repeat(
            4
          ),
        brand: "Duc Footwear",
        colors: ["#3b2412", "#000000"],
        sizes: ["S", "M", "L", "XL"],
        stock: 25,
        regular_price: 99,
        sale_price: 69,
        tags: ["boots", "leather", "flash-sale"],
        starting_date: "2026-08-15",
        ending_date: "2026-09-15",
      },
    ],
  },
];

const DEMO_BUYER = {
  name: "Hai Bui",
  email: "haibuiecommerce@gmail.com",
  password: "Password123!",
};

const ADMIN_USER = {
  name: "Hai Bui (Admin)",
  email: "admin@ecommerceshop.local",
  password: "AdminPass123!",
};

const SAMPLE_REVIEWS = [
  "Great quality and fast shipping, will order again!",
  "Exactly as described, very happy with this shop.",
  "Good product overall, packaging could be better.",
];

async function seedSiteConfig() {
  const existing = await prisma.site_config.findFirst();
  if (existing) {
    await prisma.site_config.update({
      where: { id: existing.id },
      data: { categories: CATEGORIES, subCategories: SUB_CATEGORIES },
    });
  } else {
    await prisma.site_config.create({
      data: { categories: CATEGORIES, subCategories: SUB_CATEGORIES },
    });
  }
  console.log(`✔ site_config seeded (${CATEGORIES.length} categories)`);
}

async function seedAdmin() {
  const hashedPassword = bcrypt.hashSync(ADMIN_USER.password, 10);
  await prisma.users.upsert({
    where: { email: ADMIN_USER.email },
    update: { role: "admin" },
    create: {
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log(`✔ admin ready: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
}

async function seedDemoBuyer() {
  const hashedPassword = bcrypt.hashSync(DEMO_BUYER.password, 10);
  const buyer = await prisma.users.upsert({
    where: { email: DEMO_BUYER.email },
    update: {},
    create: {
      name: DEMO_BUYER.name,
      email: DEMO_BUYER.email,
      password: hashedPassword,
      role: "user",
    },
  });

  const existingAddress = await prisma.address.findFirst({
    where: { userId: buyer.id },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: buyer.id,
        label: "Home",
        name: buyer.name,
        street: "22 Hai Ba Trung",
        city: "Ha Noi",
        zip: "100000",
        country: "Vietnam",
        isDefault: true,
      },
    });
  }

  await prisma.userAnalytics.upsert({
    where: { userId: buyer.id },
    update: {},
    create: {
      userId: buyer.id,
      country: "Vietnam",
      city: "Ha Noi",
      device: "desktop",
      lastVisited: new Date(),
      actions: [{ type: "visit", page: "/", at: new Date().toISOString() }],
    },
  });

  console.log(`✔ demo buyer ready: ${DEMO_BUYER.email} / ${DEMO_BUYER.password}`);
  return buyer;
}

async function seedShop(entry: SeedShop) {
  const hashedPassword = bcrypt.hashSync("Password123!", 10);

  const seller = await prisma.sellers.upsert({
    where: { email: entry.seller.email },
    update: {},
    create: { ...entry.seller, password: hashedPassword },
  });

  const shop = await prisma.shops.upsert({
    where: { sellerId: seller.id },
    update: {},
    create: { ...entry.shop, sellerId: seller.id },
  });

  for (const code of entry.discountCodes) {
    await prisma.discount_codes.upsert({
      where: { discountCode: code.discountCode },
      update: {},
      create: {
        public_name: code.public_name,
        discountCode: code.discountCode,
        discountType: "percentage",
        discountValue: code.discountValue,
        sellerId: seller.id,
      },
    });
  }

  const createdProducts: { id: string; shopId: string }[] = [];

  for (const product of entry.products) {
    const existingProduct = await prisma.products.findUnique({
      where: { slug: product.slug },
      include: { images: true },
    });
    const image = PRODUCT_IMAGES[product.slug];
    if (!image) {
      throw new Error(`No ImageKit image mapped for product slug "${product.slug}"`);
    }

    if (existingProduct) {
      const currentImageUrl = existingProduct.images[0]?.url;
      if (currentImageUrl !== image.url) {
        // swap out a stale/placeholder image for the real product photo
        await prisma.images.deleteMany({
          where: { productsId: existingProduct.id },
        });
        await prisma.products.update({
          where: { id: existingProduct.id },
          data: {
            images: {
              create: [{ file_id: image.fileId, url: image.url }],
            },
          },
        });
      }
      createdProducts.push({ id: existingProduct.id, shopId: existingProduct.shopId });
      continue;
    }

    const created = await prisma.products.create({
      data: {
        title: product.title,
        slug: product.slug,
        category: product.category,
        subCategory: product.subCategory,
        short_description: product.short_description,
        detailed_description: product.detailed_description,
        brand: product.brand,
        colors: product.colors,
        sizes: product.sizes,
        stock: product.stock,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        tags: product.tags,
        warranty: "30-day free returns",
        cashOnDelivery: "yes",
        discount_codes: [],
        custom_properties: {},
        custom_specifications: [],
        shopId: shop.id,
        starting_date: product.starting_date ? new Date(product.starting_date) : null,
        ending_date: product.ending_date ? new Date(product.ending_date) : null,
        images: {
          create: [{ file_id: image.fileId, url: image.url }],
        },
      },
    });
    createdProducts.push({ id: created.id, shopId: created.shopId });
  }

  console.log(
    `✔ ${entry.shop.name}: seller + shop + ${entry.discountCodes.length} discount code(s) + ${entry.products.length} product(s)`
  );

  return { seller, shop, products: createdProducts };
}

async function seedShopReviews(buyerId: string, shops: { id: string; name: string }[]) {
  let created = 0;
  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    const existing = await prisma.shopReviews.findFirst({
      where: { userId: buyerId, shopsId: shop.id },
    });
    if (existing) continue;

    await prisma.shopReviews.create({
      data: {
        userId: buyerId,
        shopsId: shop.id,
        rating: 4 + (i % 2 === 0 ? 1 : 0),
        reviews: SAMPLE_REVIEWS[i % SAMPLE_REVIEWS.length],
      },
    });
    created++;
  }
  console.log(`✔ shopReviews seeded (${created} new)`);
}

async function seedProductAnalytics(products: { id: string; shopId: string }[]) {
  for (const product of products) {
    await prisma.productAnalytics.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        shopId: product.shopId,
        views: Math.floor(Math.random() * 500) + 50,
        cartAdds: Math.floor(Math.random() * 50) + 5,
        wishListAdds: Math.floor(Math.random() * 30) + 2,
        purchases: Math.floor(Math.random() * 20),
        lastViewedAt: new Date(),
      },
    });
  }
  console.log(`✔ ProductAnalytics seeded (${products.length} product(s))`);
}

async function seedChat(buyerId: string, sellerId: string, shopName: string) {
  let conversation = await prisma.conversationGroup.findFirst({
    where: { isGroup: false, participantIds: { hasEvery: [buyerId, sellerId] } },
  });

  if (!conversation) {
    conversation = await prisma.conversationGroup.create({
      data: { isGroup: false, creatorId: buyerId, participantIds: [buyerId, sellerId] },
    });
    await prisma.participant.createMany({
      data: [
        { conversationId: conversation.id, userId: buyerId },
        { conversationId: conversation.id, sellerId },
      ],
    });
  }

  const existingMessage = await prisma.message.findFirst({
    where: { conversationId: conversation.id },
  });
  if (!existingMessage) {
    const now = Date.now();
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        senderType: "user",
        content: `Hi! Do you have this in stock at ${shopName}?`,
        createdAt: new Date(now),
      },
    });
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sellerId,
        senderType: "seller",
        content: "Hi, yes it's in stock! Let me know which size you need.",
        createdAt: new Date(now + 1000),
      },
    });
  }

  console.log(`✔ chat conversation seeded (buyer <-> ${shopName})`);
}

async function main() {
  console.log("Seeding database...\n");
  await seedSiteConfig();
  await seedAdmin();
  const buyer = await seedDemoBuyer();

  const seededShops: { seller: { id: string }; shop: { id: string; name: string }; products: { id: string; shopId: string }[] }[] = [];
  for (const entry of SELLERS) {
    const result = await seedShop(entry);
    seededShops.push(result);
  }

  await seedShopReviews(
    buyer.id,
    seededShops.map((s) => ({ id: s.shop.id, name: s.shop.name }))
  );

  const allProducts = seededShops.flatMap((s) => s.products);
  await seedProductAnalytics(allProducts);

  const firstShop = seededShops[0];
  if (firstShop) {
    await seedChat(buyer.id, firstShop.seller.id, firstShop.shop.name);
  }

  console.log("\nDone.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

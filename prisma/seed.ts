import { PrismaClient, LeadStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await db.conversation.deleteMany();
  await db.lead.deleteMany();
  await db.fAQ.deleteMany();
  await db.product.deleteMany();
  await db.whatsAppConfig.deleteMany();
  await db.businessProfile.deleteMany();
  await db.user.deleteMany();

  // ── User ──────────────────────────────────────────────────────────────
  const passwordHash = bcrypt.hashSync("password123", 10);
  const user = await db.user.create({
    data: {
      fullName: "Adeola Johnson",
      email: "adeola@fashionhouse.com",
      businessName: "Adeola Ready-to-Wear",
      passwordHash,
    },
  });
  console.log(`  ✓ Created user: ${user.email} (password: password123)`);

  // ── Business Profile ──────────────────────────────────────────────────
  await db.businessProfile.create({
    data: {
      userId: user.id,
      description:
        "Adeola Ready-to-Wear is a Lagos-based fashion boutique specializing in premium Ankara, lace, and casual wear for men and women.",
      deliveryPolicy:
        "Delivery within Lagos is ₦1,500 (1-2 business days). Outside Lagos is ₦2,500 (3-5 business days) via GIG Logistics. Free delivery on orders above ₦50,000.",
      paymentPolicy:
        "We accept bank transfers, Opay, and card payments. GTBank — 0123456789 — Adeola Ready-to-Wear Ltd. Send payment receipt via WhatsApp for confirmation.",
      returnPolicy:
        "Returns accepted within 48 hours of delivery for manufacturing defects only. Items must be unworn with tags attached. Store credit issued — no cash refunds.",
    },
  });
  console.log("  ✓ Created business profile");

  // ── Products ──────────────────────────────────────────────────────────
  const products = [
    {
      productName: "Premium Ankara Set",
      description:
        "A stunning three-piece Ankara set featuring a tailored blazer, matching trousers, and a crop top. Perfect for weddings and formal events.",
      price: 4500000, // ₦45,000 in kobo
      colorOptions: ["Navy Blue", "Burgundy", "Forest Green"],
      sizeOptions: ["S", "M", "L", "XL"],
    },
    {
      productName: "Classic Lace Gown",
      description:
        "Elegant floor-length lace gown with intricate floral patterns and a flared silhouette. Ideal for parties and evening events.",
      price: 6500000,
      colorOptions: ["White", "Champagne", "Blush Pink", "Ivory"],
      sizeOptions: ["M", "L", "XL", "XXL"],
    },
    {
      productName: "Casual Denim Jacket",
      description:
        "Modern oversized denim jacket with distressed details and a comfortable cotton blend. Great for everyday street style.",
      price: 2500000,
      colorOptions: ["Light Blue", "Dark Blue", "Black"],
      sizeOptions: ["S", "M", "L", "XL", "XXL"],
    },
    {
      productName: "Beaded Sandals",
      description:
        "Handmade leather sandals with colorful African beadwork. Comfortable sole with adjustable strap.",
      price: 1200000,
      colorOptions: ["Gold", "Brown", "Black"],
      sizeOptions: ["38", "39", "40", "41", "42"],
    },
    {
      productName: "Men's Dashiki Shirt",
      description:
        "Breathable cotton Dashiki with embroidered neckline. Available in vibrant traditional prints. Perfect for casual or semi-formal occasions.",
      price: 1800000,
      colorOptions: ["Blue", "Green", "Red", "Yellow"],
      sizeOptions: ["M", "L", "XL", "XXL"],
    },
    {
      productName: "Silk Headwrap (Gele)",
      description:
        "Premium silk gele with pre-tied structured design. No styling needed — just place and go. Secured with hidden pins.",
      price: 800000,
      colorOptions: ["Gold", "Silver", "Burgundy", "Royal Blue", "Emerald"],
      sizeOptions: ["One Size"],
    },
  ];

  for (const p of products) {
    await db.product.create({
      data: { ...p, userId: user.id, inStock: true },
    });
  }
  console.log(`  ✓ Created ${products.length} products`);

  // ── FAQs ──────────────────────────────────────────────────────────────
  const faqs = [
    {
      question: "How long does delivery take?",
      answer:
        "Lagos deliveries arrive within 1-2 business days. Outside Lagos takes 3-5 business days via GIG Logistics.",
    },
    {
      question: "Do you deliver outside Nigeria?",
      answer:
        "Currently we only deliver within Nigeria. International delivery is coming soon.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept bank transfers, Opay, and online card payments. Our GTBank account number is 0123456789 (Adeola Ready-to-Wear Ltd).",
    },
    {
      question: "Can I return or exchange an item?",
      answer:
        "Returns are accepted within 48 hours of delivery for manufacturing defects only. Items must be unworn with tags. Store credit is issued for approved returns.",
    },
    {
      question: "Do you offer custom sizing?",
      answer:
        "Yes! We offer made-to-measure for select items. Contact us with your measurements and we'll provide a quote.",
    },
    {
      question: "How do I care for my Ankara fabric?",
      answer:
        "Hand wash in cold water with mild detergent. Do not bleach. Iron on medium heat. Avoid wringing to maintain the fabric quality.",
    },
  ];

  for (const f of faqs) {
    await db.fAQ.create({
      data: { ...f, userId: user.id },
    });
  }
  console.log(`  ✓ Created ${faqs.length} FAQs`);

  // ── WhatsApp Config ───────────────────────────────────────────────────
  await db.whatsAppConfig.create({
    data: {
      userId: user.id,
      accountSid: process.env.TWILIO_ACCOUNT_SID || "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      authToken: process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token",
      twilioPhoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886",
      connected: true,
    },
  });
  console.log("  ✓ Created WhatsApp config");

  // ── Sample Leads ──────────────────────────────────────────────────────
  const leads = [
    {
      customerName: "Chioma Obi",
      phoneNumber: "+2348023456789",
      productInterest: "Premium Ankara Set",
      leadStatus: LeadStatus.QUALIFIED,
    },
    {
      customerName: "Fatima Usman",
      phoneNumber: "+2348034567890",
      productInterest: "Classic Lace Gown",
      leadStatus: LeadStatus.CONVERTED,
    },
    {
      customerName: null,
      phoneNumber: "+2348098765432",
      productInterest: "Men's Dashiki Shirt",
      leadStatus: LeadStatus.CONTACTED,
    },
    {
      customerName: "Blessing Nwosu",
      phoneNumber: "+2348056789012",
      productInterest: "Beaded Sandals",
      leadStatus: LeadStatus.NEW,
    },
    {
      customerName: "Tunde Balogun",
      phoneNumber: "+2348076543210",
      productInterest: "Casual Denim Jacket",
      leadStatus: LeadStatus.LOST,
    },
  ];

  for (const l of leads) {
    await db.lead.create({
      data: { ...l, userId: user.id },
    });
  }
  console.log(`  ✓ Created ${leads.length} leads`);

  // ── Sample Conversations ──────────────────────────────────────────────
  const conversations = [
    {
      customerPhone: "+2348023456789",
      conversationHistory: [
        {
          role: "customer",
          content: "Hi! Do you have the Ankara set in size L?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          role: "ai",
          content:
            "Yes we do! Our Premium Ankara Set is available in size L. It comes in Navy Blue, Burgundy, and Forest Green at ₦45,000. Which color catches your eye?",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          role: "customer",
          content: "Burgundy please! How do I pay?",
          timestamp: new Date(Date.now() - 3400000).toISOString(),
        },
        {
          role: "ai",
          content:
            "Great choice! You can pay via bank transfer to GTBank 0123456789 (Adeola Ready-to-Wear Ltd) or through Opay. Send your payment receipt and I'll confirm your order right away!",
          timestamp: new Date(Date.now() - 3300000).toISOString(),
        },
      ],
      aiConfidenceScore: 0.95,
      isEscalated: false,
    },
    {
      customerPhone: "+2348034567890",
      conversationHistory: [
        {
          role: "customer",
          content: "Hello, how much is the lace gown?",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          role: "ai",
          content:
            "Hello! Our Classic Lace Gown is ₦65,000 and available in White, Champagne, Blush Pink, and Ivory in sizes M to XXL. Would you like more details?",
          timestamp: new Date(Date.now() - 86300000).toISOString(),
        },
        {
          role: "customer",
          content: "Yes, what size is available in Champagne?",
          timestamp: new Date(Date.now() - 86200000).toISOString(),
        },
        {
          role: "vendor",
          content:
            "Hi Fatima! The Champagne lace gown is available in M, L, and XL. I have one in L reserved for you if you'd like to proceed?",
          timestamp: new Date(Date.now() - 86000000).toISOString(),
        },
      ],
      aiConfidenceScore: 0.95,
      isEscalated: false,
    },
  ];

  for (const c of conversations) {
    await db.conversation.create({
      data: { ...c, userId: user.id },
    });
  }
  console.log(`  ✓ Created ${conversations.length} conversations`);

  console.log("\n✅ Seed complete! Login with adeola@fashionhouse.com / password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

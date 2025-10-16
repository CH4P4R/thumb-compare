import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  console.log("✅ Created demo user:", user.email);

  // Create demo project
  const project = await prisma.project.upsert({
    where: { slug: "demo-project-123456" },
    update: {},
    create: {
      name: "Demo Project",
      slug: "demo-project-123456",
      regionCode: "TR",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  console.log("✅ Created demo project:", project.name);

  // Create demo competitor channels
  const competitor1 = await prisma.competitorChannel.create({
    data: {
      projectId: project.id,
      ytChannelId: "UCX6OQ3DkcsbYNE6H8uQQuVA", // MrBeast
      channelTitle: "MrBeast",
      addedBy: user.id,
    },
  });

  const competitor2 = await prisma.competitorChannel.create({
    data: {
      projectId: project.id,
      ytChannelId: "UCuAXFkgsw1L7xaCfnd5JJOw", // Rick Astley
      channelTitle: "Rick Astley",
      addedBy: user.id,
    },
  });

  console.log("✅ Created demo competitors");

  // Create plans
  const freePlan = await prisma.plan.upsert({
    where: { name: "free" },
    update: {},
    create: {
      name: "free",
      limits: {
        max_projects: 2,
        max_thumbnails: 20,
        max_competitors: 2,
        regions: ["TR"],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: "pro" },
    update: {},
    create: {
      name: "pro",
      limits: {
        max_projects: 999,
        max_thumbnails: 200,
        max_competitors: 10,
        regions: ["TR", "US", "GB"],
      },
    },
  });

  const teamPlan = await prisma.plan.upsert({
    where: { name: "team" },
    update: {},
    create: {
      name: "team",
      limits: {
        max_projects: 999,
        max_thumbnails: 999,
        max_competitors: 999,
        regions: ["TR", "US", "GB", "DE", "FR"],
      },
    },
  });

  console.log("✅ Created plans: free, pro, team");

  // Create subscription for demo user
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: freePlan.id,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log("✅ Created demo subscription");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const challengePlans = [
    {
      name: "Level 1 Challenge",
      description:
        "Entry-level evaluation with Rs.10 Lakh virtual capital and conservative risk limits.",
      accountSize: 1000000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 9999,
      durationDays: 30,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 80,
      level: 1,
      isActive: true,
    },
    {
      name: "Level 2 Challenge",
      description:
        "Intermediate evaluation with Rs.25 Lakh virtual capital and balanced risk targets.",
      accountSize: 2500000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 19999,
      durationDays: 45,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 85,
      level: 2,
      isActive: true,
    },
    {
      name: "Level 3 Challenge",
      description:
        "Advanced evaluation with Rs.50 Lakh virtual capital for experienced prop traders.",
      accountSize: 5000000,
      profitTargetPct: 8,
      maxLossPct: 5,
      dailyLossPct: 2,
      fee: 29999,
      durationDays: 60,
      allowedInstruments: ["Equities", "Futures", "Options"],
      profitSplit: 90,
      level: 3,
      isActive: true,
    },
  ];

  // Remove existing plans to keep seed idempotent in development.
  await prisma.challengePlan.deleteMany();

  await prisma.challengePlan.createMany({
    data: challengePlans,
  });
}

main()
  .catch((error) => {
    console.error("Error seeding challenge plans:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

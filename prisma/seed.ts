import { sites } from "./seeds/sites";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (const site of sites) {
    await prisma.site.create({
      data: site,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });

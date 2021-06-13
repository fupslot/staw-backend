// import { sites } from "./seeds/sites";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.site.create({
    data: {
      display_name: "local",
      alias: "local",
      oauthServers: {
        create: {
          name: "default",
          applications: {
            create: {
              client_id: "ZeacaeM0Ouy6ieceiv1xa2roo5mohch8",
              client_secret: "oojiebitaPhah3southikePeepaghah7xi5bi0iceeY1Inu7",
              redirect_uris: ["http://local.dev/callback"],
              grants: ["authorization_code"],
            },
          },
        },
      },
    },
  });
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });

import { createGravatarHash, randomAlphaDigit } from "../src/internal";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const local = await prisma.site.create({
    data: {
      display_name: "local",
      alias: "local",
      users: {
        create: {
          display_name: "john doe",
          username: "john.doe",
          first_name: "john",
          last_name: "doe",
          email: "john.doe@example.com",
          profile: {
            create: {
              job_title: "laymen",
              gravatar_avatar_hash: createGravatarHash("john.doe@example.com"),
            },
          },
        },
      },
    },
  });

  await prisma.oAuth2Server.create({
    data: {
      alias: "default",
      site_id: local.id,
      audience: "api://default",
      issuer_uri: "http://local.example.net/oauth2/default",
      description: "Default authorization server",
      scopes: {
        createMany: {
          data: [
            {
              value: "refresh_token",
              is_default: true,
              description: "This keep you signed in",
              display_name: "Refresh token",
            },
            {
              value: "openid",
              is_default: true,
              description: "Issue OIDC token",
              display_name: "openid",
            },
          ],
        },
      },
    },
  });

  await prisma.oAuth2Client.create({
    data: {
      client_id: randomAlphaDigit(24),
      client_secret: randomAlphaDigit(32),
      token_endpoint_auth_method: "client_secret_post",
      redirect_uris: ["http://local.dev/callback"],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_name: "local",
      site_id: local.id,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });

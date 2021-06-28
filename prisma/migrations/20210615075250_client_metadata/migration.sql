/*
  Warnings:

  - The primary key for the `OAuth2Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `OAuth2Server` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the `OAuth2Application` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `first_name` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alias` to the `OAuth2Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gravatar_avatar_hash` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `display_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GrantTypes" AS ENUM ('authorization_code', 'client_credentials', 'implicit', 'password', 'refresh_token');

-- CreateEnum
CREATE TYPE "TokenAuthMethod" AS ENUM ('none', 'client_secret_post', 'client_secret_basic');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('code', 'token');

-- DropForeignKey
ALTER TABLE "OAuth2Application" DROP CONSTRAINT "OAuth2Application_server_id_fkey";

-- DropIndex
DROP INDEX "Site.display_name_unique";

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "OAuth2Server" DROP CONSTRAINT "OAuth2Server_pkey",
DROP COLUMN "name",
ADD COLUMN     "alias" VARCHAR(50) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "OAuth2Server_id_seq";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "bio",
ADD COLUMN     "gravatar_avatar_hash" TEXT NOT NULL,
ADD COLUMN     "job_title" TEXT;

-- AlterTable
ALTER TABLE "Site" ALTER COLUMN "display_name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "account_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "account_locked_at" TIMESTAMP(3),
ADD COLUMN     "account_locked_reason" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "display_name" VARCHAR(200) NOT NULL,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "OAuth2Application";

-- CreateTable
CREATE TABLE "OAuth2Client" (
    "id" TEXT NOT NULL,
    "method" "AuthMethod" NOT NULL DEFAULT E'OIDC',
    "type" "AuthType" NOT NULL DEFAULT E'Web',
    "client_secret" VARCHAR(256) NOT NULL,
    "redirect_uris" TEXT[],
    "token_endpoint_auth_method" "TokenAuthMethod" NOT NULL DEFAULT E'client_secret_post',
    "grant_types" "GrantTypes"[],
    "response_types" "ResponseType"[],
    "client_name" TEXT NOT NULL,
    "client_uri" TEXT,
    "logo_uri" TEXT,
    "scope" TEXT,
    "contacts" TEXT[],
    "tos_uri" VARCHAR,
    "policy_uri" VARCHAR,
    "jwks_uri" TEXT,
    "jwks" JSONB,
    "software_id" TEXT NOT NULL,
    "software_version" TEXT NOT NULL DEFAULT E'v1.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "server_id" TEXT NOT NULL,
    "site_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User.site_id_email_index" ON "User"("site_id", "email");

-- CreateIndex
CREATE INDEX "User.site_id_username_index" ON "User"("site_id", "username");

-- CreateIndex
CREATE INDEX "OAuth2Server.site_id_alias_index" ON "OAuth2Server"("site_id", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "OAuth2Client.software_id_unique" ON "OAuth2Client"("software_id");

-- CreateIndex
CREATE INDEX "OAuth2Client.id_server_id_index" ON "OAuth2Client"("id", "server_id");

-- AddForeignKey
ALTER TABLE "OAuth2Client" ADD FOREIGN KEY ("server_id") REFERENCES "OAuth2Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Client" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

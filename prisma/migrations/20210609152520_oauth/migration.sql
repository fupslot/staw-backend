/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Web', 'Spa', 'Native');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('OIDC');

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_site_id_fkey";

-- DropTable
DROP TABLE "Client";

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "bio" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuth2Server" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "site_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuth2Application" (
    "id" SERIAL NOT NULL,
    "method" "AuthMethod" NOT NULL DEFAULT E'OIDC',
    "type" "AuthType" NOT NULL DEFAULT E'Web',
    "client_id" VARCHAR(256) NOT NULL,
    "client_secret" VARCHAR(256) NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "server_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_unique" ON "Profile"("user_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Server" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Application" ADD FOREIGN KEY ("server_id") REFERENCES "OAuth2Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

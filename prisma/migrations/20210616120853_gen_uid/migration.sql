-- FUNCTION: public.gen_uid(integer)

-- DROP FUNCTION public.gen_uid(integer);
CREATE OR REPLACE FUNCTION public.gen_uid(
	size integer DEFAULT 14)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN output;
  END;
$BODY$;

ALTER FUNCTION public.gen_uid(integer)
    OWNER TO postgres;

-- Enable 'pgcrypto' extention
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/*
  Warnings:

  - The values [Web,Spa,Native] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Invite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OAuth2Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `method` on the `OAuth2Client` table. All the data in the column will be lost.
  - You are about to drop the column `server_id` on the `OAuth2Client` table. All the data in the column will be lost.
  - The primary key for the `OAuth2Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Site` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('web', 'spa', 'native');
ALTER TABLE "OAuth2Client" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "OAuth2Client" ALTER COLUMN "type" TYPE "AuthType_new" USING ("type"::text::"AuthType_new");
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "AuthType_old";
ALTER TABLE "OAuth2Client" ALTER COLUMN "type" SET DEFAULT 'web';
COMMIT;

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_site_id_fkey";

-- DropForeignKey
ALTER TABLE "OAuth2Client" DROP CONSTRAINT "OAuth2Client_server_id_fkey";

-- DropForeignKey
ALTER TABLE "OAuth2Client" DROP CONSTRAINT "OAuth2Client_site_id_fkey";

-- DropForeignKey
ALTER TABLE "OAuth2Server" DROP CONSTRAINT "OAuth2Server_site_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_site_id_fkey";

-- DropIndex
DROP INDEX "OAuth2Client.site_id_server_id_client_id_index";

-- AlterTable
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_pkey",
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "site_id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Invite_id_seq";

-- AlterTable
ALTER TABLE "OAuth2Client" DROP CONSTRAINT "OAuth2Client_pkey",
DROP COLUMN "method",
DROP COLUMN "server_id",
ALTER COLUMN "type" SET DEFAULT E'web',
ALTER COLUMN "site_id" SET DATA TYPE TEXT,
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "OAuth2Client_id_seq";

-- AlterTable
ALTER TABLE "OAuth2Server" DROP CONSTRAINT "OAuth2Server_pkey",
ALTER COLUMN "site_id" SET DATA TYPE TEXT,
ALTER COLUMN "alias" SET DATA TYPE TEXT,
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "OAuth2Server_id_seq";

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Profile_id_seq";

-- AlterTable
ALTER TABLE "Site" DROP CONSTRAINT "Site_pkey",
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Site_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DEFAULT gen_uid(17),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "site_id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropEnum
DROP TYPE "AuthMethod";

-- CreateIndex
CREATE INDEX "OAuth2Client.site_id_client_id_index" ON "OAuth2Client"("site_id", "client_id");

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Server" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Client" ADD FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

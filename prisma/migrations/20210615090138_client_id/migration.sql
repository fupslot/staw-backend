/*
  Warnings:

  - The primary key for the `OAuth2Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OAuth2Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `OAuth2Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `OAuth2Server` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The required column `client_id` was added to the `OAuth2Client` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `server_id` on the `OAuth2Client` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "OAuth2Client" DROP CONSTRAINT "OAuth2Client_server_id_fkey";

-- AlterTable
ALTER TABLE "OAuth2Client" DROP CONSTRAINT "OAuth2Client_pkey",
ADD COLUMN     "client_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "server_id",
ADD COLUMN     "server_id" INTEGER NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OAuth2Server" DROP CONSTRAINT "OAuth2Server_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "OAuth2Client.id_server_id_index" ON "OAuth2Client"("id", "server_id");

-- AddForeignKey
ALTER TABLE "OAuth2Client" ADD FOREIGN KEY ("server_id") REFERENCES "OAuth2Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

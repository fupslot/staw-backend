/*
  Warnings:

  - The `type` column on the `OAuth2Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('confidential', 'public');

-- AlterTable
ALTER TABLE "OAuth2Client" DROP COLUMN "type",
ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT E'confidential';

-- DropEnum
DROP TYPE "AuthType";

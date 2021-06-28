/*
  Warnings:

  - You are about to drop the column `redirect_uri` on the `OAuth2Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OAuth2Application" DROP COLUMN "redirect_uri",
ADD COLUMN     "grants" TEXT[],
ADD COLUMN     "redirect_uris" TEXT[];

-- AlterTable
ALTER TABLE "OAuth2Client" ADD COLUMN     "access_token_lifetime" INTEGER NOT NULL DEFAULT 7200,
ADD COLUMN     "refresh_token_lifetime" INTEGER NOT NULL DEFAULT 2592000;

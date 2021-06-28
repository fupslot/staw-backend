/*
  Warnings:

  - Added the required column `audience` to the `OAuth2Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `OAuth2Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuer_uri` to the `OAuth2Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OAuth2Server" ADD COLUMN     "audience" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "issuer_uri" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Scope" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_consent_screen" BOOLEAN NOT NULL DEFAULT false,
    "oauth_server_id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scope" ADD FOREIGN KEY ("oauth_server_id") REFERENCES "OAuth2Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;

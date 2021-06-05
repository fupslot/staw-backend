/*
  Warnings:

  - Added the required column `invite_uri` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "invite_uri" VARCHAR NOT NULL;

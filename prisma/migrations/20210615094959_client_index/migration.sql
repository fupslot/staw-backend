/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `OAuth2Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OAuth2Client.id_server_id_index";

-- CreateIndex
CREATE UNIQUE INDEX "OAuth2Client.client_id_unique" ON "OAuth2Client"("client_id");

-- CreateIndex
CREATE INDEX "OAuth2Client.site_id_server_id_client_id_index" ON "OAuth2Client"("site_id", "server_id", "client_id");

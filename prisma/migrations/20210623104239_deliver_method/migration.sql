-- CreateEnum
CREATE TYPE "AccessTokenDeliverMethod" AS ENUM ('query_component', 'fragment_component');

-- AlterTable
ALTER TABLE "OAuth2Client" ADD COLUMN     "response_deliver_method" "AccessTokenDeliverMethod" NOT NULL DEFAULT E'query_component';

/*
  Warnings:

  - You are about to drop the `TokenPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TokenPriceLogs" DROP CONSTRAINT "TokenPriceLogs_token_id_fkey";

-- DropTable
DROP TABLE "TokenPrice";

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "token_address" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "chain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TokenPriceLogs" ADD CONSTRAINT "TokenPriceLogs_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

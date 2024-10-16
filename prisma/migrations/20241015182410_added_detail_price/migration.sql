/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "targetPrice" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "Price";

-- CreateTable
CREATE TABLE "TokenPrice" (
    "id" SERIAL NOT NULL,
    "token_address" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "chain" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("id")
);

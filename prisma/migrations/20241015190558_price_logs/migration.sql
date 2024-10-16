/*
  Warnings:

  - You are about to drop the column `price` on the `TokenPrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TokenPrice" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "TokenPriceLogs" (
    "id" BIGSERIAL NOT NULL,
    "token_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenPriceLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TokenPriceLogs" ADD CONSTRAINT "TokenPriceLogs_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "TokenPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

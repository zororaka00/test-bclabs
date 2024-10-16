/*
  Warnings:

  - You are about to drop the column `targetPrice` on the `Alert` table. All the data in the column will be lost.
  - Added the required column `target_price` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "targetPrice",
ADD COLUMN     "target_price" DECIMAL(65,30) NOT NULL;

/*
  Warnings:

  - You are about to drop the column `chain` on the `Alert` table. All the data in the column will be lost.
  - Added the required column `token_id` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "chain",
ADD COLUMN     "token_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[discountId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Discount" DROP CONSTRAINT "Discount_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_discountId_key" ON "Order"("discountId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

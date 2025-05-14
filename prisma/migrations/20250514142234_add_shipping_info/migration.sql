/*
  Warnings:

  - You are about to drop the `ShippingInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shippingHall` to the `OrderGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingName` to the `OrderGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingUniversityId` to the `OrderGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ShippingInfo" DROP CONSTRAINT "ShippingInfo_orderGroupId_fkey";

-- AlterTable
ALTER TABLE "OrderGroup" ADD COLUMN     "shippingHall" TEXT NOT NULL,
ADD COLUMN     "shippingName" TEXT NOT NULL,
ADD COLUMN     "shippingUniversityId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ShippingInfo";

-- AddForeignKey
ALTER TABLE "OrderGroup" ADD CONSTRAINT "OrderGroup_shippingUniversityId_fkey" FOREIGN KEY ("shippingUniversityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

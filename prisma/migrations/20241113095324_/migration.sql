/*
  Warnings:

  - Made the column `categoryId` on table `Startup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Startup" DROP CONSTRAINT "Startup_categoryId_fkey";

-- AlterTable
ALTER TABLE "Startup" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

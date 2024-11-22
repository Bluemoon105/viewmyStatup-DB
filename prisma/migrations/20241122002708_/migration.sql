/*
  Warnings:

  - You are about to drop the column `conmpareCount` on the `Startup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Startup" DROP COLUMN "conmpareCount",
ADD COLUMN     "compareCount" INTEGER NOT NULL DEFAULT 0;

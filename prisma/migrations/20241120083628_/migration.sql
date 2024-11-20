/*
  Warnings:

  - You are about to alter the column `actualInvest` on the `Startup` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `revenue` on the `Startup` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `simInvest` on the `Startup` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Startup" ALTER COLUMN "actualInvest" SET DATA TYPE INTEGER,
ALTER COLUMN "revenue" SET DATA TYPE INTEGER,
ALTER COLUMN "simInvest" SET DATA TYPE INTEGER;

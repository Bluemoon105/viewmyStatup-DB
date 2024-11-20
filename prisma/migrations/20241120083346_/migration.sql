/*
  Warnings:

  - You are about to alter the column `investAmount` on the `MockInvestor` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "MockInvestor" ALTER COLUMN "investAmount" SET DATA TYPE INTEGER;

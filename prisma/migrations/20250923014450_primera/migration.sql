/*
  Warnings:

  - Made the column `email` on table `administrativos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."administrativos" ALTER COLUMN "email" SET NOT NULL;

/*
  Warnings:

  - Added the required column `direccion` to the `orientadores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orientadores" ADD COLUMN     "direccion" TEXT NOT NULL;

/*
  Warnings:

  - Added the required column `apellido` to the `orientadores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orientadores" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "apellido" TEXT NOT NULL;

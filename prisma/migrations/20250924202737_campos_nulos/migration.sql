/*
  Warnings:

  - Made the column `etapas` on table `Sistema_Evaluacion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccion` on table `administrativos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dui` on table `administrativos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `administrativos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modalidad` on table `administrativos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dui` on table `orientadores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `orientadores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_cargo_administrativo` on table `orientadores` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."orientadores" DROP CONSTRAINT "orientadores_id_cargo_administrativo_fkey";

-- AlterTable
ALTER TABLE "public"."Sistema_Evaluacion" ALTER COLUMN "etapas" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."administrativos" ALTER COLUMN "direccion" SET NOT NULL,
ALTER COLUMN "dui" SET NOT NULL,
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "modalidad" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."orientadores" ALTER COLUMN "dui" SET NOT NULL,
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "id_cargo_administrativo" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."orientadores" ADD CONSTRAINT "orientadores_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE RESTRICT ON UPDATE CASCADE;

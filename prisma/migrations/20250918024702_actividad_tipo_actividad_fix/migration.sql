/*
  Warnings:

  - You are about to drop the `_ActividadToTipo_actividad` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_tipo_actividad` to the `Actividad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_ActividadToTipo_actividad" DROP CONSTRAINT "_ActividadToTipo_actividad_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ActividadToTipo_actividad" DROP CONSTRAINT "_ActividadToTipo_actividad_B_fkey";

-- AlterTable
ALTER TABLE "public"."Actividad" ADD COLUMN     "id_tipo_actividad" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_ActividadToTipo_actividad";

-- AddForeignKey
ALTER TABLE "public"."Actividad" ADD CONSTRAINT "Actividad_id_tipo_actividad_fkey" FOREIGN KEY ("id_tipo_actividad") REFERENCES "public"."Tipo_actividad"("id_tipo_actividad") ON DELETE RESTRICT ON UPDATE CASCADE;

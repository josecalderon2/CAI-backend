/*
  Warnings:

  - You are about to drop the column `foto` on the `Alumno` table. All the data in the column will be lost.
  - You are about to drop the column `id_responsable` on the `Alumno` table. All the data in the column will be lost.
  - You are about to drop the column `nivelEducativo` on the `Alumno` table. All the data in the column will be lost.
  - The primary key for the `Alumno_Detalle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `convivencia` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `curso` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `distanciaResidencia` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `estadoCivil` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `id_alumno` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `medioTransporte` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `numeroMiembrosFamilia` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `tieneHijos` on the `Alumno_Detalle` table. All the data in the column will be lost.
  - You are about to drop the column `id_alumno` on the `Curso` table. All the data in the column will be lost.
  - The primary key for the `Responsable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_parentesco` on the `Responsable` table. All the data in the column will be lost.
  - You are about to drop the column `id_responsable` on the `Responsable` table. All the data in the column will be lost.
  - You are about to drop the column `lugarTrabajo` on the `Responsable` table. All the data in the column will be lost.
  - You are about to drop the column `profesionOficio` on the `Responsable` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alumnoId]` on the table `Alumno_Detalle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Parentesco` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anioPartida` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `centroAsistencial` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamentoNacimiento` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distanciaKM` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folio` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `libro` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoNombre` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicoTelefono` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medioTransporte` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipioNacimiento` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observacionesMedicas` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partidaNumero` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemaFisico` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoSangre` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zonaResidencia` to the `Alumno` table without a default value. This is not possible if the table is not empty.
  - Made the column `genero` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fechaNacimiento` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nacionalidad` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccion` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `municipio` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departamento` on table `Alumno` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `alumnoId` to the `Alumno_Detalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacidadPago` to the `Alumno_Detalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tieneHermanos` to the `Alumno_Detalle` table without a default value. This is not possible if the table is not empty.
  - Made the column `repiteGrado` on table `Alumno_Detalle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `condicionado` on table `Alumno_Detalle` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `alumnoId` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamentoNacimiento` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estadoFamiliar` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaNacimiento` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firmaFoto` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipioNacimiento` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ocupacion` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentescoId` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profesion` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ultimoGradoEstudiado` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zonaResidencia` to the `Responsable` table without a default value. This is not possible if the table is not empty.
  - Made the column `dui` on table `Responsable` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telefono` on table `Responsable` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccion` on table `Responsable` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Alumno" DROP CONSTRAINT "Alumno_id_responsable_fkey";

-- DropForeignKey
ALTER TABLE "public"."Alumno_Detalle" DROP CONSTRAINT "Alumno_Detalle_id_alumno_fkey";

-- DropForeignKey
ALTER TABLE "public"."Curso" DROP CONSTRAINT "Curso_id_alumno_fkey";

-- DropForeignKey
ALTER TABLE "public"."Responsable" DROP CONSTRAINT "Responsable_id_parentesco_fkey";

-- AlterTable
ALTER TABLE "public"."Alumno" DROP COLUMN "foto",
DROP COLUMN "id_responsable",
DROP COLUMN "nivelEducativo",
ADD COLUMN     "anioPartida" TEXT NOT NULL,
ADD COLUMN     "centroAsistencial" TEXT NOT NULL,
ADD COLUMN     "departamentoNacimiento" TEXT NOT NULL,
ADD COLUMN     "distanciaKM" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "edad" INTEGER,
ADD COLUMN     "firmaMadre" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firmaPadre" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firmaResponsable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "folio" TEXT NOT NULL,
ADD COLUMN     "libro" TEXT NOT NULL,
ADD COLUMN     "medicoNombre" TEXT NOT NULL,
ADD COLUMN     "medicoTelefono" TEXT NOT NULL,
ADD COLUMN     "medioTransporte" TEXT NOT NULL,
ADD COLUMN     "municipioNacimiento" TEXT NOT NULL,
ADD COLUMN     "observacionesMedicas" TEXT NOT NULL,
ADD COLUMN     "partidaNumero" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "problemaFisico" TEXT NOT NULL,
ADD COLUMN     "tipoSangre" TEXT NOT NULL,
ADD COLUMN     "zonaResidencia" TEXT NOT NULL,
ALTER COLUMN "genero" SET NOT NULL,
ALTER COLUMN "fechaNacimiento" SET NOT NULL,
ALTER COLUMN "nacionalidad" SET NOT NULL,
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "direccion" SET NOT NULL,
ALTER COLUMN "municipio" SET NOT NULL,
ALTER COLUMN "departamento" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Alumno_Detalle" DROP CONSTRAINT "Alumno_Detalle_pkey",
DROP COLUMN "convivencia",
DROP COLUMN "curso",
DROP COLUMN "distanciaResidencia",
DROP COLUMN "estadoCivil",
DROP COLUMN "id_alumno",
DROP COLUMN "medioTransporte",
DROP COLUMN "numeroMiembrosFamilia",
DROP COLUMN "tieneHijos",
ADD COLUMN     "alumnoId" INTEGER NOT NULL,
ADD COLUMN     "capacidadPago" BOOLEAN NOT NULL,
ADD COLUMN     "custodiaLegal" TEXT,
ADD COLUMN     "detalleHermanos" JSONB,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "tieneHermanos" BOOLEAN NOT NULL,
ADD COLUMN     "viveCon" TEXT,
ALTER COLUMN "repiteGrado" SET NOT NULL,
ALTER COLUMN "condicionado" SET NOT NULL,
ADD CONSTRAINT "Alumno_Detalle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Curso" DROP COLUMN "id_alumno";

-- AlterTable
ALTER TABLE "public"."Responsable" DROP CONSTRAINT "Responsable_pkey",
DROP COLUMN "id_parentesco",
DROP COLUMN "id_responsable",
DROP COLUMN "lugarTrabajo",
DROP COLUMN "profesionOficio",
ADD COLUMN     "alumnoId" INTEGER NOT NULL,
ADD COLUMN     "departamentoNacimiento" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "estadoFamiliar" TEXT NOT NULL,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firmaFoto" BOOLEAN NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "municipioNacimiento" TEXT NOT NULL,
ADD COLUMN     "ocupacion" TEXT NOT NULL,
ADD COLUMN     "parentescoId" INTEGER NOT NULL,
ADD COLUMN     "profesion" TEXT NOT NULL,
ADD COLUMN     "religion" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "ultimoGradoEstudiado" TEXT NOT NULL,
ADD COLUMN     "zonaResidencia" TEXT NOT NULL,
ALTER COLUMN "dui" SET NOT NULL,
ALTER COLUMN "telefono" SET NOT NULL,
ALTER COLUMN "direccion" SET NOT NULL,
ADD CONSTRAINT "Responsable_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."_AlumnoCurso" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlumnoCurso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AlumnoCurso_B_index" ON "public"."_AlumnoCurso"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_Detalle_alumnoId_key" ON "public"."Alumno_Detalle"("alumnoId");

-- CreateIndex
CREATE UNIQUE INDEX "Parentesco_nombre_key" ON "public"."Parentesco"("nombre");

-- AddForeignKey
ALTER TABLE "public"."Alumno_Detalle" ADD CONSTRAINT "Alumno_Detalle_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Responsable" ADD CONSTRAINT "Responsable_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Responsable" ADD CONSTRAINT "Responsable_parentescoId_fkey" FOREIGN KEY ("parentescoId") REFERENCES "public"."Parentesco"("id_parentesco") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AlumnoCurso" ADD CONSTRAINT "_AlumnoCurso_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Alumno"("id_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AlumnoCurso" ADD CONSTRAINT "_AlumnoCurso_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

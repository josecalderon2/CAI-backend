/*
  Warnings:

  - A unique constraint covering the columns `[numeroMatricula]` on the table `Alumno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numeroDocumento]` on the table `Responsable` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN     "anioEscolar" TEXT,
ADD COLUMN     "autorizaActividadesReligiosas" BOOLEAN DEFAULT false,
ADD COLUMN     "autorizaAtencionMedica" BOOLEAN DEFAULT false,
ADD COLUMN     "autorizaUsoImagen" BOOLEAN DEFAULT false,
ADD COLUMN     "estadoMatricula" TEXT,
ADD COLUMN     "fechaMatricula" TIMESTAMP(3),
ADD COLUMN     "numeroMatricula" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "usaTransporteEscolar" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Alumno_Detalle" ADD COLUMN     "emergencia1Nombre" TEXT,
ADD COLUMN     "emergencia1Parentesco" TEXT,
ADD COLUMN     "emergencia1Telefono" TEXT,
ADD COLUMN     "emergencia2Nombre" TEXT,
ADD COLUMN     "emergencia2Parentesco" TEXT,
ADD COLUMN     "emergencia2Telefono" TEXT,
ADD COLUMN     "tenenciaVivienda" TEXT;

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "anio_academico" TEXT;

-- AlterTable
ALTER TABLE "Responsable" ADD COLUMN     "naturalizado" BOOLEAN DEFAULT false,
ADD COLUMN     "numeroDocumento" TEXT,
ADD COLUMN     "telefonoFijo" TEXT,
ADD COLUMN     "tipoDocumento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Alumno_numeroMatricula_key" ON "Alumno"("numeroMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "Responsable_numeroDocumento_key" ON "Responsable"("numeroDocumento");

/*
  Warnings:

  - You are about to drop the `Administrativo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Orientador` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Administrativo" DROP CONSTRAINT "Administrativo_id_cargo_administrativo_fkey";

-- DropForeignKey
ALTER TABLE "public"."Curso" DROP CONSTRAINT "Curso_id_orientador_fkey";

-- DropForeignKey
ALTER TABLE "public"."Historial_curso_orientador" DROP CONSTRAINT "Historial_curso_orientador_id_orientador_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orientador" DROP CONSTRAINT "Orientador_id_cargo_administrativo_fkey";

-- DropTable
DROP TABLE "public"."Administrativo";

-- DropTable
DROP TABLE "public"."Orientador";

-- CreateTable
CREATE TABLE "public"."administrativos" (
    "id_administrativo" SERIAL NOT NULL,
    "id_cargo_administrativo" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "direccion" TEXT,
    "dui" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modalidad" TEXT,

    CONSTRAINT "administrativos_pkey" PRIMARY KEY ("id_administrativo")
);

-- CreateTable
CREATE TABLE "public"."orientadores" (
    "id_orientador" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dui" TEXT,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_cargo_administrativo" INTEGER,

    CONSTRAINT "orientadores_pkey" PRIMARY KEY ("id_orientador")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrativos_email_key" ON "public"."administrativos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orientadores_email_key" ON "public"."orientadores"("email");

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."orientadores"("id_orientador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."orientadores"("id_orientador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."administrativos" ADD CONSTRAINT "administrativos_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orientadores" ADD CONSTRAINT "orientadores_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

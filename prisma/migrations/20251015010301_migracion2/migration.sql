-- CreateTable
CREATE TABLE "AsignaturaOrientador" (
    "id_asignatura_orientador" SERIAL NOT NULL,
    "id_asignatura" INTEGER NOT NULL,
    "id_orientador" INTEGER NOT NULL,
    "anio_academico" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),

    CONSTRAINT "AsignaturaOrientador_pkey" PRIMARY KEY ("id_asignatura_orientador")
);

-- CreateIndex
CREATE INDEX "AsignaturaOrientador_id_asignatura_idx" ON "AsignaturaOrientador"("id_asignatura");

-- CreateIndex
CREATE INDEX "AsignaturaOrientador_id_orientador_idx" ON "AsignaturaOrientador"("id_orientador");

-- CreateIndex
CREATE UNIQUE INDEX "AsignaturaOrientador_id_asignatura_id_orientador_anio_acade_key" ON "AsignaturaOrientador"("id_asignatura", "id_orientador", "anio_academico");

-- AddForeignKey
ALTER TABLE "AsignaturaOrientador" ADD CONSTRAINT "AsignaturaOrientador_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "Asignatura"("id_asignatura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignaturaOrientador" ADD CONSTRAINT "AsignaturaOrientador_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "orientadores"("id_orientador") ON DELETE RESTRICT ON UPDATE CASCADE;

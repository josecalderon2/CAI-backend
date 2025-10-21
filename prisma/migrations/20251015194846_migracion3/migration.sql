-- AlterTable
ALTER TABLE "Historial_curso_orientador" ADD COLUMN     "es_orientador" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id_asignatura" INTEGER;

-- CreateIndex
CREATE INDEX "Historial_curso_orientador_id_curso_id_orientador_id_asigna_idx" ON "Historial_curso_orientador"("id_curso", "id_orientador", "id_asignatura");

-- CreateIndex
CREATE INDEX "Historial_curso_orientador_anio_academico_idx" ON "Historial_curso_orientador"("anio_academico");

-- CreateIndex
CREATE INDEX "Historial_curso_orientador_fecha_asignacion_fecha_fin_idx" ON "Historial_curso_orientador"("fecha_asignacion", "fecha_fin");

-- AddForeignKey
ALTER TABLE "Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "Asignatura"("id_asignatura") ON DELETE SET NULL ON UPDATE CASCADE;

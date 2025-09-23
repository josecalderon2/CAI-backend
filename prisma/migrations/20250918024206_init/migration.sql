-- CreateTable
CREATE TABLE "public"."Alumno" (
    "id_alumno" SERIAL NOT NULL,
    "foto" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "genero" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "municipio" TEXT,
    "departamento" TEXT,
    "nivelEducativo" TEXT,
    "id_responsable" INTEGER,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id_alumno")
);

-- CreateTable
CREATE TABLE "public"."Responsable" (
    "id_responsable" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dui" TEXT,
    "lugarTrabajo" TEXT,
    "profesionOficio" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "id_parentesco" INTEGER,

    CONSTRAINT "Responsable_pkey" PRIMARY KEY ("id_responsable")
);

-- CreateTable
CREATE TABLE "public"."Parentesco" (
    "id_parentesco" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Parentesco_pkey" PRIMARY KEY ("id_parentesco")
);

-- CreateTable
CREATE TABLE "public"."Alumno_Detalle" (
    "id_alumno" INTEGER NOT NULL,
    "repiteGrado" TEXT,
    "condicionado" TEXT,
    "enfermedades" TEXT,
    "medicamentoPrescrito" TEXT,
    "curso" TEXT,
    "estadoCivil" TEXT,
    "medioTransporte" TEXT,
    "distanciaResidencia" TEXT,
    "numeroMiembrosFamilia" INTEGER,
    "tieneHijos" TEXT,
    "convivencia" TEXT,
    "dependenciaEconomica" TEXT,

    CONSTRAINT "Alumno_Detalle_pkey" PRIMARY KEY ("id_alumno")
);

-- CreateTable
CREATE TABLE "public"."Jornada" (
    "id_jornada" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id_jornada")
);

-- CreateTable
CREATE TABLE "public"."Grado_Academico" (
    "id_grado_academico" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "opcion" TEXT,
    "n_anios" INTEGER,
    "nota_minima" DOUBLE PRECISION,
    "id_jornada" INTEGER,
    "rcup" BOOLEAN,

    CONSTRAINT "Grado_Academico_pkey" PRIMARY KEY ("id_grado_academico")
);

-- CreateTable
CREATE TABLE "public"."Curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "seccion" TEXT,
    "id_grado_academico" INTEGER,
    "id_orientador" INTEGER,
    "cupo" INTEGER,
    "aula" TEXT,
    "id_alumno" INTEGER,
    "id_asignatura" INTEGER,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "public"."Historial_curso_orientador" (
    "id_historial_curso_orientador" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "id_orientador" INTEGER NOT NULL,
    "anio_academico" TEXT,
    "fecha_asignacion" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),

    CONSTRAINT "Historial_curso_orientador_pkey" PRIMARY KEY ("id_historial_curso_orientador")
);

-- CreateTable
CREATE TABLE "public"."Asignatura" (
    "id_asignatura" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden_en_reporte" TEXT,
    "horas_semanas" DOUBLE PRECISION,
    "id_metodo_evaluacion" INTEGER,
    "id_tipo_asignatura" INTEGER,
    "id_sistema_evaluacion" INTEGER,

    CONSTRAINT "Asignatura_pkey" PRIMARY KEY ("id_asignatura")
);

-- CreateTable
CREATE TABLE "public"."Metodo_evaluacion" (
    "id_metodo_evaluacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Metodo_evaluacion_pkey" PRIMARY KEY ("id_metodo_evaluacion")
);

-- CreateTable
CREATE TABLE "public"."Tipo_Asignatura" (
    "id_tipo_asignatura" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tipo_Asignatura_pkey" PRIMARY KEY ("id_tipo_asignatura")
);

-- CreateTable
CREATE TABLE "public"."Sistema_Evaluacion" (
    "id_sistema_evaluacion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "etapas" INTEGER,

    CONSTRAINT "Sistema_Evaluacion_pkey" PRIMARY KEY ("id_sistema_evaluacion")
);

-- CreateTable
CREATE TABLE "public"."Notas" (
    "id_nota" SERIAL NOT NULL,
    "id_asignatura" INTEGER NOT NULL,
    "trimestre" TEXT,
    "id_actividad" INTEGER,
    "calificacion" DOUBLE PRECISION,
    "fecha_registro" TIMESTAMP(3),
    "id_alumno" INTEGER NOT NULL,

    CONSTRAINT "Notas_pkey" PRIMARY KEY ("id_nota")
);

-- CreateTable
CREATE TABLE "public"."Actividad" (
    "id_actividad" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "puntaje_maximo" DOUBLE PRECISION,
    "puntaje_minimo" DOUBLE PRECISION,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id_actividad")
);

-- CreateTable
CREATE TABLE "public"."Tipo_actividad" (
    "id_tipo_actividad" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tipo_actividad_pkey" PRIMARY KEY ("id_tipo_actividad")
);

-- CreateTable
CREATE TABLE "public"."Administrativo" (
    "id_administrativo" SERIAL NOT NULL,
    "id_cargo_administrativo" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "direccion" TEXT,
    "dui" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "modalidad" TEXT,

    CONSTRAINT "Administrativo_pkey" PRIMARY KEY ("id_administrativo")
);

-- CreateTable
CREATE TABLE "public"."Cargo_administrativo" (
    "id_cargo_administrativo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cargo_administrativo_pkey" PRIMARY KEY ("id_cargo_administrativo")
);

-- CreateTable
CREATE TABLE "public"."Orientador" (
    "id_orientador" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dui" TEXT,
    "telefono" TEXT,
    "id_cargo_administrativo" INTEGER,

    CONSTRAINT "Orientador_pkey" PRIMARY KEY ("id_orientador")
);

-- CreateTable
CREATE TABLE "public"."_ActividadToTipo_actividad" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ActividadToTipo_actividad_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActividadToTipo_actividad_B_index" ON "public"."_ActividadToTipo_actividad"("B");

-- AddForeignKey
ALTER TABLE "public"."Alumno" ADD CONSTRAINT "Alumno_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "public"."Responsable"("id_responsable") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Responsable" ADD CONSTRAINT "Responsable_id_parentesco_fkey" FOREIGN KEY ("id_parentesco") REFERENCES "public"."Parentesco"("id_parentesco") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alumno_Detalle" ADD CONSTRAINT "Alumno_Detalle_id_alumno_fkey" FOREIGN KEY ("id_alumno") REFERENCES "public"."Alumno"("id_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grado_Academico" ADD CONSTRAINT "Grado_Academico_id_jornada_fkey" FOREIGN KEY ("id_jornada") REFERENCES "public"."Jornada"("id_jornada") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_grado_academico_fkey" FOREIGN KEY ("id_grado_academico") REFERENCES "public"."Grado_Academico"("id_grado_academico") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."Orientador"("id_orientador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_alumno_fkey" FOREIGN KEY ("id_alumno") REFERENCES "public"."Alumno"("id_alumno") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "public"."Asignatura"("id_asignatura") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."Orientador"("id_orientador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignatura" ADD CONSTRAINT "Asignatura_id_metodo_evaluacion_fkey" FOREIGN KEY ("id_metodo_evaluacion") REFERENCES "public"."Metodo_evaluacion"("id_metodo_evaluacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignatura" ADD CONSTRAINT "Asignatura_id_tipo_asignatura_fkey" FOREIGN KEY ("id_tipo_asignatura") REFERENCES "public"."Tipo_Asignatura"("id_tipo_asignatura") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignatura" ADD CONSTRAINT "Asignatura_id_sistema_evaluacion_fkey" FOREIGN KEY ("id_sistema_evaluacion") REFERENCES "public"."Sistema_Evaluacion"("id_sistema_evaluacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notas" ADD CONSTRAINT "Notas_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "public"."Asignatura"("id_asignatura") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notas" ADD CONSTRAINT "Notas_id_actividad_fkey" FOREIGN KEY ("id_actividad") REFERENCES "public"."Actividad"("id_actividad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notas" ADD CONSTRAINT "Notas_id_alumno_fkey" FOREIGN KEY ("id_alumno") REFERENCES "public"."Alumno"("id_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Administrativo" ADD CONSTRAINT "Administrativo_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orientador" ADD CONSTRAINT "Orientador_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActividadToTipo_actividad" ADD CONSTRAINT "_ActividadToTipo_actividad_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Actividad"("id_actividad") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActividadToTipo_actividad" ADD CONSTRAINT "_ActividadToTipo_actividad_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tipo_actividad"("id_tipo_actividad") ON DELETE CASCADE ON UPDATE CASCADE;

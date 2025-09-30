-- CreateTable
CREATE TABLE "public"."Alumno" (
    "id_alumno" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "genero" TEXT,
    "fechaNacimiento" TEXT,
    "nacionalidad" TEXT,
    "edad" INTEGER,
    "partidaNumero" TEXT,
    "folio" TEXT,
    "libro" TEXT,
    "anioPartida" TEXT,
    "departamentoNacimiento" TEXT,
    "municipioNacimiento" TEXT,
    "tipoSangre" TEXT,
    "problemaFisico" TEXT,
    "observacionesMedicas" TEXT,
    "centroAsistencial" TEXT,
    "medicoNombre" TEXT,
    "medicoTelefono" TEXT,
    "zonaResidencia" TEXT,
    "direccion" TEXT,
    "municipio" TEXT,
    "departamento" TEXT,
    "distanciaKM" DOUBLE PRECISION,
    "medioTransporte" TEXT,
    "encargadoTransporte" TEXT,
    "encargadoTelefono" TEXT,
    "repiteGrado" BOOLEAN NOT NULL DEFAULT false,
    "condicionado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id_alumno")
);

-- CreateTable
CREATE TABLE "public"."Alumno_Detalle" (
    "alumnoId" INTEGER NOT NULL,
    "viveCon" TEXT,
    "dependenciaEconomica" TEXT,
    "capacidadPago" BOOLEAN,
    "tieneHermanosEnColegio" BOOLEAN DEFAULT false,
    "hermanosEnColegio" JSONB,

    CONSTRAINT "Alumno_Detalle_pkey" PRIMARY KEY ("alumnoId")
);

-- CreateTable
CREATE TABLE "public"."Responsable" (
    "id_responsable" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dui" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "lugarTrabajo" TEXT,
    "profesionOficio" TEXT,
    "ultimoGradoEstudiado" TEXT,
    "ocupacion" TEXT,
    "religion" TEXT,
    "zonaResidencia" TEXT,
    "estadoFamiliar" TEXT,
    "empresaTransporte" TEXT,
    "placaVehiculo" TEXT,
    "tipoVehiculo" TEXT,
    "firmaFoto" BYTEA,

    CONSTRAINT "Responsable_pkey" PRIMARY KEY ("id_responsable")
);

-- CreateTable
CREATE TABLE "public"."Parentesco" (
    "id_parentesco" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Parentesco_pkey" PRIMARY KEY ("id_parentesco")
);

-- CreateTable
CREATE TABLE "public"."AlumnoResponsable" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "responsableId" INTEGER NOT NULL,
    "parentescoId" INTEGER,
    "parentescoLibre" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "firma" BOOLEAN NOT NULL DEFAULT false,
    "firmaImagen" BYTEA,
    "permiteTraslado" BOOLEAN NOT NULL DEFAULT false,
    "puedeRetirarAlumno" BOOLEAN NOT NULL DEFAULT false,
    "contactoEmergencia" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AlumnoResponsable_pkey" PRIMARY KEY ("id")
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
    "etapas" INTEGER NOT NULL,

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
    "id_tipo_actividad" INTEGER NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id_actividad")
);

-- CreateTable
CREATE TABLE "public"."Tipo_actividad" (
    "id_tipo_actividad" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tipo_actividad_pkey" PRIMARY KEY ("id_tipo_actividad")
);

-- CreateTable
CREATE TABLE "public"."administrativos" (
    "id_administrativo" SERIAL NOT NULL,
    "id_cargo_administrativo" INTEGER,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "dui" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrativos_pkey" PRIMARY KEY ("id_administrativo")
);

-- CreateTable
CREATE TABLE "public"."Cargo_administrativo" (
    "id_cargo_administrativo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cargo_administrativo_pkey" PRIMARY KEY ("id_cargo_administrativo")
);

-- CreateTable
CREATE TABLE "public"."orientadores" (
    "id_orientador" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dui" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_cargo_administrativo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "orientadores_pkey" PRIMARY KEY ("id_orientador")
);

-- CreateTable
CREATE TABLE "public"."_AlumnoCurso" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AlumnoCurso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Responsable_dui_key" ON "public"."Responsable"("dui");

-- CreateIndex
CREATE UNIQUE INDEX "Responsable_email_key" ON "public"."Responsable"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Parentesco_nombre_key" ON "public"."Parentesco"("nombre");

-- CreateIndex
CREATE INDEX "AlumnoResponsable_alumnoId_parentescoId_idx" ON "public"."AlumnoResponsable"("alumnoId", "parentescoId");

-- CreateIndex
CREATE INDEX "AlumnoResponsable_responsableId_idx" ON "public"."AlumnoResponsable"("responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "AlumnoResponsable_alumnoId_responsableId_key" ON "public"."AlumnoResponsable"("alumnoId", "responsableId");

-- CreateIndex
CREATE UNIQUE INDEX "administrativos_dui_key" ON "public"."administrativos"("dui");

-- CreateIndex
CREATE UNIQUE INDEX "administrativos_email_key" ON "public"."administrativos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "orientadores_dui_key" ON "public"."orientadores"("dui");

-- CreateIndex
CREATE UNIQUE INDEX "orientadores_email_key" ON "public"."orientadores"("email");

-- CreateIndex
CREATE INDEX "_AlumnoCurso_B_index" ON "public"."_AlumnoCurso"("B");

-- AddForeignKey
ALTER TABLE "public"."Alumno_Detalle" ADD CONSTRAINT "Alumno_Detalle_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlumnoResponsable" ADD CONSTRAINT "AlumnoResponsable_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "public"."Alumno"("id_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlumnoResponsable" ADD CONSTRAINT "AlumnoResponsable_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "public"."Responsable"("id_responsable") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlumnoResponsable" ADD CONSTRAINT "AlumnoResponsable_parentescoId_fkey" FOREIGN KEY ("parentescoId") REFERENCES "public"."Parentesco"("id_parentesco") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Grado_Academico" ADD CONSTRAINT "Grado_Academico_id_jornada_fkey" FOREIGN KEY ("id_jornada") REFERENCES "public"."Jornada"("id_jornada") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_grado_academico_fkey" FOREIGN KEY ("id_grado_academico") REFERENCES "public"."Grado_Academico"("id_grado_academico") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."orientadores"("id_orientador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Curso" ADD CONSTRAINT "Curso_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "public"."Asignatura"("id_asignatura") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_curso_orientador" ADD CONSTRAINT "Historial_curso_orientador_id_orientador_fkey" FOREIGN KEY ("id_orientador") REFERENCES "public"."orientadores"("id_orientador") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "public"."Actividad" ADD CONSTRAINT "Actividad_id_tipo_actividad_fkey" FOREIGN KEY ("id_tipo_actividad") REFERENCES "public"."Tipo_actividad"("id_tipo_actividad") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."administrativos" ADD CONSTRAINT "administrativos_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orientadores" ADD CONSTRAINT "orientadores_id_cargo_administrativo_fkey" FOREIGN KEY ("id_cargo_administrativo") REFERENCES "public"."Cargo_administrativo"("id_cargo_administrativo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AlumnoCurso" ADD CONSTRAINT "_AlumnoCurso_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Alumno"("id_alumno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AlumnoCurso" ADD CONSTRAINT "_AlumnoCurso_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

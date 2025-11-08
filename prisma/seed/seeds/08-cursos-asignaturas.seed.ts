import { PrismaClient } from '@prisma/client';

export async function seedCursosYAsignaturas(prisma: PrismaClient) {
  console.log('🔹 Seeding: Cursos, Asignaturas y Asignaciones...');

  // Obtener orientadores
  const ori1 = await prisma.orientador.findUnique({
    where: { email: 'orientador@colegio.edu' },
  });

  if (!ori1) {
    throw new Error(
      'No existe orientador@colegio.edu. Ejecuta seedUsuarios() primero.',
    );
  }

  // Obtener grado académico
  const primaria = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Primaria' },
  });

  const bachillerato = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Bachillerato' },
  });

  if (!primaria || !bachillerato) {
    throw new Error(
      'Grados "Primaria" o "Bachillerato" no encontrados. Ejecuta seedGradosAcademicos() primero.',
    );
  }

  // Obtener catálogos de evaluación
  const metodo = await prisma.metodo_evaluacion.findFirst({
    where: { nombre: 'Numerico' },
  });
  const tipoBasica = await prisma.tipo_Asignatura.findFirst({
    where: { nombre: 'Basica' },
  });
  const sistemaBasica = await prisma.sistema_Evaluacion.findFirst({
    where: { nombre: 'Educacion Basica - 4' },
  });
  const sistemaBachillerato = await prisma.sistema_Evaluacion.findFirst({
    where: { nombre: 'Bachillerato General - 4 etapas' },
  });

  if (!metodo || !tipoBasica || !sistemaBasica || !sistemaBachillerato) {
    throw new Error(
      'Catálogos de evaluación no encontrados. Ejecuta seedCatalogosEvaluacion() primero.',
    );
  }

  const anio = '2025';

  // Crear curso
  const curso5A = await prisma.curso.upsert({
    where: { id_curso: 1 }, // Asumiendo que es el primer curso
    update: {},
    create: {
      nombre: 'Quinto Grado',
      seccion: 'A',
      id_grado_academico: primaria.id_grado_academico,
      id_orientador: ori1.id_orientador,
      cupo: 35,
      aula: 'A-5',
      anio_academico: anio,
      activo: true,
    },
  });

  // Crear asignaturas BÁSICA
  const matematica = await prisma.asignatura.upsert({
    where: { id_asignatura: 1 },
    update: {},
    create: {
      nombre: 'Matemática I',
      id_curso: curso5A.id_curso,
      orden_en_reporte: '01',
      horas_semanas: 5,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipoBasica.id_tipo_asignatura,
      id_sistema_evaluacion: sistemaBasica.id_sistema_evaluacion,
    },
  });

  const lenguaje = await prisma.asignatura.upsert({
    where: { id_asignatura: 2 },
    update: {},
    create: {
      nombre: 'Lenguaje y Literatura',
      id_curso: curso5A.id_curso,
      orden_en_reporte: '02',
      horas_semanas: 4,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipoBasica.id_tipo_asignatura,
      id_sistema_evaluacion: sistemaBasica.id_sistema_evaluacion,
    },
  });

  // Asignar al orientador
  await prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: matematica.id_asignatura,
        id_orientador: ori1.id_orientador,
        anio_academico: anio,
      },
    },
    update: { activo: true },
    create: {
      id_asignatura: matematica.id_asignatura,
      id_orientador: ori1.id_orientador,
      anio_academico: anio,
      activo: true,
    },
  });

  await prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: lenguaje.id_asignatura,
        id_orientador: ori1.id_orientador,
        anio_academico: anio,
      },
    },
    update: { activo: true },
    create: {
      id_asignatura: lenguaje.id_asignatura,
      id_orientador: ori1.id_orientador,
      anio_academico: anio,
      activo: true,
    },
  });

  // ===================================
  // CURSO Y ASIGNATURAS BACHILLERATO
  // ===================================

  const cursoBachillerato = await prisma.curso.upsert({
    where: { id_curso: 2 },
    update: {},
    create: {
      nombre: '1º Bachillerato',
      seccion: 'A',
      id_grado_academico: bachillerato.id_grado_academico,
      id_orientador: ori1.id_orientador,
      cupo: 30,
      aula: 'B-1',
      anio_academico: anio,
      activo: true,
    },
  });

  // Asignaturas Bachillerato
  const matematicaBach = await prisma.asignatura.upsert({
    where: { id_asignatura: 6 },
    update: {},
    create: {
      nombre: 'Matemática I - Bach',
      id_curso: cursoBachillerato.id_curso,
      orden_en_reporte: '01',
      horas_semanas: 5,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipoBasica.id_tipo_asignatura,
      id_sistema_evaluacion: sistemaBachillerato.id_sistema_evaluacion,
    },
  });

  const lenguajeBach = await prisma.asignatura.upsert({
    where: { id_asignatura: 7 },
    update: {},
    create: {
      nombre: 'Lenguaje y Literatura - Bach',
      id_curso: cursoBachillerato.id_curso,
      orden_en_reporte: '02',
      horas_semanas: 4,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipoBasica.id_tipo_asignatura,
      id_sistema_evaluacion: sistemaBachillerato.id_sistema_evaluacion,
    },
  });

  const cienciasBach = await prisma.asignatura.upsert({
    where: { id_asignatura: 8 },
    update: {},
    create: {
      nombre: 'Ciencias Naturales - Bach',
      id_curso: cursoBachillerato.id_curso,
      orden_en_reporte: '03',
      horas_semanas: 4,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipoBasica.id_tipo_asignatura,
      id_sistema_evaluacion: sistemaBachillerato.id_sistema_evaluacion,
    },
  });

  // Asignar Bachillerato al orientador
  await prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: matematicaBach.id_asignatura,
        id_orientador: ori1.id_orientador,
        anio_academico: anio,
      },
    },
    update: { activo: true },
    create: {
      id_asignatura: matematicaBach.id_asignatura,
      id_orientador: ori1.id_orientador,
      anio_academico: anio,
      activo: true,
    },
  });

  await prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: lenguajeBach.id_asignatura,
        id_orientador: ori1.id_orientador,
        anio_academico: anio,
      },
    },
    update: { activo: true },
    create: {
      id_asignatura: lenguajeBach.id_asignatura,
      id_orientador: ori1.id_orientador,
      anio_academico: anio,
      activo: true,
    },
  });

  await prisma.asignaturaOrientador.upsert({
    where: {
      id_asignatura_id_orientador_anio_academico: {
        id_asignatura: cienciasBach.id_asignatura,
        id_orientador: ori1.id_orientador,
        anio_academico: anio,
      },
    },
    update: { activo: true },
    create: {
      id_asignatura: cienciasBach.id_asignatura,
      id_orientador: ori1.id_orientador,
      anio_academico: anio,
      activo: true,
    },
  });

  console.log('✅ Cursos y Asignaturas OK (Básica + Bachillerato)');
}

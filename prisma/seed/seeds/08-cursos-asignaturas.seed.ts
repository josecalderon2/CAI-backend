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

  if (!primaria) {
    throw new Error(
      'Grado "Primaria" no encontrado. Ejecuta seedGradosAcademicos() primero.',
    );
  }

  // Obtener catálogos de evaluación
  const metodo = await prisma.metodo_evaluacion.findFirst({
    where: { nombre: 'Numerico' },
  });
  const tipo = await prisma.tipo_Asignatura.findFirst({
    where: { nombre: 'Basica' },
  });
  const sistema = await prisma.sistema_Evaluacion.findFirst({
    where: { nombre: 'Educacion Basica - 4' },
  });

  if (!metodo || !tipo || !sistema) {
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

  // Crear asignaturas
  const matematica = await prisma.asignatura.upsert({
    where: { id_asignatura: 1 },
    update: {},
    create: {
      nombre: 'Matemática I',
      id_curso: curso5A.id_curso,
      orden_en_reporte: '01',
      horas_semanas: 5,
      id_metodo_evaluacion: metodo.id_metodo_evaluacion,
      id_tipo_asignatura: tipo.id_tipo_asignatura,
      id_sistema_evaluacion: sistema.id_sistema_evaluacion,
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
      id_tipo_asignatura: tipo.id_tipo_asignatura,
      id_sistema_evaluacion: sistema.id_sistema_evaluacion,
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

  console.log('✅ Cursos y Asignaturas OK');
}

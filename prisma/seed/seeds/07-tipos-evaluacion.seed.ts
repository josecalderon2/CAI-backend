import { PrismaClient } from '@prisma/client';

export async function seedTiposEvaluacion(prisma: PrismaClient) {
  console.log('🔹 Seeding: Tipos de Evaluación...');

  // 1. Obtener los grados académicos necesarios
  const primaria = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Primaria' },
  });

  const secundaria = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Secundaria' },
  });

  const bachillerato = await prisma.grado_Academico.findFirst({
    where: { nombre: 'Bachillerato' },
  });

  if (!primaria || !secundaria || !bachillerato) {
    throw new Error('No se encontraron todos los grados académicos necesarios');
  }

  // 2. Definir tipos de evaluación para cada grado
  const tipos = [
    // Primaria
    {
      nombre: 'Tarea',
      porcentaje: 5,
      idGradoAcademico: primaria.id_grado_academico,
    },
    {
      nombre: 'Revisión de Cuaderno',
      porcentaje: 15,
      idGradoAcademico: primaria.id_grado_academico,
    },
    {
      nombre: 'Laboratorio',
      porcentaje: 15,
      idGradoAcademico: primaria.id_grado_academico,
    },
    {
      nombre: 'Actividad Integradora',
      porcentaje: 25,
      idGradoAcademico: primaria.id_grado_academico,
    },
    {
      nombre: 'Autoevaluación',
      porcentaje: 10,
      idGradoAcademico: primaria.id_grado_academico,
    },
    {
      nombre: 'Examen Trimestral',
      porcentaje: 30,
      idGradoAcademico: primaria.id_grado_academico,
    },

    // Secundaria
    {
      nombre: 'Tarea',
      porcentaje: 5,
      idGradoAcademico: secundaria.id_grado_academico,
    },
    {
      nombre: 'Revisión de Cuaderno',
      porcentaje: 15,
      idGradoAcademico: secundaria.id_grado_academico,
    },
    {
      nombre: 'Laboratorio',
      porcentaje: 15,
      idGradoAcademico: secundaria.id_grado_academico,
    },
    {
      nombre: 'Actividad Integradora',
      porcentaje: 25,
      idGradoAcademico: secundaria.id_grado_academico,
    },
    {
      nombre: 'Autoevaluación',
      porcentaje: 10,
      idGradoAcademico: secundaria.id_grado_academico,
    },
    {
      nombre: 'Examen Trimestral',
      porcentaje: 30,
      idGradoAcademico: secundaria.id_grado_academico,
    },

    // Bachillerato
    {
      nombre: 'Tarea',
      porcentaje: 5,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
    {
      nombre: 'Laboratorio',
      porcentaje: 10,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
    {
      nombre: 'Actividad Integradora',
      porcentaje: 25,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
    {
      nombre: 'Coevaluación',
      porcentaje: 5,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
    {
      nombre: 'Examen Parcial',
      porcentaje: 25,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
    {
      nombre: 'Examen de Periodo',
      porcentaje: 30,
      idGradoAcademico: bachillerato.id_grado_academico,
    },
  ];

  // 3. Crear los tipos de evaluación
  for (const tipo of tipos) {
    // Verificar si ya existe
    const exists = await prisma.tipo_evaluacion.findFirst({
      where: {
        nombre: tipo.nombre,
        id_grado_academico: tipo.idGradoAcademico,
      },
    });

    if (!exists) {
      await prisma.tipo_evaluacion.create({
        data: {
          nombre: tipo.nombre,
          id_grado_academico: tipo.idGradoAcademico,
          porcentaje: tipo.porcentaje,
          activo: true,
        },
      });
    }
  }

  console.log('Tipos de Evaluación creados exitosamente');
}

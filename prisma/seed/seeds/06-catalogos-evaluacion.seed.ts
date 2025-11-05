import { PrismaClient } from '@prisma/client';

export async function seedCatalogosEvaluacion(prisma: PrismaClient) {
  console.log('🔹 Seeding: Catálogos de Evaluación...');

  // Métodos de Evaluación
  const metodos = ['Numerico', 'Conceptual / Cualitativo', 'Cuantitativo'];
  for (const nombre of metodos) {
    const existente = await prisma.metodo_evaluacion.findFirst({
      where: { nombre },
    });
    if (!existente) {
      await prisma.metodo_evaluacion.create({ data: { nombre } });
    }
  }

  // Tipos de Asignatura
  const tipos = [
    'Basica',
    'Formativa',
    'Conductual',
    'Especial',
    'Asistencia',
    'PAES',
  ];
  for (const nombre of tipos) {
    const existente = await prisma.tipo_Asignatura.findFirst({
      where: { nombre },
    });
    if (!existente) {
      await prisma.tipo_Asignatura.create({ data: { nombre } });
    }
  }

  // Sistemas de Evaluación
  const sistemas = [
    { nombre: 'Educacion Basica - 4', etapas: 4 },
    { nombre: 'Socioafectiva - 4 etapas', etapas: 4 },
    { nombre: 'Asistencia NO - 4 etapas', etapas: 4 },
    { nombre: 'Bachillerato General - 4 etapas', etapas: 4 },
    { nombre: 'Educacion General - 4 etapas', etapas: 4 },
    { nombre: 'Educacion Basica - 3 etapas', etapas: 3 },
    { nombre: 'Conductual - 3 etapas', etapas: 3 },
    { nombre: 'Educacion Parvularia - 3 etapas', etapas: 3 },
    { nombre: 'Area Formativa - 3 etapas', etapas: 3 },
    { nombre: 'ASISTENCIA - 3 Etapas', etapas: 3 },
  ];
  for (const sistema of sistemas) {
    const existente = await prisma.sistema_Evaluacion.findFirst({
      where: { nombre: sistema.nombre },
    });
    if (!existente) {
      await prisma.sistema_Evaluacion.create({ data: sistema });
    }
  }

  // Tipos de Evaluación
  const tiposEvaluacion = [
    'Examen parcial',
    'Examen final',
    'Laboratorio',
    'Tarea',
    'Proyecto',
    'Participación',
  ];
  for (const nombre of tiposEvaluacion) {
    const existente = await prisma.tipo_evaluacion.findFirst({
      where: { nombre },
    });
    if (!existente) {
      await prisma.tipo_evaluacion.create({ data: { nombre } });
    }
  }

  console.log('Catálogos de Evaluación OK');
}

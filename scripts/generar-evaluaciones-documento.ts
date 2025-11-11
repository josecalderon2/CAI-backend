import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Generando evaluaciones según documento oficial\n');
  console.log('Sistema: BÁSICA (3 trimestres)');
  console.log('Estructura: 1 evaluación por tipo por mes\n');

  const anioAcademico = '2025';
  const asignaturas = await prisma.asignatura.findMany({
    where: { id_curso: 1 },
  });

  // Obtener orientador
  const orientador = await prisma.orientador.findFirst();
  if (!orientador) {
    console.log(' Error: No se encontró orientador');
    await prisma.$disconnect();
    return;
  }

  console.log(`Asignaturas encontradas: ${asignaturas.length}\n`);

  // Obtener IDs de tipos de evaluación
  const tipoTarea = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Tarea' },
  });
  const tipoRevision = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Revisión de Cuaderno' },
  });
  const tipoLab = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Laboratorio' },
  });
  const tipoActInt = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Actividad Integradora' },
  });
  const tipoAutoeval = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Autoevaluación' },
  });
  const tipoExamen = await prisma.tipo_evaluacion.findFirst({
    where: { nombre: 'Examen Trimestral' },
  });

  if (
    !tipoTarea ||
    !tipoRevision ||
    !tipoLab ||
    !tipoActInt ||
    !tipoAutoeval ||
    !tipoExamen
  ) {
    console.log(' Error: No se encontraron todos los tipos de evaluación');
    await prisma.$disconnect();
    return;
  }

  // Estructura de trimestres según el documento
  const trimestres = [
    { num: 1, meses: [2, 3, 4], nombres: ['Febrero', 'Marzo', 'Abril'] },
    { num: 2, meses: [5, 6, 7], nombres: ['Mayo', 'Junio', 'Julio'] },
    { num: 3, meses: [8, 9, 10], nombres: ['Agosto', 'Septiembre', 'Octubre'] },
  ];

  let totalEvaluaciones = 0;

  for (const asignatura of asignaturas) {
    console.log(`\n ${asignatura.nombre}`);

    for (const trimestre of trimestres) {
      console.log(`\n  Trimestre ${trimestre.num}:`);

      // EVALUACIONES MENSUALES (1 de cada tipo por mes)
      for (let i = 0; i < 3; i++) {
        const mes = trimestre.meses[i];
        const nombreMes = trimestre.nombres[i];

        // 1 Tarea por mes
        await prisma.evaluacion.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_tipo_evaluacion: tipoTarea.id_tipo_evaluacion,
            id_orientador: orientador.id_orientador,
            nombre: `Tarea - ${nombreMes}`,
            anio_academico: anioAcademico,
            trimestre: trimestre.num,
            mes: mes,
          },
        });

        // 1 Revisión por mes
        await prisma.evaluacion.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_tipo_evaluacion: tipoRevision.id_tipo_evaluacion,
            id_orientador: orientador.id_orientador,
            nombre: `Revisión Cuaderno - ${nombreMes}`,
            anio_academico: anioAcademico,
            trimestre: trimestre.num,
            mes: mes,
          },
        });

        // 1 Laboratorio por mes
        await prisma.evaluacion.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_tipo_evaluacion: tipoLab.id_tipo_evaluacion,
            id_orientador: orientador.id_orientador,
            nombre: `Laboratorio - ${nombreMes}`,
            anio_academico: anioAcademico,
            trimestre: trimestre.num,
            mes: mes,
          },
        });

        totalEvaluaciones += 3;
      }

      // EVALUACIONES TRIMESTRALES (no tienen mes específico)
      // 1 Actividad Integradora
      await prisma.evaluacion.create({
        data: {
          id_asignatura: asignatura.id_asignatura,
          id_tipo_evaluacion: tipoActInt.id_tipo_evaluacion,
          id_orientador: orientador.id_orientador,
          nombre: `Actividad Integradora T${trimestre.num}`,
          anio_academico: anioAcademico,
          trimestre: trimestre.num,
          mes: null,
        },
      });

      // 1 Autoevaluación
      await prisma.evaluacion.create({
        data: {
          id_asignatura: asignatura.id_asignatura,
          id_tipo_evaluacion: tipoAutoeval.id_tipo_evaluacion,
          id_orientador: orientador.id_orientador,
          nombre: `Autoevaluación T${trimestre.num}`,
          anio_academico: anioAcademico,
          trimestre: trimestre.num,
          mes: null,
        },
      });

      // 1 Examen Trimestral
      await prisma.evaluacion.create({
        data: {
          id_asignatura: asignatura.id_asignatura,
          id_tipo_evaluacion: tipoExamen.id_tipo_evaluacion,
          id_orientador: orientador.id_orientador,
          nombre: `Examen Trimestral T${trimestre.num}`,
          anio_academico: anioAcademico,
          trimestre: trimestre.num,
          mes: null,
        },
      });

      totalEvaluaciones += 3;

      console.log(
        `     9 mensuales (3 meses × 3 tipos) + 3 trimestrales = 12 evaluaciones`,
      );
    }
  }

  console.log(`\n🎉 ¡COMPLETADO!`);
  console.log(` Total de evaluaciones creadas: ${totalEvaluaciones}`);
  console.log(
    `   Por asignatura: ${totalEvaluaciones / asignaturas.length} (12 × 3 trimestres)`,
  );
  console.log(`\n Estructura por trimestre:`);
  console.log(`   - 9 evaluaciones mensuales (3 meses × 3 tipos)`);
  console.log(`   - 3 evaluaciones trimestrales (ActInt + Autoeval + Examen)`);
  console.log(`   = 12 evaluaciones por trimestre × 3 = 36 por asignatura`);

  await prisma.$disconnect();
}

main();

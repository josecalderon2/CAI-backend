import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para crear evaluaciones de BACHILLERATO según el documento oficial
 *
 * Sistema de Bachillerato:
 * - 4 Periodos en el año
 * - 6 tipos de evaluación por periodo:
 *   1. Tarea (5%)
 *   2. Laboratorio (10%)
 *   3. Actividad Integradora (25%)
 *   4. Coevaluación (5%)
 *   5. Examen Parcial (25%)
 *   6. Examen de Periodo (30%)
 *
 * Total por asignatura: 4 periodos × 6 evaluaciones = 24 evaluaciones
 */

async function generarEvaluacionesBachillerato() {
  try {
    console.log('=== GENERANDO EVALUACIONES PARA BACHILLERATO ===\n');

    // 1. Buscar grado académico Bachillerato
    const gradoBachillerato = await prisma.grado_Academico.findFirst({
      where: { nombre: 'Bachillerato' },
    });

    if (!gradoBachillerato) {
      console.log(' No se encontró el grado académico Bachillerato');
      return;
    }

    // 2. Buscar curso de Primer Año
    const curso = await prisma.curso.findFirst({
      where: {
        nombre: 'Primer Año de Bachillerato',
      },
    });

    if (!curso) {
      console.log(' No se encontró el curso de Primer Año de Bachillerato');
      return;
    }

    console.log(` Curso: ${curso.nombre} - Sección ${curso.seccion}\n`);

    // 3. Buscar asignaturas del curso
    const asignaturas = await prisma.asignatura.findMany({
      where: {
        id_curso: curso.id_curso,
      },
    });

    if (asignaturas.length === 0) {
      console.log(' No se encontraron asignaturas para este curso');
      return;
    }

    console.log(` Se encontraron ${asignaturas.length} asignatura(s)\n`);

    // 4. Buscar orientador del curso
    if (!curso.id_orientador) {
      console.log(' El curso no tiene un orientador asignado');
      return;
    }

    const orientadorId = curso.id_orientador;

    // 5. Buscar tipos de evaluación para Bachillerato
    const tiposEvaluacion = await prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: gradoBachillerato.id_grado_academico,
        activo: true,
      },
    });

    console.log('📋 Tipos de evaluación encontrados:');
    tiposEvaluacion.forEach((tipo) => {
      console.log(`   - ${tipo.nombre} (${tipo.porcentaje}%)`);
    });
    console.log('');

    // Mapear tipos por nombre para facilitar el acceso
    const tiposMap = new Map<string, any>();
    tiposEvaluacion.forEach((tipo) => {
      tiposMap.set(tipo.nombre, tipo);
    });

    // Verificar que existan todos los tipos necesarios
    const tiposRequeridos = [
      'Tarea',
      'Laboratorio',
      'Actividad Integradora',
      'Coevaluación',
      'Examen Parcial',
      'Examen de Periodo',
    ];

    const tiposFaltantes = tiposRequeridos.filter(
      (nombre) => !tiposMap.has(nombre),
    );

    if (tiposFaltantes.length > 0) {
      console.log(
        `❌ Faltan los siguientes tipos de evaluación: ${tiposFaltantes.join(', ')}`,
      );
      return;
    }

    // Obtener el año académico actual
    const anioAcademico = new Date().getFullYear().toString();
    console.log(`📅 Año académico: ${anioAcademico}\n`);

    // 6. Generar evaluaciones para cada asignatura
    for (const asignatura of asignaturas) {
      console.log(`\n Generando evaluaciones para: ${asignatura.nombre}`);

      let evaluacionesCreadas = 0;

      // 4 Periodos
      for (let periodo = 1; periodo <= 4; periodo++) {
        console.log(`   Periodo ${periodo}:`);

        // 6 tipos de evaluación por periodo
        for (const tipoNombre of tiposRequeridos) {
          const tipoEval = tiposMap.get(tipoNombre);

          if (!tipoEval) continue;

          const nombreEvaluacion = `${tipoNombre} - Periodo ${periodo}`;

          // Verificar si ya existe
          const existente = await prisma.evaluacion.findFirst({
            where: {
              nombre: nombreEvaluacion,
              id_asignatura: asignatura.id_asignatura,
              anio_academico: anioAcademico,
              periodo: periodo,
            },
          });

          if (existente) {
            console.log(`       Ya existe: ${nombreEvaluacion}`);
            continue;
          }

          // Crear la evaluación
          await prisma.evaluacion.create({
            data: {
              nombre: nombreEvaluacion,
              puntaje_maximo: 10,
              puntaje_minimo: 0,
              id_tipo_evaluacion: tipoEval.id_tipo_evaluacion,
              id_asignatura: asignatura.id_asignatura,
              id_orientador: orientadorId,
              anio_academico: anioAcademico,
              periodo: periodo,
            },
          });

          evaluacionesCreadas++;
        }
        console.log(`       ${tiposRequeridos.length} evaluaciones creadas`);
      }

      console.log(
        `   Total creadas para ${asignatura.nombre}: ${evaluacionesCreadas}`,
      );
    }

    // 7. Resumen final
    const totalEvaluaciones = await prisma.evaluacion.count({
      where: {
        asignatura: {
          id_curso: curso.id_curso,
        },
        anio_academico: anioAcademico,
      },
    });

    console.log('\n📊 RESUMEN:');
    console.log(`   Total de evaluaciones creadas: ${totalEvaluaciones}`);
    console.log(
      `   Esperado: ${asignaturas.length} asignatura(s) × 24 evaluaciones = ${asignaturas.length * 24}`,
    );
    console.log('');
    console.log(' Proceso completado');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generarEvaluacionesBachillerato();

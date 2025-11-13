import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para limpiar todas las evaluaciones y notas existentes
 * y crear UNA evaluación por cada tipo de evaluación
 */

async function limpiarYCrearEvaluacionesSimples() {
  try {
    console.log('=== LIMPIANDO BASE DE DATOS ===\n');

    // 1. Eliminar todas las notas primero (tienen foreign key a evaluaciones)
    const notasEliminadas = await prisma.notas.deleteMany({});
    console.log(`✓ Notas eliminadas: ${notasEliminadas.count}`);

    // 2. Eliminar todas las evaluaciones
    const evaluacionesEliminadas = await prisma.evaluacion.deleteMany({});
    console.log(`✓ Evaluaciones eliminadas: ${evaluacionesEliminadas.count}\n`);

    console.log('=== CREANDO EVALUACIONES SIMPLES ===\n');

    // 3. Obtener el año actual
    const anioActual = new Date().getFullYear().toString();

    // 4. Obtener todos los tipos de evaluación activos
    const tiposEvaluacion = await prisma.tipo_evaluacion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });

    if (tiposEvaluacion.length === 0) {
      console.log('⚠ No se encontraron tipos de evaluación activos');
      return;
    }

    console.log(
      `📋 Tipos de evaluación encontrados: ${tiposEvaluacion.length}\n`,
    );

    // 5. Obtener la primera asignatura disponible
    const asignatura = await prisma.asignatura.findFirst({
      include: {
        orientadores: {
          where: { activo: true },
          include: {
            orientador: true,
          },
        },
      },
    });

    if (!asignatura || asignatura.orientadores.length === 0) {
      console.log('⚠ No se encontró una asignatura con orientador asignado');
      return;
    }

    const orientador = asignatura.orientadores[0].orientador;
    console.log(`✓ Usando asignatura: ${asignatura.nombre}`);
    console.log(
      `✓ Usando orientador: ${orientador.nombre} ${orientador.apellido}\n`,
    );

    // 6. Crear UNA evaluación por cada tipo
    let evaluacionesCreadas = 0;

    for (const tipo of tiposEvaluacion) {
      const evaluacion = await prisma.evaluacion.create({
        data: {
          nombre: `${tipo.nombre} - Ejemplo`,
          puntaje_maximo: 10,
          puntaje_minimo: 0,
          id_tipo_evaluacion: tipo.id_tipo_evaluacion,
          id_asignatura: asignatura.id_asignatura,
          id_orientador: orientador.id_orientador,
          anio_academico: anioActual,
          trimestre: 1, // Primer trimestre por defecto
        },
      });

      console.log(
        `✓ Creada evaluación: ${evaluacion.nombre} (${tipo.porcentaje}%)`,
      );
      evaluacionesCreadas++;
    }

    console.log(`\n=== RESUMEN ===`);
    console.log(`✓ Total de evaluaciones creadas: ${evaluacionesCreadas}`);
    console.log(`✓ Año académico: ${anioActual}`);
    console.log(`✓ Asignatura: ${asignatura.nombre}`);
    console.log(`✓ Orientador: ${orientador.nombre} ${orientador.apellido}`);
    console.log('\n✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
limpiarYCrearEvaluacionesSimples();

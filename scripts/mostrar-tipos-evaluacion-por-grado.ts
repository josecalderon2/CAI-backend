import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para mostrar los tipos de evaluación agrupados por grado académico
 */

async function mostrarTiposEvaluacionPorGrado() {
  try {
    console.log('=== TIPOS DE EVALUACIÓN POR GRADO ACADÉMICO ===\n');

    // Obtener todos los grados académicos
    const grados = await prisma.grado_Academico.findMany({
      include: {
        tipos_evaluacion: {
          where: { activo: true },
          orderBy: { nombre: 'asc' },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    let totalTipos = 0;

    for (const grado of grados) {
      console.log(`\n📚 ${grado.nombre.toUpperCase()}`);
      console.log('─'.repeat(50));

      if (grado.tipos_evaluacion.length === 0) {
        console.log('  ⚠ No hay tipos de evaluación configurados');
      } else {
        let sumaPortcentajes = 0;

        grado.tipos_evaluacion.forEach((tipo, index) => {
          console.log(
            `  ${index + 1}. ${tipo.nombre.padEnd(30)} ${tipo.porcentaje}%`,
          );
          sumaPortcentajes += tipo.porcentaje;
        });

        console.log('─'.repeat(50));
        console.log(`  Total de tipos: ${grado.tipos_evaluacion.length}`);
        console.log(`  Suma de porcentajes: ${sumaPortcentajes}%`);

        if (sumaPortcentajes !== 100) {
          console.log(`  ⚠ ADVERTENCIA: Los porcentajes NO suman 100%`);
        } else {
          console.log(`  ✓ Los porcentajes suman correctamente 100%`);
        }

        totalTipos += grado.tipos_evaluacion.length;
      }
    }

    console.log('\n=== RESUMEN ===');
    console.log(`✓ Total de grados académicos: ${grados.length}`);
    console.log(`✓ Total de tipos de evaluación: ${totalTipos}`);
    console.log('\n✅ Consulta completada');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
mostrarTiposEvaluacionPorGrado();

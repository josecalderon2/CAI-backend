// prisma/seed/index.ts
import { PrismaClient } from '@prisma/client';
import { seedCargos } from './seeds/01-cargos.seed';
import { seedUsuarios } from './seeds/02-usuarios.seed';
import { seedJornadas } from './seeds/03-jornadas.seed';
import { seedGradosAcademicos } from './seeds/04-grados-academicos.seed';
import { seedParentescos } from './seeds/05-parentescos.seed';
import { seedCatalogosEvaluacion } from './seeds/06-catalogos-evaluacion.seed';
import { seedInfracciones } from './seeds/07-infracciones.seed';
import { seedCursosYAsignaturas } from './seeds/08-cursos-asignaturas.seed';
import { seedAlumnosInscripciones } from './seeds/09-alumnos-inscripciones.seed';
import { seedAsistenciasConductasTrimestre3 } from './seeds/10-asistencias-conductas-t3.seed';

const prisma = new PrismaClient();

/**
 * Configuración de seeds
 * Puedes habilitar/deshabilitar seeds individuales
 */
const SEED_CONFIG = {
  cargos: true,
  usuarios: true,
  jornadas: true,
  gradosAcademicos: true,
  parentescos: true,
  catalogosEvaluacion: true,
  infracciones: true,
  cursosAsignaturas: true,
  alumnosInscripciones: true,
  asistenciasConductasT3: true, // Nuevo seed para datos de prueba trimestre 3
};

async function main() {
  console.log('🌱 Iniciando proceso de seeding...\n');
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'No configurada',
  );
  console.log('');

  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos\n');

    let cargos: { adminId: number; paId: number; oriId: number } | undefined;

    // 1. Cargos administrativos (requerido para usuarios)
    if (SEED_CONFIG.cargos) {
      cargos = await seedCargos(prisma);
    }

    // 2. Usuarios (requiere cargos)
    if (SEED_CONFIG.usuarios && cargos) {
      await seedUsuarios(prisma, cargos);
    }

    // 3. Jornadas (requerido para grados académicos)
    if (SEED_CONFIG.jornadas) {
      await seedJornadas(prisma);
    }

    // 4. Grados académicos (requiere jornadas)
    if (SEED_CONFIG.gradosAcademicos) {
      await seedGradosAcademicos(prisma);
    }

    // 5. Parentescos
    if (SEED_CONFIG.parentescos) {
      await seedParentescos(prisma);
    }

    // 6. Catálogos de evaluación (requerido para asignaturas)
    if (SEED_CONFIG.catalogosEvaluacion) {
      await seedCatalogosEvaluacion(prisma);
    }

    // 7. Catálogo de infracciones
    if (SEED_CONFIG.infracciones) {
      await seedInfracciones(prisma);
    }

    // 8. Cursos y asignaturas (requiere usuarios, grados y catálogos)
    if (SEED_CONFIG.cursosAsignaturas) {
      await seedCursosYAsignaturas(prisma);
    }

    // 9. Alumnos e inscripciones (requiere cursos)
    if (SEED_CONFIG.alumnosInscripciones) {
      await seedAlumnosInscripciones(prisma);
    }

    // 10. Asistencias y conductas trimestre 3 (requiere alumnos, cursos, asignaturas, orientadores)
    if (SEED_CONFIG.asistenciasConductasT3) {
      await seedAsistenciasConductasTrimestre3(prisma);
    }

    console.log('\n🎉 Proceso de seeding completado exitosamente!');
  } catch (error) {
    console.error('\n❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Desconectado de la base de datos');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Error fatal en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

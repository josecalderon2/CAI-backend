import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAlumnosConResponsables() {
  try {
    const alumnos = await prisma.alumno.findMany({
      include: {
        responsables: {
          include: {
            responsable: true,
            parentesco: true,
          },
        },
      },
    });

    console.log('\n===== ALUMNOS CON SUS RESPONSABLES =====\n');

    for (const alumno of alumnos) {
      console.log(
        `Alumno: ${alumno.nombre} ${alumno.apellido} (ID: ${alumno.id_alumno})`,
      );

      if (alumno.responsables.length === 0) {
        console.log('  No tiene responsables registrados');
      } else {
        alumno.responsables.forEach((ar) => {
          const responsable = ar.responsable;
          const parentesco = ar.parentesco
            ? ar.parentesco.nombre
            : ar.parentescoLibre || 'Sin especificar';
          const roles = [
            ar.esPrincipal ? 'Principal' : null,
            ar.firma ? 'Puede firmar' : null,
            ar.permiteTraslado ? 'Permite traslado' : null,
            ar.puedeRetirarAlumno ? 'Puede retirar alumno' : null,
          ]
            .filter(Boolean)
            .join(', ');

          console.log(`  - ${responsable.nombre} ${responsable.apellido}`);
          console.log(`    Parentesco: ${parentesco}`);
          console.log(`    Roles: ${roles || 'Ninguno'}`);
          if (responsable.telefono)
            console.log(`    Teléfono: ${responsable.telefono}`);
          console.log('');
        });
      }
      console.log('-----------------------------------');
    }
  } catch (error) {
    console.error('Error al consultar alumnos con responsables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAlumnosConResponsables();

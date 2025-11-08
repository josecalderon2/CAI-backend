import { PrismaClient } from '@prisma/client';

export async function seedTiposActividadEvaluacion(prisma: PrismaClient) {
  console.log('🎯 Seeding Tipos de Actividad de Evaluación...');

  const tiposActividad = [
    {
      nombre: 'Tarea',
      activo: true,
      orden: 1,
    },
    {
      nombre: 'Revisión de libros y cuadernos',
      activo: true,
      orden: 2,
    },
    {
      nombre: 'Laboratorio escrito',
      activo: true,
      orden: 3,
    },
    {
      nombre: 'Examen mensual',
      activo: true,
      orden: 4,
    },
  ];

  for (const tipo of tiposActividad) {
    await prisma.tipoActividadEvaluacion.upsert({
      where: { nombre: tipo.nombre },
      update: {
        activo: tipo.activo,
        orden: tipo.orden,
      },
      create: tipo,
    });
  }

  console.log(`✅ ${tiposActividad.length} tipos de actividad creados`);

  // Crear datos de prueba de evaluaciones para algunos alumnos
  console.log('📝 Creando datos de prueba de evaluaciones...');

  // Obtener algunos alumnos y asignaturas para crear ejemplos
  const alumnos = await prisma.alumno.findMany({
    take: 3,
    where: { activo: true },
  });

  const asignaturas = await prisma.asignatura.findMany({
    take: 2,
  });

  if (alumnos.length > 0 && asignaturas.length > 0) {
    const tiposCreados = await prisma.tipoActividadEvaluacion.findMany({
      orderBy: { orden: 'asc' },
    });

    // Crear una nota mensual de ejemplo para cada alumno
    for (const alumno of alumnos) {
      for (const asignatura of asignaturas) {
        try {
          // Ejemplo: Febrero (Trimestre 1) - 28% de aporte
          const notaMensual = await prisma.notaMensual.create({
            data: {
              id_alumno: alumno.id_alumno,
              id_asignatura: asignatura.id_asignatura,
              mes: 'Febrero',
              trimestre: 1,
              anio_academico: '2025',
              examen_mensual: 9.0,
              promedio_puro_actividades: 8.25,
              promedio_70_actividades: 5.78,
              promedio_30_examen: 2.7,
              nota_mensual: 8.48,
              porcentaje_aporte: 28,
              aporte_al_trimestre: 2.37,
              actividades: {
                create: [
                  {
                    id_tipo_actividad:
                      tiposCreados.find((t) => t.nombre === 'Tarea')
                        ?.id_tipo_actividad || 1,
                    numero_actividad: 1,
                    nota: 8.0,
                  },
                  {
                    id_tipo_actividad:
                      tiposCreados.find(
                        (t) => t.nombre === 'Revisión de libros y cuadernos',
                      )?.id_tipo_actividad || 2,
                    numero_actividad: null,
                    nota: 9.0,
                  },
                  {
                    id_tipo_actividad:
                      tiposCreados.find((t) => t.nombre === 'Tarea')
                        ?.id_tipo_actividad || 1,
                    numero_actividad: 2,
                    nota: 7.5,
                  },
                  {
                    id_tipo_actividad:
                      tiposCreados.find(
                        (t) => t.nombre === 'Laboratorio escrito',
                      )?.id_tipo_actividad || 3,
                    numero_actividad: 1,
                    nota: 8.5,
                  },
                ],
              },
            },
          });

          console.log(
            `✅ Nota mensual creada para alumno ${alumno.nombre} ${alumno.apellido} en ${asignatura.nombre}`,
          );
        } catch (error) {
          // Si ya existe, omitir
          console.log(
            `⚠️  Nota mensual ya existe para alumno ${alumno.id_alumno} - asignatura ${asignatura.id_asignatura}`,
          );
        }
      }
    }
  }

  console.log('✅ Tipos de Actividad de Evaluación seeded correctamente');
}

import { PrismaClient } from '@prisma/client';

export async function seedTiposActividadEvaluacion(prisma: PrismaClient) {
  console.log('🎯 Seeding Tipos de Actividad de Evaluación...');

  // ============================================
  // TIPOS DE ACTIVIDAD PARA EDUCACIÓN BÁSICA 2025
  // ============================================
  // NUEVO SISTEMA BÁSICA 2025:
  // Mensual (35%): Tareas 5% + Revisión 15% + Laboratorio 15%
  // Trimestral (65%): Act.Integradora 25% + Autoevaluación 10% + Examen 30%

  const tiposActividadBasica = [
    // ===== COMPONENTES MENSUALES =====
    {
      nombre: 'Tareas (Mensual)',
      activo: true,
      orden: 1,
      peso_basica: 0.05, // 5%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'MENSUAL',
      aplica_a_nivel: ['BASICA'],
    },
    {
      nombre: 'Revisión de libros y cuadernos (Mensual)',
      activo: true,
      orden: 2,
      peso_basica: 0.15, // 15%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'MENSUAL',
      aplica_a_nivel: ['BASICA'],
    },
    {
      nombre: 'Laboratorio escrito (Mensual)',
      activo: true,
      orden: 3,
      peso_basica: 0.15, // 15%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'MENSUAL',
      aplica_a_nivel: ['BASICA'],
    },
    // ===== COMPONENTES TRIMESTRALES =====
    {
      nombre: 'Actividad Integradora (Trimestral)',
      activo: true,
      orden: 4,
      peso_basica: 0.25, // 25%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'TRIMESTRAL',
      aplica_a_nivel: ['BASICA'],
    },
    {
      nombre: 'Autoevaluación (Trimestral)',
      activo: true,
      orden: 5,
      peso_basica: 0.1, // 10%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'TRIMESTRAL',
      aplica_a_nivel: ['BASICA'],
    },
    {
      nombre: 'Examen (Trimestral)',
      activo: true,
      orden: 6,
      peso_basica: 0.3, // 30%
      peso_bachillerato: null,
      categoria_bachillerato: null,
      categoria_basica: 'TRIMESTRAL',
      aplica_a_nivel: ['BASICA'],
    },
  ];

  // ============================================
  // TIPOS DE ACTIVIDAD PARA BACHILLERATO
  // ============================================
  // Categorizados con ponderaciones específicas:
  // - ACTIVIDAD_INTEGRADORA: 25%
  // - TAREA: 5%
  // - COEVALUACION: 5%
  // - LABORATORIO: 10%
  // + Examen Parcial: 25%
  // + Examen del Periodo: 30%

  const tiposActividadBachillerato = [
    {
      nombre: 'Actividad Integradora',
      activo: true,
      orden: 1,
      peso_basica: null,
      peso_bachillerato: 0.25,
      categoria_bachillerato: 'ACTIVIDAD_INTEGRADORA',
      aplica_a_nivel: ['BACHILLERATO'],
    },
    {
      nombre: 'Tarea',
      activo: true,
      orden: 2,
      peso_basica: null,
      peso_bachillerato: 0.05,
      categoria_bachillerato: 'TAREA',
      aplica_a_nivel: ['BACHILLERATO'],
    },
    {
      nombre: 'Coevaluación',
      activo: true,
      orden: 3,
      peso_basica: null,
      peso_bachillerato: 0.05,
      categoria_bachillerato: 'COEVALUACION',
      aplica_a_nivel: ['BACHILLERATO'],
    },
    {
      nombre: 'Laboratorio',
      activo: true,
      orden: 4,
      peso_basica: null,
      peso_bachillerato: 0.1,
      categoria_bachillerato: 'LABORATORIO',
      aplica_a_nivel: ['BACHILLERATO'],
    },
  ];

  // Combinar todos los tipos de actividad
  const todosTiposActividad = [
    ...tiposActividadBasica,
    ...tiposActividadBachillerato,
  ];

  console.log(`📚 Creando ${tiposActividadBasica.length} tipos para BÁSICA`);
  console.log(
    `🎓 Creando ${tiposActividadBachillerato.length} tipos para BACHILLERATO`,
  );

  for (const tipo of todosTiposActividad) {
    await prisma.tipoActividadEvaluacion.upsert({
      where: { nombre: tipo.nombre },
      update: {
        activo: tipo.activo,
        orden: tipo.orden,
        peso_basica: tipo.peso_basica,
        peso_bachillerato: tipo.peso_bachillerato,
        categoria_bachillerato: tipo.categoria_bachillerato,
        aplica_a_nivel: tipo.aplica_a_nivel,
      },
      create: tipo,
    });
  }

  console.log(`✅ ${todosTiposActividad.length} tipos de actividad creados`);
  console.log(
    '   └─ BÁSICA: Tarea, Revisión de libros y cuadernos, Laboratorio escrito',
  );
  console.log(
    '   └─ BACHILLERATO: Actividad Integradora, Tarea, Coevaluación, Laboratorio',
  );

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

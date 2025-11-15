import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvaluacionesService } from '../evaluaciones/evaluaciones.service';

@Injectable()
export class ReportesNotasService {
  constructor(
    private prisma: PrismaService,
    private evaluacionesService: EvaluacionesService,
  ) {}

  async evaluacionesPorAsignatura(
    id_asignatura?: number,
    anio?: string,
    trimestre?: number,
    periodo?: number,
  ) {
    if (!id_asignatura) {
      throw new NotFoundException('Se requiere id_asignatura');
    }

    const anioUsar = anio || new Date().getFullYear().toString();
    return this.evaluacionesService.calcularPorcentajesReales(
      id_asignatura,
      anioUsar,
      trimestre,
      periodo,
    );
  }

  async alumnosConCalificaciones(id_evaluacion: number, id_orientador: number) {
    return this.evaluacionesService.getAlumnosConCalificaciones(
      id_evaluacion,
      id_orientador,
    );
  }

  async notasHistoricasPorAlumno(id_alumno: number, anio?: string) {
    const notas = await this.prisma.notas.findMany({
      where: { id_alumno },
      include: {
        asignatura: true,
        evaluacion: { include: { tipoEvaluacion: true } },
      },
      orderBy: { fecha_registro: 'desc' },
    });

    if (anio) {
      return notas.filter(
        (n) => n.evaluacion?.anio_academico === anio || !n.evaluacion,
      );
    }

    return notas;
  }

  async promediosPorAlumno(id_alumno: number, anio?: string) {
    const anioUsar = anio || new Date().getFullYear().toString();

    const [mensuales, trimestrales, periodos, finalesAsignatura] =
      await Promise.all([
        this.prisma.promedioMensual.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioTrimestral.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioPeriodo.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
        this.prisma.promedioFinalAsignatura.findMany({
          where: { alumnoId: id_alumno, anioAcademico: anioUsar },
          include: { asignatura: true },
        }),
      ]);

    const finalAlumno = await this.prisma.promedioFinalAlumno.findFirst({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
    });

    return {
      anio: anioUsar,
      mensuales: mensuales || [],
      trimestrales: trimestrales || [],
      periodos: periodos || [],
      finalesAsignatura: finalesAsignatura || [],
      finalAlumno: finalAlumno || null,
    };
  }

  async rankingPorCurso(id_curso: number, anio?: string, top = 10) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Obtener todos los alumnos activos del curso
    const alumnosCurso = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: id_curso,
        anioAcademico: anioUsar,
        estado: 'ACTIVO',
      },
      include: {
        alumno: true,
      },
    });

    if (alumnosCurso.length === 0) {
      return [];
    }

    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: id_curso },
      select: { id_asignatura: true },
    });

    const asignaturasIds = asignaturas.map((a) => a.id_asignatura);

    // Obtener todas las asignaturas del curso con detalles
    const asignaturasDetalle = await this.prisma.asignatura.findMany({
      where: { id_curso: id_curso },
      select: {
        id_asignatura: true,
        nombre: true,
      },
    });

    // Obtener todas las notas de los alumnos del curso
    const alumnosIds = alumnosCurso.map((ac) => ac.alumnoId);

    const notas = await this.prisma.notas.findMany({
      where: {
        id_alumno: { in: alumnosIds },
        id_asignatura: { in: asignaturasIds },
        evaluacion: {
          anio_academico: anioUsar,
        },
      },
      include: {
        evaluacion: {
          select: {
            id_evaluacion: true,
            id_asignatura: true,
            nombre: true,
            mes: true,
            trimestre: true,
            tipoEvaluacion: {
              select: {
                nombre: true,
                porcentaje: true,
              },
            },
          },
        },
      },
      orderBy: [
        { evaluacion: { mes: 'asc' } },
        { evaluacion: { id_evaluacion: 'asc' } },
      ],
    });

    // Calcular promedio por alumno con desglose detallado
    const ranking = alumnosCurso
      .map((ac) => {
        // Filtrar notas del alumno
        const notasAlumno = notas.filter((n) => n.id_alumno === ac.alumnoId);

        if (notasAlumno.length === 0) {
          return null; // No incluir alumnos sin notas
        }

        // Calcular promedio y desglose por asignatura
        const promediosPorAsignatura = new Map<
          number,
          {
            notas: any[];
            promedio: number;
            nombreAsignatura: string;
          }
        >();

        notasAlumno.forEach((nota) => {
          const asigId = nota.evaluacion?.id_asignatura;
          if (asigId && nota.calificacion !== null) {
            if (!promediosPorAsignatura.has(asigId)) {
              const asigNombre =
                asignaturasDetalle.find((a) => a.id_asignatura === asigId)
                  ?.nombre || 'Sin nombre';
              promediosPorAsignatura.set(asigId, {
                notas: [],
                promedio: 0,
                nombreAsignatura: asigNombre,
              });
            }
            promediosPorAsignatura.get(asigId)!.notas.push({
              id_nota: nota.id_nota,
              calificacion: nota.calificacion,
              fecha_registro: nota.fecha_registro,
              evaluacion: {
                id_evaluacion: nota.evaluacion?.id_evaluacion,
                nombre: nota.evaluacion?.nombre,
                tipo: nota.evaluacion?.tipoEvaluacion?.nombre,
                porcentaje: nota.evaluacion?.tipoEvaluacion?.porcentaje,
                mes: nota.evaluacion?.mes,
                trimestre: nota.evaluacion?.trimestre,
              },
            });
          }
        });

        // Calcular promedios por asignatura
        const detalleAsignaturas: any[] = [];
        const promediosAsignaturas: number[] = [];

        promediosPorAsignatura.forEach((data, asigId) => {
          const notasCalif = data.notas.map((n) => n.calificacion);
          const promAsig =
            notasCalif.reduce((sum, nota) => sum + nota, 0) / notasCalif.length;
          const promedioRedondeado = Math.round(promAsig * 100) / 100;

          promediosAsignaturas.push(promedioRedondeado);

          detalleAsignaturas.push({
            id_asignatura: asigId,
            nombre: data.nombreAsignatura,
            promedio: promedioRedondeado,
            total_notas: data.notas.length,
            nota_mas_alta: Math.max(...notasCalif),
            nota_mas_baja: Math.min(...notasCalif),
            notas: data.notas,
          });
        });

        const promedioGeneral =
          promediosAsignaturas.length > 0
            ? Math.round(
                (promediosAsignaturas.reduce((sum, p) => sum + p, 0) /
                  promediosAsignaturas.length) *
                  100,
              ) / 100
            : 0;

        return {
          alumnoId: ac.alumnoId,
          cursoId: id_curso,
          anioAcademico: anioUsar,
          promedioGeneral,
          totalNotas: notasAlumno.length,
          totalAsignaturas: promediosPorAsignatura.size,
          detalleAsignaturas: detalleAsignaturas.sort(
            (a, b) => b.promedio - a.promedio,
          ),
          alumno: ac.alumno,
        };
      })
      .filter((item) => item !== null) // Remover alumnos sin notas
      .sort((a, b) => b!.promedioGeneral - a!.promedioGeneral); // Ordenar descendente

    // Calcular estadísticas del curso completo (antes de aplicar el top)
    const promediosGenerales = ranking.map((r) => r!.promedioGeneral);
    const promedioCurso =
      promediosGenerales.length > 0
        ? Math.round(
            (promediosGenerales.reduce((sum, p) => sum + p, 0) /
              promediosGenerales.length) *
              100,
          ) / 100
        : 0;

    const notaMasAltaCurso = Math.max(...promediosGenerales);
    const notaMasBajaCurso = Math.min(...promediosGenerales);

    // Agregar estadísticas comparativas a cada alumno
    const rankingConEstadisticas = ranking.map((item, index) => {
      const diferenciaConPromedio =
        Math.round((item!.promedioGeneral - promedioCurso) * 100) / 100;
      const posicionPorcentaje =
        Math.round(((index + 1) / ranking.length) * 100 * 100) / 100;

      return {
        ...item,
        posicion: index + 1,
        estadisticasComparativas: {
          promedioCurso: promedioCurso,
          diferenciaConPromedio: diferenciaConPromedio,
          notaMasAltaCurso: notaMasAltaCurso,
          notaMasBajaCurso: notaMasBajaCurso,
          posicionPorcentaje: posicionPorcentaje, // Ej: 10% = top 10%
          totalAlumnosConNotas: ranking.length,
          superaPromedioCurso: item!.promedioGeneral > promedioCurso,
        },
      };
    });

    // Aplicar el límite del top N después de agregar estadísticas
    return rankingConEstadisticas.slice(0, top);
  }

  async distribucionPorAsignatura(id_asignatura: number, anio?: string) {
    const notas = await this.prisma.notas.findMany({
      where: { id_asignatura: id_asignatura },
      include: { evaluacion: true },
    });

    const filtered = anio
      ? notas.filter(
          (n) => n.evaluacion?.anio_academico === anio || !n.evaluacion,
        )
      : notas;
    const valores = filtered
      .map((n) => n.calificacion)
      .filter((v) => v !== null && v !== undefined) as number[];

    if (valores.length === 0)
      return {
        count: 0,
        min: null,
        max: null,
        mean: null,
        median: null,
        stddev: null,
      };

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const mean = valores.reduce((a, b) => a + b, 0) / valores.length;
    const sorted = [...valores].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance =
      valores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / valores.length;
    const stddev = Math.sqrt(variance);

    return { count: valores.length, min, max, mean, median, stddev };
  }

  /**
   * Lista todas las evaluaciones con su estado de pendientes
   * Permite filtrar por curso y/o asignatura
   * OPTIMIZADO: usa SQL raw para mejor rendimiento
   */
  async listaEvaluacionesPendientes(
    cursoId?: number,
    asignaturaId?: number,
    anio?: string,
  ) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Construir filtros para la consulta SQL
    const whereClauses: string[] = [`e.anio_academico = '${anioUsar}'`];
    if (asignaturaId) {
      whereClauses.push(`e.id_asignatura = ${asignaturaId}`);
    } else if (cursoId) {
      whereClauses.push(`a.id_curso = ${cursoId}`);
    }

    const whereSQL = whereClauses.join(' AND ');

    // Consulta SQL optimizada que calcula todo en una sola query
    const resultados = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        e.id_evaluacion,
        e.nombre as evaluacion_nombre,
        e.trimestre,
        e.mes,
        te.nombre as tipo_nombre,
        te.porcentaje as tipo_porcentaje,
        a.id_asignatura,
        a.nombre as asignatura_nombre,
        c.id_curso,
        c.nombre as curso_nombre,
        COUNT(DISTINCT ac.alumnoId) as total_alumnos,
        COUNT(DISTINCT n.id_nota) as registrados
      FROM "Evaluacion" e
      INNER JOIN "Asignatura" a ON e.id_asignatura = a.id_asignatura
      INNER JOIN "Curso" c ON a.id_curso = c.id_curso
      LEFT JOIN "Tipo_evaluacion" te ON e.id_tipo_evaluacion = te.id_tipo_evaluacion
      LEFT JOIN "AlumnoCurso" ac ON c.id_curso = ac."cursoId" 
        AND ac."anioAcademico" = '${anioUsar}' 
        AND ac.estado = 'ACTIVO'
      LEFT JOIN "Notas" n ON e.id_evaluacion = n.id_evaluacion 
        AND n.id_alumno = ac.alumnoId
      WHERE ${whereSQL}
      GROUP BY 
        e.id_evaluacion, e.nombre, e.trimestre, e.mes,
        te.nombre, te.porcentaje,
        a.id_asignatura, a.nombre,
        c.id_curso, c.nombre
      ORDER BY 
        c.nombre ASC,
        a.nombre ASC,
        e.trimestre ASC NULLS LAST,
        e.mes ASC NULLS LAST,
        e.nombre ASC
    `);

    // Procesar resultados
    const evaluaciones = resultados.map((row) => {
      const totalAlumnos = Number(row.total_alumnos) || 0;
      const registrados = Number(row.registrados) || 0;
      const pendientes = totalAlumnos - registrados;

      return {
        id_evaluacion: row.id_evaluacion,
        nombre: row.evaluacion_nombre,
        tipo: row.tipo_nombre || 'Sin tipo',
        porcentaje: row.tipo_porcentaje || 0,
        trimestre: row.trimestre,
        mes: row.mes,
        asignatura: {
          id_asignatura: row.id_asignatura,
          nombre: row.asignatura_nombre,
          curso: {
            id_curso: row.id_curso,
            nombre: row.curso_nombre,
          },
        },
        total_alumnos: totalAlumnos,
        registrados,
        pendientes,
        porcentaje_completado:
          totalAlumnos === 0
            ? 100
            : Math.round((registrados / totalAlumnos) * 100 * 100) / 100,
      };
    });

    // Agrupar por curso y asignatura
    const evaluacionesAgrupadas = evaluaciones.reduce(
      (acc, ev) => {
        const cursoNombre = ev.asignatura.curso.nombre;
        const asignaturaNombre = ev.asignatura.nombre;

        if (!acc[cursoNombre]) {
          acc[cursoNombre] = {};
        }
        if (!acc[cursoNombre][asignaturaNombre]) {
          acc[cursoNombre][asignaturaNombre] = [];
        }

        acc[cursoNombre][asignaturaNombre].push(ev);
        return acc;
      },
      {} as Record<string, Record<string, any[]>>,
    );

    return {
      anio_academico: anioUsar,
      filtros: {
        cursoId: cursoId || null,
        asignaturaId: asignaturaId || null,
      },
      total_evaluaciones: evaluaciones.length,
      total_pendientes: evaluaciones.reduce(
        (sum, ev) => sum + ev.pendientes,
        0,
      ),
      evaluaciones,
      evaluaciones_agrupadas: evaluacionesAgrupadas,
    };
  }

  async pendientesPorEvaluacion(id_evaluacion: number) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      include: { asignatura: { include: { curso: true } } },
      where: { id_evaluacion },
    });
    if (!evaluacion) throw new NotFoundException('Evaluación no encontrada');

    const cursoId = evaluacion.asignatura?.id_curso;
    const anio = evaluacion.anio_academico;
    if (!cursoId) throw new NotFoundException('Curso asociado no encontrado');

    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: { cursoId: cursoId, anioAcademico: anio, estado: 'ACTIVO' },
      include: { alumno: true },
    });
    const alumnosIds = inscripciones.map((i) => i.alumnoId);

    const notas = await this.prisma.notas.findMany({
      where: { id_evaluacion, id_alumno: { in: alumnosIds } },
    });

    const conNota = new Set(notas.map((n) => n.id_alumno));
    const pendientes = inscripciones
      .filter((i) => !conNota.has(i.alumnoId))
      .map((i) => ({
        id_alumno: i.alumnoId,
        nombre: i.alumno.nombre,
        apellido: i.alumno.apellido,
      }));

    return {
      evaluacion: {
        id_evaluacion: evaluacion.id_evaluacion,
        nombre: evaluacion.nombre,
      },
      total_alumnos: alumnosIds.length,
      registrados: notas.length,
      pendientes,
    };
  }

  async boletaAlumno(id_alumno: number, anio?: string) {
    const anioUsar = anio || new Date().getFullYear().toString();

    const finales = await this.prisma.promedioFinalAsignatura.findMany({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
      include: { asignatura: true },
    });

    const finalAlumno = await this.prisma.promedioFinalAlumno.findFirst({
      where: { alumnoId: id_alumno, anioAcademico: anioUsar },
    });

    const conductas = await this.prisma.conducta.findMany({
      where: { id_alumno, anio_academico: anioUsar },
      include: { infraccion: true },
    });

    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno, anio_academico: anioUsar },
    });
    const totalAsist = asistencias.length;
    const presentes = asistencias.filter((a) => a.estado === 'P').length;
    const porcentajeAsistencia =
      totalAsist === 0
        ? null
        : Math.round((presentes / totalAsist) * 100 * 100) / 100;

    return {
      anio: anioUsar,
      finalesAsignatura: finales,
      finalAlumno: finalAlumno || null,
      conductasResumen: {
        total: conductas.length,
        detalles: conductas,
      },
      asistencia: {
        total: totalAsist,
        presentes,
        porcentaje: porcentajeAsistencia,
      },
    };
  }

  /**
   * 📅 Boleta mensual detallada de un alumno
   * Muestra todas las evaluaciones y notas de todas las asignaturas en un mes específico
   * Para entregar a padres como reporte mensual
   */
  async boletaMensualAlumno(id_alumno: number, mes: number, anio?: string) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Validar mes
    if (mes < 1 || mes > 12) {
      throw new NotFoundException('El mes debe estar entre 1 y 12');
    }

    // Obtener información del alumno y su curso
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      include: {
        inscripciones: {
          where: { anioAcademico: anioUsar, estado: 'ACTIVO' },
          include: {
            curso: {
              include: {
                gradoAcademico: true,
                orientador: {
                  select: {
                    id_orientador: true,
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!alumno || alumno.inscripciones.length === 0) {
      throw new NotFoundException(
        'Alumno no encontrado o sin inscripción activa',
      );
    }

    const inscripcion = alumno.inscripciones[0];
    const curso = inscripcion.curso;
    const gradoNombre = curso.gradoAcademico?.nombre || '';
    const esBachillerato = gradoNombre.includes('Bachillerato');

    // Determinar el trimestre o periodo según el mes
    let trimestre: number | null = null;
    let periodo: number | null = null;

    if (esBachillerato) {
      // Bachillerato: 4 periodos (3 meses cada uno)
      periodo = Math.ceil(mes / 3);
    } else {
      // Básica: 3 trimestres (4 meses cada uno aprox)
      if (mes <= 4) trimestre = 1;
      else if (mes <= 8) trimestre = 2;
      else trimestre = 3;
    }

    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: curso.id_curso },
      include: {
        orientadores: {
          select: {
            orientador: {
              select: {
                id_orientador: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Para cada asignatura, obtener evaluaciones y notas del mes
    const asignaturasConNotas = await Promise.all(
      asignaturas.map(async (asignatura) => {
        const evaluaciones = await this.prisma.evaluacion.findMany({
          where: {
            id_asignatura: asignatura.id_asignatura,
            anio_academico: anioUsar,
            mes: mes,
          },
          include: {
            tipoEvaluacion: true,
            notas: {
              where: { id_alumno },
            },
          },
          orderBy: [
            { tipoEvaluacion: { nombre: 'asc' } },
            { id_evaluacion: 'asc' },
          ],
        });

        const evaluacionesConNota = evaluaciones.map((evaluacion) => ({
          id_evaluacion: evaluacion.id_evaluacion,
          nombre: evaluacion.nombre,
          tipo: evaluacion.tipoEvaluacion.nombre,
          porcentaje: evaluacion.tipoEvaluacion.porcentaje,
          nota: evaluacion.notas[0]?.calificacion || null,
          fecha_registro: evaluacion.notas[0]?.fecha_registro || null,
        }));

        // Obtener promedio mensual calculado (si existe)
        let promedioMensual = await this.prisma.promedioMensual.findFirst({
          where: {
            alumnoId: id_alumno,
            asignaturaId: asignatura.id_asignatura,
            anioAcademico: anioUsar,
            mes: mes,
          },
        });

        // Si no existe el promedio mensual, calcularlo dinámicamente
        if (!promedioMensual && evaluacionesConNota.length > 0) {
          // Agrupar evaluaciones por tipo
          const tareas = evaluacionesConNota.filter(
            (e) => e.tipo === 'Tarea' && e.nota !== null,
          );
          const revisiones = evaluacionesConNota.filter(
            (e) => e.tipo === 'Revisión de Cuaderno' && e.nota !== null,
          );
          const laboratorios = evaluacionesConNota.filter(
            (e) => e.tipo === 'Laboratorio' && e.nota !== null,
          );

          // Calcular promedios por tipo
          const promedioTareas =
            tareas.length > 0
              ? tareas.reduce((sum, e) => sum + (e.nota || 0), 0) /
                tareas.length
              : null;

          const promedioRevisiones =
            revisiones.length > 0
              ? revisiones.reduce((sum, e) => sum + (e.nota || 0), 0) /
                revisiones.length
              : null;

          const promedioLaboratorios =
            laboratorios.length > 0
              ? laboratorios.reduce((sum, e) => sum + (e.nota || 0), 0) /
                laboratorios.length
              : null;

          // Calcular promedio mensual usando la fórmula:
          // PromMes = (0.05·Tareas + 0.15·Revisiones + 0.15·Lab) / 0.35
          let suma = 0;
          let divisor = 0;

          if (promedioTareas !== null) {
            suma += 0.05 * promedioTareas;
            divisor += 0.05;
          }
          if (promedioRevisiones !== null) {
            suma += 0.15 * promedioRevisiones;
            divisor += 0.15;
          }
          if (promedioLaboratorios !== null) {
            suma += 0.15 * promedioLaboratorios;
            divisor += 0.15;
          }

          const calculoPromedioMensual =
            divisor > 0 ? Math.round((suma / divisor) * 100) / 100 : null;

          // Crear objeto temporal con el cálculo
          if (calculoPromedioMensual !== null) {
            promedioMensual = {
              promedioMensual: calculoPromedioMensual,
              promedioTareas:
                promedioTareas !== null
                  ? Math.round(promedioTareas * 100) / 100
                  : null,
              promedioRevisiones:
                promedioRevisiones !== null
                  ? Math.round(promedioRevisiones * 100) / 100
                  : null,
              promedioLaboratorios:
                promedioLaboratorios !== null
                  ? Math.round(promedioLaboratorios * 100) / 100
                  : null,
            } as any;
          }
        }

        const orientador = asignatura.orientadores[0]?.orientador;

        return {
          id_asignatura: asignatura.id_asignatura,
          nombre: asignatura.nombre,
          orientador: orientador
            ? `${orientador.nombre} ${orientador.apellido}`
            : 'No asignado',
          evaluaciones: evaluacionesConNota,
          promedio_mensual: promedioMensual?.promedioMensual || null,
          desglose_promedio: {
            tareas: promedioMensual?.promedioTareas || null,
            revisiones: promedioMensual?.promedioRevisiones || null,
            laboratorios: promedioMensual?.promedioLaboratorios || null,
          },
        };
      }),
    );

    // Calcular promedio general del mes (de todas las asignaturas)
    const asignaturasConPromedio = asignaturasConNotas.filter(
      (a) => a.promedio_mensual !== null,
    );

    const promedioGeneralMes =
      asignaturasConPromedio.length > 0
        ? Math.round(
            (asignaturasConPromedio.reduce(
              (sum, asig) => sum + (asig.promedio_mensual || 0),
              0,
            ) /
              asignaturasConPromedio.length) *
              100,
          ) / 100
        : null;

    // Obtener asistencias del mes
    const fechaInicio = new Date(parseInt(anioUsar), mes - 1, 1);
    const fechaFin = new Date(parseInt(anioUsar), mes, 0, 23, 59, 59);

    const asistenciasMes = await this.prisma.asistencia.findMany({
      where: {
        id_alumno,
        anio_academico: anioUsar,
        fecha: {
          gte: fechaInicio.toISOString(),
          lte: fechaFin.toISOString(),
        },
      },
    });

    const totalAsist = asistenciasMes.length;
    const presentes = asistenciasMes.filter((a) => a.estado === 'P').length;
    const ausentesJustificadas = asistenciasMes.filter(
      (a) => a.estado === 'E',
    ).length;
    const ausentesInjustificadas = asistenciasMes.filter(
      (a) => a.estado === 'SP',
    ).length;
    const tardanzas = asistenciasMes.filter((a) => a.estado === 'A').length;
    const porcentajeAsistencia =
      totalAsist === 0
        ? null
        : Math.round((presentes / totalAsist) * 100 * 100) / 100;

    // Obtener conductas del mes
    const conductasMes = await this.prisma.conducta.findMany({
      where: {
        id_alumno,
        anio_academico: anioUsar,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        infraccion: true,
        orientador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    const nombresMeses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return {
      alumno: {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        numeroMatricula: alumno.numeroMatricula,
      },
      curso: {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        grado: gradoNombre,
        es_bachillerato: esBachillerato,
        orientador: curso.orientador
          ? `${curso.orientador.nombre} ${curso.orientador.apellido}`
          : 'No asignado',
      },
      periodo_academico: {
        anio: anioUsar,
        mes: mes,
        nombre_mes: nombresMeses[mes - 1],
        trimestre: trimestre,
        periodo: periodo,
        descripcion: esBachillerato
          ? `${nombresMeses[mes - 1]} ${anioUsar} - Periodo ${periodo}`
          : `${nombresMeses[mes - 1]} ${anioUsar} - Trimestre ${trimestre}`,
      },
      asignaturas: asignaturasConNotas,
      promedio_general_mes: promedioGeneralMes,
      conductas: {
        total: conductasMes.length,
        puntos_acumulados: conductasMes.reduce(
          (sum, c) => sum + (c.infraccion?.puntos || 0),
          0,
        ),
        detalles: conductasMes.map((c) => ({
          id_conducta: c.id_conducta,
          fecha: c.fecha,
          observacion: c.observacion,
          orientador: c.orientador
            ? `${c.orientador.nombre} ${c.orientador.apellido}`
            : null,
          infraccion: {
            categoria: c.infraccion?.categoria,
            articulo: c.infraccion?.articulo,
            descripcion: c.infraccion?.descripcion,
            puntos: c.infraccion?.puntos,
          },
        })),
      },
      asistencia: {
        total_dias: totalAsist,
        presentes,
        ausentes_justificadas: ausentesJustificadas,
        ausentes_injustificadas: ausentesInjustificadas,
        tardanzas,
        porcentaje_asistencia: porcentajeAsistencia,
      },
    };
  }

  /**
   * 📋 Boletas de todos los alumnos de un curso por trimestre/periodo
   * Usado para generar reportes masivos o listados de boletas
   * Filtra por curso y periodo académico (trimestre o periodo según nivel)
   */
  async boletasPorCurso(
    id_curso: number,
    anio?: string,
    trimestre?: number,
    periodo?: number,
  ) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso },
      include: {
        gradoAcademico: true,
      },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const gradoNombre = curso.gradoAcademico?.nombre || '';
    const esBachillerato = gradoNombre.includes('Bachillerato');

    // Validar filtros según el nivel
    if (esBachillerato && trimestre) {
      throw new NotFoundException(
        'Bachillerato usa periodos, no trimestres. Use el parámetro "periodo"',
      );
    }
    if (!esBachillerato && periodo) {
      throw new NotFoundException(
        'Básica usa trimestres, no periodos. Use el parámetro "trimestre"',
      );
    }

    // Validar que se proporcione trimestre o periodo
    if (!trimestre && !periodo) {
      throw new NotFoundException(
        'Debe proporcionar el parámetro "trimestre" (Básica) o "periodo" (Bachillerato)',
      );
    }

    // Obtener alumnos activos del curso
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: id_curso,
        anioAcademico: anioUsar,
        estado: 'ACTIVO',
      },
      include: {
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
            numeroMatricula: true,
          },
        },
      },
      orderBy: {
        alumno: {
          apellido: 'asc',
        },
      },
    });

    if (inscripciones.length === 0) {
      return {
        curso: {
          id_curso: curso.id_curso,
          nombre: curso.nombre,
          grado: gradoNombre,
          es_bachillerato: esBachillerato,
        },
        periodo_academico: {
          anio: anioUsar,
          trimestre: trimestre || null,
          periodo: periodo || null,
          nombre: esBachillerato
            ? `Periodo ${periodo}`
            : `Trimestre ${trimestre}`,
        },
        total_alumnos: 0,
        alumnos: [],
      };
    }

    // Para cada alumno, obtener su boleta detallada
    const boletasAlumnos = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        try {
          const boleta = await this.boletaDetalladaAlumno(
            inscripcion.alumnoId,
            anioUsar,
            trimestre,
            periodo,
          );
          return {
            alumno: inscripcion.alumno,
            boleta,
          };
        } catch (error) {
          // Si hay error en la boleta de un alumno, retornar datos básicos
          return {
            alumno: inscripcion.alumno,
            boleta: null,
            error: error.message,
          };
        }
      }),
    );

    return {
      curso: {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        grado: gradoNombre,
        es_bachillerato: esBachillerato,
      },
      periodo_academico: {
        anio: anioUsar,
        trimestre: trimestre || null,
        periodo: periodo || null,
        nombre: esBachillerato
          ? `Periodo ${periodo}`
          : `Trimestre ${trimestre}`,
      },
      total_alumnos: inscripciones.length,
      alumnos: boletasAlumnos,
    };
  }

  /**
   * 📄 Boleta detallada del alumno para ORIENTADORES (reporte para padres)
   * Muestra todas las notas de evaluaciones del trimestre/periodo seleccionado
   * Filtra por trimestre (BÁSICA) o periodo (BACHILLERATO)
   */
  async boletaDetalladaAlumno(
    id_alumno: number,
    anio?: string,
    trimestre?: number,
    periodo?: number,
  ) {
    const anioUsar = anio || new Date().getFullYear().toString();

    // Obtener información del alumno y su curso
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      include: {
        inscripciones: {
          where: { anioAcademico: anioUsar, estado: 'ACTIVO' },
          include: {
            curso: {
              include: {
                gradoAcademico: true,
              },
            },
          },
        },
      },
    });

    if (!alumno || alumno.inscripciones.length === 0) {
      throw new NotFoundException(
        'Alumno no encontrado o sin inscripción activa',
      );
    }

    const inscripcion = alumno.inscripciones[0];
    const curso = inscripcion.curso;
    const gradoNombre = curso.gradoAcademico?.nombre || '';
    const esBachillerato = gradoNombre.includes('Bachillerato');

    // Validar filtros según el nivel
    if (esBachillerato && trimestre) {
      throw new NotFoundException(
        'Bachillerato usa periodos, no trimestres. Use el parámetro "periodo"',
      );
    }
    if (!esBachillerato && periodo) {
      throw new NotFoundException(
        'Básica usa trimestres, no periodos. Use el parámetro "trimestre"',
      );
    }

    // Obtener todas las asignaturas del curso
    const asignaturas = await this.prisma.asignatura.findMany({
      where: { id_curso: curso.id_curso },
      include: {
        orientadores: {
          select: {
            orientador: {
              select: {
                id_orientador: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    // Para cada asignatura, obtener sus evaluaciones y notas del periodo/trimestre
    const asignaturasConNotas = await Promise.all(
      asignaturas.map(async (asignatura) => {
        const whereEvaluacion: any = {
          id_asignatura: asignatura.id_asignatura,
          anio_academico: anioUsar,
        };

        if (esBachillerato && periodo) {
          whereEvaluacion.periodo = periodo;
        } else if (!esBachillerato && trimestre) {
          whereEvaluacion.OR = [
            { trimestre },
            { mes: trimestre * 3 - 2 },
            { mes: trimestre * 3 - 1 },
            { mes: trimestre * 3 },
          ];
        }

        const evaluaciones = await this.prisma.evaluacion.findMany({
          where: whereEvaluacion,
          include: {
            tipoEvaluacion: true,
            notas: {
              where: { id_alumno },
            },
          },
          orderBy: [
            { mes: 'asc' },
            { trimestre: 'asc' },
            { periodo: 'asc' },
            { id_evaluacion: 'asc' },
          ],
        });

        const evaluacionesConNota = evaluaciones.map((evaluacion) => ({
          id_evaluacion: evaluacion.id_evaluacion,
          nombre: evaluacion.nombre,
          tipo: evaluacion.tipoEvaluacion.nombre,
          porcentaje: evaluacion.tipoEvaluacion.porcentaje,
          trimestre: evaluacion.trimestre,
          periodo: evaluacion.periodo,
          mes: evaluacion.mes,
          nota: evaluacion.notas[0]?.calificacion || null,
          fecha_registro: evaluacion.notas[0]?.fecha_registro || null,
        }));

        // Calcular promedio del periodo/trimestre en tiempo real
        let promedioDelPeriodo: number | null = null;

        // Filtrar evaluaciones con nota para el cálculo
        const evaluacionesConNotaValida = evaluacionesConNota.filter(
          (e) => e.nota !== null && e.nota !== undefined,
        );

        if (evaluacionesConNotaValida.length > 0) {
          // Calcular suma ponderada: (nota * porcentaje)
          const sumaPonderada = evaluacionesConNotaValida.reduce(
            (sum, ev) => sum + ev.nota! * ev.porcentaje,
            0,
          );

          // Calcular suma total de porcentajes de las evaluaciones con nota
          const sumaPorcentajes = evaluacionesConNotaValida.reduce(
            (sum, ev) => sum + ev.porcentaje,
            0,
          );

          // Promedio ponderado = suma ponderada / suma de porcentajes
          if (sumaPorcentajes > 0) {
            promedioDelPeriodo =
              Math.round((sumaPonderada / sumaPorcentajes) * 100) / 100;
          }
        }

        const orientador = asignatura.orientadores[0]?.orientador;

        return {
          id_asignatura: asignatura.id_asignatura,
          nombre: asignatura.nombre,
          orientador: orientador
            ? `${orientador.nombre} ${orientador.apellido}`
            : null,
          evaluaciones: evaluacionesConNota,
          promedio_periodo: promedioDelPeriodo,
        };
      }),
    );

    // Obtener conductas del periodo/trimestre
    const conductas = await this.prisma.conducta.findMany({
      where: {
        id_alumno,
        anio_academico: anioUsar,
        ...(esBachillerato && periodo ? { periodo } : {}),
        ...(!esBachillerato && trimestre ? { trimestre } : {}),
      },
      include: {
        infraccion: true,
        orientador: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Obtener asistencias (no se filtran por periodo/trimestre ya que son diarias)
    const asistencias = await this.prisma.asistencia.findMany({
      where: { id_alumno, anio_academico: anioUsar },
    });
    const totalAsist = asistencias.length;
    const presentes = asistencias.filter(
      (a) => a.estado === 'P' || a.estado === 'E',
    ).length;
    const ausentes = asistencias.filter((a) => a.estado === 'SP').length;
    const tardanzas = asistencias.filter((a) => a.estado === 'A').length;
    const porcentajeAsistencia =
      totalAsist === 0
        ? null
        : Math.round((presentes / totalAsist) * 100 * 100) / 100;

    // Calcular promedio general del periodo/trimestre
    const asignaturasConPromedio = asignaturasConNotas.filter(
      (a) => a.promedio_periodo !== null,
    );

    const promedioGeneralPeriodo =
      asignaturasConPromedio.length > 0
        ? Math.round(
            (asignaturasConPromedio.reduce(
              (sum, asig) => sum + (asig.promedio_periodo || 0),
              0,
            ) /
              asignaturasConPromedio.length) *
              100,
          ) / 100
        : null;

    return {
      alumno: {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        numeroMatricula: alumno.numeroMatricula,
      },
      curso: {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        grado: gradoNombre,
        es_bachillerato: esBachillerato,
      },
      periodo_academico: {
        anio: anioUsar,
        trimestre: trimestre || null,
        periodo: periodo || null,
        nombre: esBachillerato
          ? `Periodo ${periodo}`
          : `Trimestre ${trimestre}`,
      },
      asignaturas: asignaturasConNotas,
      promedio_general_periodo: promedioGeneralPeriodo,
      conductas: {
        total: conductas.length,
        puntos_acumulados: conductas.reduce(
          (sum, c) => sum + (c.infraccion?.puntos || 0),
          0,
        ),
        detalles: conductas.map((c) => ({
          id_conducta: c.id_conducta,
          fecha: c.fecha,
          observacion: c.observacion,
          orientador: c.orientador
            ? `${c.orientador.nombre} ${c.orientador.apellido}`
            : null,
          infraccion: {
            categoria: c.infraccion?.categoria,
            articulo: c.infraccion?.articulo,
            descripcion: c.infraccion?.descripcion,
            puntos: c.infraccion?.puntos,
          },
        })),
      },
      asistencia: {
        total_registros: totalAsist,
        presentes,
        ausentes,
        tardanzas,
        porcentaje_asistencia: porcentajeAsistencia,
      },
    };
  }
}

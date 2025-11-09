import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NivelEducativo } from '@prisma/client';
import {
  CalcularNotaMensualDto,
  CalcularNotaTrimestralDto,
  NotaMensualResponseDto,
  NotaTrimestralResponseDto,
  NotaMensualDetalle,
} from './dto';
import { BasicaEvaluacionStrategy } from './strategies/basica-strategy.service';
import { BachilleratoEvaluacionStrategy } from './strategies/bachillerato-strategy.service';
import { EvaluacionStrategy } from './strategies/evaluacion-strategy.interface';

@Injectable()
export class SistemaEvaluacionService {
  private strategies: Map<string, EvaluacionStrategy>;

  constructor(
    private prisma: PrismaService,
    private basicaStrategy: BasicaEvaluacionStrategy,
    private bachilleratoStrategy: BachilleratoEvaluacionStrategy,
  ) {
    // Inicializar mapa de estrategias
    this.strategies = new Map<string, EvaluacionStrategy>([
      ['BASICA', this.basicaStrategy],
      ['BACHILLERATO', this.bachilleratoStrategy],
    ]);
  }

  /**
   * Obtiene el nivel educativo (BASICA o BACHILLERATO) de una asignatura
   * Navega: Asignatura → Curso → Grado_Academico → nivel_educativo
   */
  private async obtenerNivelEducativo(
    id_asignatura: number,
  ): Promise<NivelEducativo> {
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      include: {
        curso: {
          include: {
            gradoAcademico: true,
          },
        },
      },
    });

    if (!asignatura || !asignatura.curso || !asignatura.curso.gradoAcademico) {
      throw new NotFoundException(
        `No se pudo determinar el nivel educativo de la asignatura ${id_asignatura}`,
      );
    }

    return asignatura.curso.gradoAcademico.nivel_educativo;
  }

  /**
   * Formatea los detalles de una nota mensual según el nivel educativo
   * Para Básica: muestra calculo simple (70% actividades + 30% examen)
   * Para Bachillerato: muestra desglose por categorías (6 componentes)
   */
  private async formatearNotaMensualPorNivel(
    notaMensual: any,
    id_asignatura: number,
    nombreAsignatura?: string,
  ): Promise<any> {
    const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);

    // Estructura base común
    const baseResponse = {
      id_asignatura,
      nombre: nombreAsignatura || notaMensual.asignatura?.nombre || '',
      nota_mensual: notaMensual.nota_mensual,
      aporte_al_trimestre: notaMensual.aporte_al_trimestre,
      tiene_nota: true,
    };

    if (nivelEducativo === 'BASICA') {
      // Formato Básica: Simple, actividades listadas + examen
      return {
        ...baseResponse,
        nivel: 'BASICA',
        actividades: notaMensual.actividades.map((act) => ({
          tipo: act.tipoActividad.nombre,
          numero: act.numero_actividad,
          nota: act.nota,
        })),
        examen_mensual: notaMensual.examen_mensual,
        promedio_actividades: notaMensual.promedio_puro_actividades,
        calculo: {
          promedio_70_actividades: notaMensual.promedio_70_actividades,
          promedio_30_examen: notaMensual.promedio_30_examen,
        },
      };
    } else {
      // Formato Bachillerato: Agrupado por categorías con pesos
      const actividadesPorCategoria: {
        actividades_integradoras: Array<{
          tipo: string;
          numero: number | null;
          nota: number;
        }>;
        tareas: Array<{ tipo: string; numero: number | null; nota: number }>;
        coevaluaciones: Array<{
          tipo: string;
          numero: number | null;
          nota: number;
        }>;
        laboratorios: Array<{
          tipo: string;
          numero: number | null;
          nota: number;
        }>;
      } = {
        actividades_integradoras: [],
        tareas: [],
        coevaluaciones: [],
        laboratorios: [],
      };

      // Agrupar actividades por categoría
      notaMensual.actividades.forEach((act) => {
        const categoria = act.tipoActividad.categoria_bachillerato;
        if (categoria === 'ACTIVIDAD_INTEGRADORA') {
          actividadesPorCategoria.actividades_integradoras.push({
            tipo: act.tipoActividad.nombre,
            numero: act.numero_actividad,
            nota: act.nota,
          });
        } else if (categoria === 'TAREA') {
          actividadesPorCategoria.tareas.push({
            tipo: act.tipoActividad.nombre,
            numero: act.numero_actividad,
            nota: act.nota,
          });
        } else if (categoria === 'COEVALUACION') {
          actividadesPorCategoria.coevaluaciones.push({
            tipo: act.tipoActividad.nombre,
            numero: act.numero_actividad,
            nota: act.nota,
          });
        } else if (categoria === 'LABORATORIO') {
          actividadesPorCategoria.laboratorios.push({
            tipo: act.tipoActividad.nombre,
            numero: act.numero_actividad,
            nota: act.nota,
          });
        }
      });

      // Calcular promedios por categoría
      const calcularPromedio = (actividades: any[]) => {
        if (actividades.length === 0) return 0;
        const suma = actividades.reduce((acc, act) => acc + act.nota, 0);
        return this.redondear(suma / actividades.length);
      };

      const promedios = {
        actividades_integradoras: calcularPromedio(
          actividadesPorCategoria.actividades_integradoras,
        ),
        tareas: calcularPromedio(actividadesPorCategoria.tareas),
        coevaluaciones: calcularPromedio(
          actividadesPorCategoria.coevaluaciones,
        ),
        laboratorios: calcularPromedio(actividadesPorCategoria.laboratorios),
      };

      return {
        ...baseResponse,
        nivel: 'BACHILLERATO',
        componentes: {
          actividades_integradoras: {
            actividades: actividadesPorCategoria.actividades_integradoras,
            promedio: promedios.actividades_integradoras,
            peso: 0.25,
            aporte: this.redondear(promedios.actividades_integradoras * 0.25),
          },
          tareas: {
            actividades: actividadesPorCategoria.tareas,
            promedio: promedios.tareas,
            peso: 0.05,
            aporte: this.redondear(promedios.tareas * 0.05),
          },
          coevaluaciones: {
            actividades: actividadesPorCategoria.coevaluaciones,
            promedio: promedios.coevaluaciones,
            peso: 0.05,
            aporte: this.redondear(promedios.coevaluaciones * 0.05),
          },
          laboratorios: {
            actividades: actividadesPorCategoria.laboratorios,
            promedio: promedios.laboratorios,
            peso: 0.1,
            aporte: this.redondear(promedios.laboratorios * 0.1),
          },
          examen_parcial: {
            nota: notaMensual.examen_parcial || 0,
            peso: 0.25,
            aporte: this.redondear((notaMensual.examen_parcial || 0) * 0.25),
          },
          examen_periodo: {
            nota: notaMensual.examen_mensual,
            peso: 0.3,
            aporte: this.redondear(notaMensual.examen_mensual * 0.3),
          },
        },
        nota_mensual: notaMensual.nota_mensual,
        aporte_al_periodo: notaMensual.aporte_al_trimestre,
        tiene_nota: true,
      };
    }
  }

  /**
   * Configuración de porcentajes por trimestre y mes (como decimales)
   * Trimestre 1: febrero 0.28, marzo 0.27, abril 0.45
   * Trimestre 2: Mayo 0.28, Junio 0.27, Julio 0.45
   * Trimestre 3: Agosto 0.28, Septiembre 0.27, Octubre 0.45
   */
  private readonly PORCENTAJES_TRIMESTRALES = {
    1: { Febrero: 0.28, Marzo: 0.27, Abril: 0.45 },
    2: { Mayo: 0.28, Junio: 0.27, Julio: 0.45 },
    3: { Agosto: 0.28, Septiembre: 0.27, Octubre: 0.45 },
  };

  /**
   * Porcentaje de actividades continuas (70%)
   */
  private readonly PORCENTAJE_ACTIVIDADES = 0.7;

  /**
   * Porcentaje de examen mensual (30%)
   */
  private readonly PORCENTAJE_EXAMEN = 0.3;

  /**
   * Redondea un número a 2 decimales
   */
  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  /**
   * Obtiene el porcentaje de aporte de un mes al trimestre
   */
  private obtenerPorcentajeAporte(trimestre: number, mes: string): number {
    const porcentajes = this.PORCENTAJES_TRIMESTRALES[trimestre];
    if (!porcentajes || !porcentajes[mes]) {
      throw new BadRequestException(
        `El mes "${mes}" no es válido para el trimestre ${trimestre}`,
      );
    }
    return porcentajes[mes];
  }

  /**
   * Calcula la nota mensual/periodo de un alumno para una asignatura
   * Usa la estrategia apropiada según el nivel educativo (BASICA o BACHILLERATO)
   *
   * BÁSICA (3 trimestres):
   * - 70% actividades + 30% examen mensual
   * - Aporte al trimestre según porcentaje mensual
   *
   * BACHILLERATO (4 periodos):
   * - 25% Act.Integradoras + 5% Tarea + 5% Coev + 10% Lab + 25% Examen Parcial + 30% Examen Periodo
   * - Cada periodo aporta 25% a la nota anual
   *
   * IMPORTANTE: Guarda el resultado en la base de datos
   */
  async calcularNotaMensual(
    dto: CalcularNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    // Validar que el alumno existe
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: dto.id_alumno },
    });

    if (!alumno) {
      throw new NotFoundException(
        `El alumno con ID ${dto.id_alumno} no existe`,
      );
    }

    // Validar que la asignatura existe y obtener su nivel educativo
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: dto.id_asignatura },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${dto.id_asignatura} no existe`,
      );
    }

    // Obtener el nivel educativo para seleccionar la estrategia
    const nivelEducativo = await this.obtenerNivelEducativo(dto.id_asignatura);
    const strategy = this.strategies.get(nivelEducativo);

    if (!strategy) {
      throw new BadRequestException(
        `No se encontró estrategia de evaluación para el nivel: ${nivelEducativo}`,
      );
    }

    // ===== VALIDACIONES CON LA ESTRATEGIA =====

    // Validar que hay al menos una actividad
    if (!dto.actividades || dto.actividades.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos una actividad');
    }

    // Obtener tipos de actividad con su categoría (para Bachillerato)
    const tiposActividadIds = dto.actividades.map(
      (act) => act.id_tipo_actividad,
    );
    const tiposActividad = await this.prisma.tipoActividadEvaluacion.findMany({
      where: {
        id_tipo_actividad: { in: tiposActividadIds },
      },
    });

    // Mapear actividades con su categoría
    const actividadesConCategoria = dto.actividades.map((act) => {
      const tipo = tiposActividad.find(
        (t) => t.id_tipo_actividad === act.id_tipo_actividad,
      );
      return {
        nota: act.nota,
        categoria: tipo?.categoria_bachillerato || undefined,
      };
    });

    // Validar actividades según la estrategia
    const validacionActividades = strategy.validarActividades(
      actividadesConCategoria,
    );
    if (!validacionActividades.valido) {
      throw new BadRequestException(
        `Actividades inválidas: ${validacionActividades.errores?.join(', ') || 'Error de validación'}`,
      );
    }

    // Preparar objeto de exámenes
    const examenes = {
      examen_principal: dto.examen_mensual,
      examen_parcial: dto.examen_parcial,
    };

    // Validar exámenes según la estrategia
    const validacionExamenes = strategy.validarExamenes(examenes);
    if (!validacionExamenes.valido) {
      throw new BadRequestException(
        `Exámenes inválidos: ${validacionExamenes.errores?.join(', ') || 'Error de validación'}`,
      );
    }

    // ===== CÁLCULO CON LA ESTRATEGIA =====

    const resultado = strategy.calcularNotaPeriodo(
      actividadesConCategoria,
      examenes,
    );

    // Obtener el nombre del periodo y el porcentaje de aporte
    const nombrePeriodo = strategy.obtenerNombrePeriodo(dto.trimestre);
    const porcentajeAporte = strategy.obtenerPorcentajeAportePeriodo(
      dto.trimestre,
      dto.mes,
    );

    // Calcular aporte al periodo/trimestre
    // Nota: porcentajeAporte ya viene como decimal (0.28 = 28%), no dividir por 100
    const aportePeriodo = this.redondear(
      resultado.nota_periodo * porcentajeAporte,
    );

    // ===== GUARDAR EN LA BASE DE DATOS =====
    const notaMensualGuardada = await this.prisma.$transaction(async (tx) => {
      // Buscar si ya existe una nota mensual
      const notaExistente = await tx.notaMensual.findUnique({
        where: {
          id_alumno_id_asignatura_mes_trimestre_anio_academico: {
            id_alumno: dto.id_alumno,
            id_asignatura: dto.id_asignatura,
            mes: dto.mes,
            trimestre: dto.trimestre,
            anio_academico: dto.anio_academico,
          },
        },
        include: {
          actividades: true,
        },
      });

      // Preparar los datos a guardar
      const dataToSave = {
        examen_mensual: dto.examen_mensual,
        examen_parcial: dto.examen_parcial || null,
        promedio_puro_actividades: resultado.promedio_actividades,
        promedio_70_actividades: resultado.aporte_actividades,
        promedio_30_examen: resultado.aporte_examen_principal,
        nota_mensual: resultado.nota_periodo,
        porcentaje_aporte: porcentajeAporte,
        aporte_al_trimestre: aportePeriodo,
      };

      let notaMensual: any;

      if (notaExistente) {
        // Si existe, eliminar las actividades antiguas y actualizar
        await tx.actividadEvaluacion.deleteMany({
          where: { id_nota_mensual: notaExistente.id_nota_mensual },
        });

        notaMensual = await tx.notaMensual.update({
          where: { id_nota_mensual: notaExistente.id_nota_mensual },
          data: {
            ...dataToSave,
            actividades: {
              create: dto.actividades.map((act) => ({
                id_tipo_actividad: act.id_tipo_actividad,
                numero_actividad: act.numero_actividad,
                nota: act.nota,
              })),
            },
          },
          include: {
            actividades: {
              include: {
                tipoActividad: true,
              },
            },
          },
        });
      } else {
        // Si no existe, crear nueva
        notaMensual = await tx.notaMensual.create({
          data: {
            id_alumno: dto.id_alumno,
            id_asignatura: dto.id_asignatura,
            mes: dto.mes,
            trimestre: dto.trimestre,
            anio_academico: dto.anio_academico,
            ...dataToSave,
            actividades: {
              create: dto.actividades.map((act) => ({
                id_tipo_actividad: act.id_tipo_actividad,
                numero_actividad: act.numero_actividad,
                nota: act.nota,
              })),
            },
          },
          include: {
            actividades: {
              include: {
                tipoActividad: true,
              },
            },
          },
        });
      }

      return notaMensual;
    });

    // Preparar las actividades para la respuesta
    const actividadesDetalle = notaMensualGuardada.actividades.map(
      (act: any) => ({
        id_tipo_actividad: act.id_tipo_actividad,
        tipo_actividad_nombre: act.tipoActividad.nombre,
        numero_actividad: act.numero_actividad,
        nombre_completo: act.numero_actividad
          ? `${act.tipoActividad.nombre} ${act.numero_actividad}`
          : act.tipoActividad.nombre,
        nota: act.nota,
      }),
    );

    // Preparar respuesta
    const response: NotaMensualResponseDto = {
      id_alumno: dto.id_alumno,
      id_asignatura: dto.id_asignatura,
      mes: dto.mes,
      trimestre: dto.trimestre,
      anio_academico: dto.anio_academico,
      actividades: actividadesDetalle,
      examen_mensual: dto.examen_mensual,
      promedio_puro_actividades: resultado.promedio_actividades,
      promedio_70_actividades: resultado.aporte_actividades,
      promedio_30_examen: resultado.aporte_examen_principal,
      nota_mensual: resultado.nota_periodo,
      porcentaje_aporte_trimestre: porcentajeAporte,
      aporte_al_trimestre: aportePeriodo,
      fecha_registro: notaMensualGuardada.fecha_registro,
    };

    return response;
  }

  /**
   * Actualiza una nota mensual existente por su ID
   */
  async actualizarNotaMensual(
    id_nota_mensual: number,
    dto: CalcularNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    // Verificar que la nota mensual existe
    const notaExistente = await this.prisma.notaMensual.findUnique({
      where: { id_nota_mensual },
      include: {
        actividades: true,
        alumno: true,
        asignatura: true,
      },
    });

    if (!notaExistente) {
      throw new NotFoundException(
        `La nota mensual con ID ${id_nota_mensual} no existe`,
      );
    }

    // Validar que los datos del DTO coinciden con la nota existente
    if (
      notaExistente.id_alumno !== dto.id_alumno ||
      notaExistente.id_asignatura !== dto.id_asignatura
    ) {
      throw new BadRequestException(
        'Los datos del alumno o asignatura no coinciden con la nota existente',
      );
    }

    // Reutilizar la lógica de cálculo existente
    // Como calcularNotaMensual ya maneja upsert, simplemente lo llamamos
    return this.calcularNotaMensual(dto);
  }

  /**
   * Calcula la nota trimestral a partir de las notas mensuales almacenadas
   * Fórmula:
   * Nota trimestral = (Nota mes1 × %mes1) + (Nota mes2 × %mes2) + (Nota mes3 × %mes3)
   *
   * IMPORTANTE: Guarda el resultado en la base de datos
   */
  async calcularNotaTrimestral(
    dto: CalcularNotaTrimestralDto,
  ): Promise<NotaTrimestralResponseDto> {
    // Validar que el alumno existe
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: dto.id_alumno },
    });

    if (!alumno) {
      throw new NotFoundException(
        `El alumno con ID ${dto.id_alumno} no existe`,
      );
    }

    // Validar que la asignatura existe
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: dto.id_asignatura },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${dto.id_asignatura} no existe`,
      );
    }

    // Obtener los meses correspondientes al trimestre
    const mesesTrimestre = Object.keys(
      this.PORCENTAJES_TRIMESTRALES[dto.trimestre],
    );

    // Buscar las notas mensuales en la base de datos
    const notasMensualesDB = await this.prisma.notaMensual.findMany({
      where: {
        id_alumno: dto.id_alumno,
        id_asignatura: dto.id_asignatura,
        trimestre: dto.trimestre,
        anio_academico: dto.anio_academico,
      },
      include: {
        actividades: true,
      },
      orderBy: {
        fecha_registro: 'asc',
      },
    });

    const notasMensuales: NotaMensualDetalle[] = [];
    let notaTrimestralTotal = 0;

    for (const mes of mesesTrimestre) {
      const porcentaje = this.PORCENTAJES_TRIMESTRALES[dto.trimestre][mes];

      // Buscar la nota mensual específica de este mes
      const notaMensualDB = notasMensualesDB.find((n) => n.mes === mes);

      if (notaMensualDB) {
        // IMPORTANTE: porcentaje ya viene como decimal (0.28 = 28%), NO dividir por 100
        const aporte = this.redondear(notaMensualDB.nota_mensual * porcentaje);
        notaTrimestralTotal += aporte;

        notasMensuales.push({
          mes,
          nota_mensual: notaMensualDB.nota_mensual,
          porcentaje: porcentaje * 100, // Convertir a porcentaje para la respuesta (28, 27, 45)
          aporte,
        });
      } else {
        // Si no hay nota mensual, agregar con valor 0
        notasMensuales.push({
          mes,
          nota_mensual: 0,
          porcentaje: porcentaje * 100, // Convertir a porcentaje para la respuesta
          aporte: 0,
        });
      }
    }

    notaTrimestralTotal = this.redondear(notaTrimestralTotal);

    // GUARDAR LA NOTA TRIMESTRAL EN LA BASE DE DATOS
    await this.prisma.notaTrimestral.upsert({
      where: {
        id_alumno_id_asignatura_trimestre_anio_academico: {
          id_alumno: dto.id_alumno,
          id_asignatura: dto.id_asignatura,
          trimestre: dto.trimestre,
          anio_academico: dto.anio_academico,
        },
      },
      update: {
        notas_mensuales: notasMensuales as any,
        nota_trimestral: notaTrimestralTotal,
      },
      create: {
        id_alumno: dto.id_alumno,
        id_asignatura: dto.id_asignatura,
        trimestre: dto.trimestre,
        anio_academico: dto.anio_academico,
        notas_mensuales: notasMensuales as any,
        nota_trimestral: notaTrimestralTotal,
      },
    });

    const response: NotaTrimestralResponseDto = {
      id_alumno: dto.id_alumno,
      id_asignatura: dto.id_asignatura,
      trimestre: dto.trimestre,
      anio_academico: dto.anio_academico,
      notas_mensuales: notasMensuales,
      nota_trimestral: notaTrimestralTotal,
      fecha_calculo: new Date(),
    };

    return response;
  }

  /**
   * Obtiene estadísticas de un alumno en una asignatura
   */
  async obtenerEstadisticasAlumno(
    id_alumno: number,
    id_asignatura: number,
    anio_academico: string,
  ): Promise<any> {
    // Obtener todas las actividades del año
    const todasLasNotas = await this.prisma.notaMensual.findMany({
      where: {
        id_alumno,
        id_asignatura,
        anio_academico,
      },
      include: {
        actividades: true,
      },
    });

    // Calcular estadísticas
    const totalActividades = todasLasNotas.reduce(
      (sum, nota) => sum + nota.actividades.length,
      0,
    );

    const todasActividadesNotas = todasLasNotas.flatMap((nota) =>
      nota.actividades.map((act) => act.nota),
    );

    const promedioGeneral =
      todasActividadesNotas.length > 0
        ? this.redondear(
            todasActividadesNotas.reduce((sum, nota) => sum + nota, 0) /
              todasActividadesNotas.length,
          )
        : 0;

    const notaMaxima =
      todasActividadesNotas.length > 0 ? Math.max(...todasActividadesNotas) : 0;
    const notaMinima =
      todasActividadesNotas.length > 0 ? Math.min(...todasActividadesNotas) : 0;

    return {
      id_alumno,
      id_asignatura,
      anio_academico,
      total_actividades: totalActividades,
      promedio_general_actividades: promedioGeneral,
      nota_maxima: notaMaxima,
      nota_minima: notaMinima,
      meses_evaluados: todasLasNotas.length,
    };
  }

  /**
   * ======================================================
   * ============= REPORTES PARA ALUMNOS/PADRES ===========
   * ======================================================
   * Estos reportes muestran las notas de UN alumno específico
   */

  /**
   * 1. Reporte mensual de UNA asignatura para un alumno específico
   * Muestra todas las actividades y la nota mensual del alumno
   */
  async obtenerReporteMensualAlumnoAsignatura(
    id_alumno: number,
    id_asignatura: number,
    mes: string,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar alumno y obtener su curso activo
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      select: {
        nombre: true,
        apellido: true,
        inscripciones: {
          where: {
            anioAcademico: anio_academico,
            estado: 'ACTIVO',
          },
          select: {
            curso: {
              select: {
                nombre: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(`El alumno con ID ${id_alumno} no existe`);
    }

    const cursoNombre = alumno.inscripciones[0]?.curso?.nombre || 'Sin curso';

    // Validar asignatura
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      select: {
        nombre: true,
      },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe`,
      );
    }

    // Obtener nota mensual del alumno
    const notaMensual = await this.prisma.notaMensual.findUnique({
      where: {
        id_alumno_id_asignatura_mes_trimestre_anio_academico: {
          id_alumno,
          id_asignatura,
          mes,
          trimestre,
          anio_academico,
        },
      },
      include: {
        actividades: {
          include: {
            tipoActividad: true,
          },
          orderBy: {
            id_actividad_evaluacion: 'asc',
          },
        },
      },
    });

    if (!notaMensual) {
      throw new NotFoundException(
        `No se encontró nota mensual para este alumno en ${mes}`,
      );
    }

    return {
      alumno: {
        id: id_alumno,
        nombre_completo: `${alumno.nombre} ${alumno.apellido}`,
        curso: cursoNombre,
      },
      asignatura: {
        id: id_asignatura,
        nombre: asignatura.nombre,
      },
      periodo: {
        mes,
        trimestre,
        anio_academico,
        porcentaje_aporte: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
      },
      actividades: notaMensual.actividades.map((act) => ({
        tipo: act.tipoActividad.nombre,
        numero: act.numero_actividad,
        nota: act.nota,
      })),
      examen_mensual: notaMensual.examen_mensual,
      promedio_actividades: notaMensual.promedio_puro_actividades,
      nota_mensual: notaMensual.nota_mensual,
      aporte_al_trimestre: notaMensual.aporte_al_trimestre,
      tiene_nota: true,
    };
  }

  /**
   * 2. Consolidado mensual de TODAS las asignaturas de un alumno
   * Muestra las notas de todas las asignaturas del alumno en un mes
   * INCLUYE DETALLE DE ACTIVIDADES PARA BOLETAS
   */
  async obtenerConsolidadoMensualAlumno(
    id_alumno: number,
    mes: string,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar alumno y obtener su curso activo
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      select: {
        nombre: true,
        apellido: true,
        inscripciones: {
          where: {
            anioAcademico: anio_academico,
            estado: 'ACTIVO',
          },
          select: {
            cursoId: true,
            curso: {
              select: {
                nombre: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(`El alumno con ID ${id_alumno} no existe`);
    }

    if (!alumno.inscripciones[0]) {
      throw new NotFoundException(
        `El alumno no tiene una inscripción activa para el año ${anio_academico}`,
      );
    }

    const cursoId = alumno.inscripciones[0].cursoId;
    const cursoNombre = alumno.inscripciones[0].curso.nombre;

    // Obtener todas las asignaturas del curso del alumno
    const asignaturasCurso = await this.prisma.asignatura.findMany({
      where: {
        id_curso: cursoId,
      },
      select: {
        id_asignatura: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Obtener notas mensuales del alumno en todas sus asignaturas CON ACTIVIDADES
    const notasMensuales = await this.prisma.notaMensual.findMany({
      where: {
        id_alumno,
        mes,
        trimestre,
        anio_academico,
        id_asignatura: {
          in: asignaturasCurso.map((a) => a.id_asignatura),
        },
      },
      include: {
        asignatura: {
          select: {
            nombre: true,
          },
        },
        actividades: {
          include: {
            tipoActividad: true,
          },
          orderBy: {
            id_actividad_evaluacion: 'asc',
          },
        },
      },
    });

    // Formatear asignaturas según su nivel educativo
    const asignaturasFormateadas = await Promise.all(
      asignaturasCurso.map(async (asig) => {
        const nota = notasMensuales.find(
          (n) => n.id_asignatura === asig.id_asignatura,
        );

        if (nota) {
          // Asignatura CON nota - formatear según nivel
          return await this.formatearNotaMensualPorNivel(
            nota,
            asig.id_asignatura,
            asig.nombre,
          );
        } else {
          // Asignatura SIN nota
          return {
            id_asignatura: asig.id_asignatura,
            nombre: asig.nombre,
            nota_mensual: 0,
            aporte_al_trimestre: 0,
            tiene_nota: false,
          };
        }
      }),
    );

    // Calcular promedio general del alumno
    const notasConValor = asignaturasFormateadas.filter((a) => a.tiene_nota);
    const promedioGeneral =
      notasConValor.length > 0
        ? this.redondear(
            notasConValor.reduce((sum, a) => sum + a.nota_mensual, 0) /
              notasConValor.length,
          )
        : 0;

    return {
      alumno: {
        id: id_alumno,
        nombre_completo: `${alumno.nombre} ${alumno.apellido}`,
        curso: cursoNombre,
      },
      periodo: {
        mes,
        trimestre,
        anio_academico,
        porcentaje_aporte: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
      },
      resumen: {
        total_asignaturas: asignaturasFormateadas.length,
        asignaturas_evaluadas: notasConValor.length,
        promedio_general: promedioGeneral,
      },
      asignaturas: asignaturasFormateadas,
    };
  }

  /**
   * 3. Reporte trimestral de UNA asignatura para un alumno
   * Muestra el desglose mensual y la nota trimestral
   */
  async obtenerReporteTrimestralAlumnoAsignatura(
    id_alumno: number,
    id_asignatura: number,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar alumno y obtener su curso
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      select: {
        nombre: true,
        apellido: true,
        inscripciones: {
          where: {
            anioAcademico: anio_academico,
            estado: 'ACTIVO',
          },
          select: {
            curso: {
              select: {
                nombre: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(`El alumno con ID ${id_alumno} no existe`);
    }

    const cursoNombre = alumno.inscripciones[0]?.curso?.nombre || 'Sin curso';

    // Validar asignatura
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      select: {
        nombre: true,
      },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe`,
      );
    }

    // Obtener meses del trimestre
    const mesesTrimestre = Object.keys(
      this.PORCENTAJES_TRIMESTRALES[trimestre],
    );

    // Obtener notas mensuales
    const notasMensuales = await this.prisma.notaMensual.findMany({
      where: {
        id_alumno,
        id_asignatura,
        trimestre,
        anio_academico,
      },
      orderBy: {
        fecha_registro: 'asc',
      },
    });

    // Obtener nota trimestral
    const notaTrimestral = await this.prisma.notaTrimestral.findUnique({
      where: {
        id_alumno_id_asignatura_trimestre_anio_academico: {
          id_alumno,
          id_asignatura,
          trimestre,
          anio_academico,
        },
      },
    });

    const desgloseMensual = mesesTrimestre.map((mes) => {
      const notaMes = notasMensuales.find((n) => n.mes === mes);
      return {
        mes,
        nota_mensual: notaMes?.nota_mensual || 0,
        aporte: notaMes?.aporte_al_trimestre || 0,
        porcentaje: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
      };
    });

    return {
      alumno: {
        id: id_alumno,
        nombre_completo: `${alumno.nombre} ${alumno.apellido}`,
        curso: cursoNombre,
      },
      asignatura: {
        id: id_asignatura,
        nombre: asignatura.nombre,
      },
      periodo: {
        trimestre,
        anio_academico,
        meses: mesesTrimestre,
      },
      desglose_mensual: desgloseMensual,
      nota_trimestral: notaTrimestral?.nota_trimestral || 0,
    };
  }

  /**
   * 4. Consolidado trimestral de TODAS las asignaturas de un alumno
   * Muestra las notas trimestrales de todas las asignaturas del alumno
   * INCLUYE DESGLOSE MENSUAL CON ACTIVIDADES PARA BOLETAS
   */
  async obtenerConsolidadoTrimestralAlumno(
    id_alumno: number,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar alumno y obtener su curso activo
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno },
      select: {
        nombre: true,
        apellido: true,
        inscripciones: {
          where: {
            anioAcademico: anio_academico,
            estado: 'ACTIVO',
          },
          select: {
            cursoId: true,
            curso: {
              select: {
                nombre: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(`El alumno con ID ${id_alumno} no existe`);
    }

    if (!alumno.inscripciones[0]) {
      throw new NotFoundException(
        `El alumno no tiene una inscripción activa para el año ${anio_academico}`,
      );
    }

    const cursoId = alumno.inscripciones[0].cursoId;
    const cursoNombre = alumno.inscripciones[0].curso.nombre;

    // Obtener todas las asignaturas del curso del alumno
    const asignaturasCurso = await this.prisma.asignatura.findMany({
      where: {
        id_curso: cursoId,
      },
      select: {
        id_asignatura: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Obtener meses del trimestre
    const mesesTrimestre = Object.keys(
      this.PORCENTAJES_TRIMESTRALES[trimestre],
    );

    // Obtener TODAS las notas mensuales del trimestre CON ACTIVIDADES
    const todasNotasMensuales = await this.prisma.notaMensual.findMany({
      where: {
        id_alumno,
        trimestre,
        anio_academico,
        id_asignatura: {
          in: asignaturasCurso.map((a) => a.id_asignatura),
        },
      },
      include: {
        actividades: {
          include: {
            tipoActividad: true,
          },
          orderBy: {
            id_actividad_evaluacion: 'asc',
          },
        },
      },
    });

    // Obtener notas trimestrales del alumno en todas sus asignaturas
    const notasTrimestrales = await this.prisma.notaTrimestral.findMany({
      where: {
        id_alumno,
        trimestre,
        anio_academico,
        id_asignatura: {
          in: asignaturasCurso.map((a) => a.id_asignatura),
        },
      },
      include: {
        asignatura: {
          select: {
            nombre: true,
          },
        },
      },
    });

    const asignaturas = asignaturasCurso.map((asig) => {
      const notaTrimestral = notasTrimestrales.find(
        (n) => n.id_asignatura === asig.id_asignatura,
      );

      // Obtener desglose mensual CON actividades
      const desgloseMensual = mesesTrimestre.map((mes) => {
        const notaMensual = todasNotasMensuales.find(
          (n) => n.id_asignatura === asig.id_asignatura && n.mes === mes,
        );

        if (notaMensual) {
          return {
            mes,
            porcentaje: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
            actividades: notaMensual.actividades.map((act) => ({
              tipo: act.tipoActividad.nombre,
              numero: act.numero_actividad,
              nota: act.nota,
            })),
            examen_mensual: notaMensual.examen_mensual,
            promedio_actividades: notaMensual.promedio_puro_actividades,
            calculo: {
              promedio_70_actividades: notaMensual.promedio_70_actividades,
              promedio_30_examen: notaMensual.promedio_30_examen,
            },
            nota_mensual: notaMensual.nota_mensual,
            aporte: notaMensual.aporte_al_trimestre,
          };
        } else {
          return {
            mes,
            porcentaje: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
            actividades: [],
            examen_mensual: 0,
            promedio_actividades: 0,
            calculo: {
              promedio_70_actividades: 0,
              promedio_30_examen: 0,
            },
            nota_mensual: 0,
            aporte: 0,
          };
        }
      });

      return {
        id_asignatura: asig.id_asignatura,
        nombre: asig.nombre,
        desglose_mensual: desgloseMensual,
        nota_trimestral: notaTrimestral?.nota_trimestral || 0,
        tiene_nota: !!notaTrimestral,
      };
    });

    // Calcular promedio trimestral general del alumno
    const notasConValor = asignaturas.filter((a) => a.tiene_nota);
    const promedioTrimestral =
      notasConValor.length > 0
        ? this.redondear(
            notasConValor.reduce((sum, a) => sum + a.nota_trimestral, 0) /
              notasConValor.length,
          )
        : 0;

    return {
      alumno: {
        id: id_alumno,
        nombre_completo: `${alumno.nombre} ${alumno.apellido}`,
        curso: cursoNombre,
      },
      periodo: {
        trimestre,
        anio_academico,
        meses: mesesTrimestre,
      },
      resumen: {
        total_asignaturas: asignaturas.length,
        asignaturas_evaluadas: notasConValor.length,
        promedio_trimestral: promedioTrimestral,
      },
      asignaturas,
    };
  }

  /**
   * ======================================================
   * ======= REPORTES PARA ADMINISTRADORES/ORIENTADORES ===
   * ======================================================
   * Estos reportes muestran las notas de TODOS los alumnos de un curso
   */

  /**
   * 5. Consolidado mensual de una asignatura por curso
   * Muestra las notas mensuales de TODOS los alumnos de un curso en una asignatura
   */
  async obtenerConsolidadoMensualAsignaturaCurso(
    id_curso: number,
    id_asignatura: number,
    mes: string,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar curso
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso },
      select: {
        nombre: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`El curso con ID ${id_curso} no existe`);
    }

    // Validar asignatura
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      select: {
        nombre: true,
      },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe`,
      );
    }

    // Obtener alumnos activos del curso
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: id_curso,
        anioAcademico: anio_academico,
        estado: 'ACTIVO',
      },
      select: {
        alumnoId: true,
      },
    });

    const alumnosIds = inscripciones.map((i) => i.alumnoId);

    // Obtener todas las notas mensuales de los alumnos del curso
    const notasMensuales = await this.prisma.notaMensual.findMany({
      where: {
        id_asignatura,
        mes,
        trimestre,
        anio_academico,
        id_alumno: {
          in: alumnosIds,
        },
      },
      include: {
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [
        {
          alumno: {
            apellido: 'asc',
          },
        },
        {
          alumno: {
            nombre: 'asc',
          },
        },
      ],
    });

    // Calcular estadísticas
    const totalAlumnos = notasMensuales.length;
    const notasValores = notasMensuales.map((n) => n.nota_mensual);
    const promedioGeneral =
      totalAlumnos > 0
        ? this.redondear(
            notasValores.reduce((sum, nota) => sum + nota, 0) / totalAlumnos,
          )
        : 0;
    const notaMaxima = totalAlumnos > 0 ? Math.max(...notasValores) : 0;
    const notaMinima = totalAlumnos > 0 ? Math.min(...notasValores) : 0;

    const alumnos = notasMensuales.map((nota) => ({
      id_alumno: nota.alumno.id_alumno,
      nombre_completo: `${nota.alumno.nombre} ${nota.alumno.apellido}`,
      promedio_actividades: nota.promedio_puro_actividades,
      examen_mensual: nota.examen_mensual,
      nota_mensual: nota.nota_mensual,
      aporte_al_trimestre: nota.aporte_al_trimestre,
    }));

    return {
      curso: {
        id: id_curso,
        nombre: curso.nombre,
      },
      asignatura: {
        id: id_asignatura,
        nombre: asignatura.nombre,
      },
      periodo: {
        mes,
        trimestre,
        anio_academico,
        porcentaje_aporte: this.PORCENTAJES_TRIMESTRALES[trimestre]?.[mes] || 0,
      },
      estadisticas: {
        total_alumnos: totalAlumnos,
        promedio_general: promedioGeneral,
        nota_maxima: notaMaxima,
        nota_minima: notaMinima,
      },
      alumnos,
    };
  }

  /**
   * 6. Consolidado trimestral de una asignatura por curso
   * Muestra las notas trimestrales de TODOS los alumnos de un curso en una asignatura
   */
  async obtenerConsolidadoTrimestralAsignaturaCurso(
    id_curso: number,
    id_asignatura: number,
    trimestre: number,
    anio_academico: string,
  ): Promise<any> {
    // Validar curso
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso },
      select: {
        nombre: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`El curso con ID ${id_curso} no existe`);
    }

    // Validar asignatura
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      select: {
        nombre: true,
      },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe`,
      );
    }

    // Obtener meses del trimestre
    const mesesTrimestre = Object.keys(
      this.PORCENTAJES_TRIMESTRALES[trimestre],
    );

    // Obtener alumnos activos del curso
    const inscripciones = await this.prisma.alumnoCurso.findMany({
      where: {
        cursoId: id_curso,
        anioAcademico: anio_academico,
        estado: 'ACTIVO',
      },
      select: {
        alumnoId: true,
      },
    });

    const alumnosIds = inscripciones.map((i) => i.alumnoId);

    // Obtener todas las notas trimestrales de los alumnos del curso
    const notasTrimestrales = await this.prisma.notaTrimestral.findMany({
      where: {
        id_asignatura,
        trimestre,
        anio_academico,
        id_alumno: {
          in: alumnosIds,
        },
      },
      include: {
        alumno: {
          select: {
            id_alumno: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [
        {
          alumno: {
            apellido: 'asc',
          },
        },
        {
          alumno: {
            nombre: 'asc',
          },
        },
      ],
    });

    // Obtener desglose mensual de cada alumno
    const alumnosDetalle = await Promise.all(
      notasTrimestrales.map(async (notaTrimestral) => {
        const notasMensuales = await this.prisma.notaMensual.findMany({
          where: {
            id_alumno: notaTrimestral.id_alumno,
            id_asignatura,
            trimestre,
            anio_academico,
          },
          orderBy: {
            fecha_registro: 'asc',
          },
        });

        const desgloseMensual = mesesTrimestre.map((mes) => {
          const notaMes = notasMensuales.find((n) => n.mes === mes);
          return {
            mes,
            nota_mensual: notaMes?.nota_mensual || 0,
            aporte: notaMes?.aporte_al_trimestre || 0,
          };
        });

        return {
          id_alumno: notaTrimestral.alumno.id_alumno,
          nombre_completo: `${notaTrimestral.alumno.nombre} ${notaTrimestral.alumno.apellido}`,
          desglose_mensual: desgloseMensual,
          nota_trimestral: notaTrimestral.nota_trimestral,
        };
      }),
    );

    // Calcular estadísticas
    const totalAlumnos = notasTrimestrales.length;
    const notasValores = notasTrimestrales.map((n) => n.nota_trimestral);
    const promedioGeneral =
      totalAlumnos > 0
        ? this.redondear(
            notasValores.reduce((sum, nota) => sum + nota, 0) / totalAlumnos,
          )
        : 0;
    const notaMaxima = totalAlumnos > 0 ? Math.max(...notasValores) : 0;
    const notaMinima = totalAlumnos > 0 ? Math.min(...notasValores) : 0;

    return {
      curso: {
        id: id_curso,
        nombre: curso.nombre,
      },
      asignatura: {
        id: id_asignatura,
        nombre: asignatura.nombre,
      },
      periodo: {
        trimestre,
        anio_academico,
        meses: mesesTrimestre,
      },
      estadisticas: {
        total_alumnos: totalAlumnos,
        promedio_general: promedioGeneral,
        nota_maxima: notaMaxima,
        nota_minima: notaMinima,
      },
      alumnos: alumnosDetalle,
    };
  }

  /**
   * Obtiene la configuración de evaluación según el nivel educativo de una asignatura
   * Retorna información sobre periodos, componentes y ponderaciones
   */
  async obtenerConfiguracionEvaluacion(id_asignatura: number): Promise<any> {
    const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);
    const strategy = this.strategies.get(nivelEducativo);

    if (!strategy) {
      throw new BadRequestException(
        `No se encontró estrategia de evaluación para el nivel: ${nivelEducativo}`,
      );
    }

    return strategy.obtenerConfiguracion();
  }

  /**
   * Obtiene el catálogo de sistemas de evaluación disponibles
   * Este catálogo define los tipos de sistemas configurados y su número de etapas
   */
  async obtenerCatalogoSistemas(): Promise<any[]> {
    return await this.prisma.sistema_Evaluacion.findMany({
      select: {
        id_sistema_evaluacion: true,
        nombre: true,
        etapas: true,
      },
      orderBy: {
        etapas: 'desc',
      },
    });
  }

  /**
   * Obtiene los tipos de actividad disponibles según el nivel educativo
   * BÁSICA: Actividades generales sin categorización (promedio simple)
   * BACHILLERATO: Actividades categorizadas con ponderaciones específicas
   */
  async obtenerTiposActividadPorNivel(
    nivel_educativo: 'BASICA' | 'BACHILLERATO',
  ): Promise<any[]> {
    // Para BÁSICA, devolver el formato específico en orden fijo
    if (nivel_educativo === 'BASICA') {
      // Orden específico para BÁSICA:
      // 1. Tarea (permite múltiples: Tarea 1, Tarea 2)
      // 2. Revisión de libros y cuadernos (única instancia)
      // 3. Laboratorio escrito (única instancia en el orden base)
      const nombresOrdenBasica = [
        'Tarea',
        'Revisión de libros y cuadernos',
        'Laboratorio escrito',
      ];

      const tiposActividad = await this.prisma.tipoActividadEvaluacion.findMany(
        {
          where: {
            activo: true,
            aplica_a_nivel: {
              has: 'BASICA',
            },
            nombre: {
              in: nombresOrdenBasica,
            },
          },
        },
      );

      // Crear mapa para búsqueda rápida
      const tiposMap = new Map(
        tiposActividad.map((tipo) => [tipo.nombre, tipo]),
      );

      // Retornar en el orden específico
      const resultado: any[] = [];
      let ordenActual = 1;

      for (const nombre of nombresOrdenBasica) {
        const tipo = tiposMap.get(nombre);
        if (tipo) {
          resultado.push({
            id_tipo_actividad: tipo.id_tipo_actividad,
            nombre: tipo.nombre,
            categoria: null, // BÁSICA no usa categorías
            peso: null, // BÁSICA usa promedio simple (70% dividido equitativamente)
            activo: tipo.activo,
            orden: ordenActual++,
            nivel_educativo: 'BASICA',
            permite_multiples_instancias: nombre === 'Tarea', // Solo "Tarea" permite múltiples
            descripcion:
              nombre === 'Tarea'
                ? 'Se pueden agregar múltiples tareas (Tarea 1, Tarea 2, etc.)'
                : 'Actividad única',
          });
        }
      }

      return resultado;
    }

    // Para BACHILLERATO, mantener lógica original con categorías y pesos
    const tiposActividad = await this.prisma.tipoActividadEvaluacion.findMany({
      where: {
        activo: true,
        aplica_a_nivel: {
          has: nivel_educativo,
        },
      },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });

    // Definir cuáles tipos permiten múltiples instancias (pueden repetirse con número)
    const tiposConMultiplesInstancias = [
      'Tarea',
      'Laboratorio escrito',
      'Exposición',
      'Proyecto',
      'Investigación',
      'Práctica',
    ];

    // Formatear respuesta según el nivel educativo
    return tiposActividad.map((tipo) => ({
      id_tipo_actividad: tipo.id_tipo_actividad,
      nombre: tipo.nombre,
      categoria:
        nivel_educativo === 'BACHILLERATO' ? tipo.categoria_bachillerato : null,
      peso:
        nivel_educativo === 'BACHILLERATO'
          ? tipo.peso_bachillerato
          : tipo.peso_basica,
      activo: tipo.activo,
      orden: tipo.orden,
      nivel_educativo: nivel_educativo, // Agregar el nivel educativo solicitado
      permite_multiples_instancias: tiposConMultiplesInstancias.includes(
        tipo.nombre,
      ), // Indica si se puede agregar múltiples veces (ej: Tarea 1, Tarea 2)
    }));
  }

  /**
   * Obtiene los tipos de actividad de evaluación según la asignatura
   * Determina automáticamente el nivel educativo (BASICA o BACHILLERATO)
   * basándose en el grado académico del curso de la asignatura
   */
  async obtenerTiposActividadPorAsignatura(
    id_asignatura: number,
  ): Promise<any[]> {
    // Obtener el nivel educativo de la asignatura
    const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);

    // Reutilizar el método existente
    return this.obtenerTiposActividadPorNivel(nivelEducativo);
  }

  /**
   * Obtiene el FORMATO/ESTRUCTURA de evaluación para una asignatura
   * Este método indica al frontend EXACTAMENTE qué actividades mostrar y en qué orden
   *
   * Para BÁSICA devuelve el formato fijo:
   * - Tarea 1
   * - Revisión de libros y cuadernos
   * - Tarea 2
   * - Laboratorio escrito
   *
   * Para BACHILLERATO devuelve las categorías requeridas
   */
  async obtenerFormatoEvaluacionPorAsignatura(
    id_asignatura: number,
  ): Promise<any> {
    // Obtener el nivel educativo de la asignatura
    const nivelEducativo = await this.obtenerNivelEducativo(id_asignatura);

    // Obtener la asignatura con su nombre
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
      select: {
        nombre: true,
        curso: {
          select: {
            nombre: true,
            gradoAcademico: {
              select: {
                nombre: true,
                nivel_educativo: true,
              },
            },
          },
        },
      },
    });

    if (nivelEducativo === 'BASICA') {
      // ==========================================
      // FORMATO FIJO PARA BÁSICA
      // ==========================================
      const tipoTarea = await this.prisma.tipoActividadEvaluacion.findFirst({
        where: { nombre: 'Tarea', activo: true },
      });

      const tipoRevision = await this.prisma.tipoActividadEvaluacion.findFirst({
        where: { nombre: 'Revisión de libros y cuadernos', activo: true },
      });

      const tipoLaboratorio =
        await this.prisma.tipoActividadEvaluacion.findFirst({
          where: { nombre: 'Laboratorio escrito', activo: true },
        });

      return {
        nivel: 'BASICA',
        asignatura: {
          id: id_asignatura,
          nombre: asignatura?.nombre || '',
          curso: asignatura?.curso?.nombre || '',
          grado: asignatura?.curso?.gradoAcademico?.nombre || '',
        },
        formato: 'FIJO', // Indica que es un formato predefinido
        instrucciones:
          'Ingrese las notas en el orden especificado. Las Tareas pueden tener números (1, 2, etc.)',
        estructura_actividades: [
          {
            orden: 1,
            id_tipo_actividad: tipoTarea?.id_tipo_actividad || null,
            nombre: 'Tarea',
            numero_actividad: 1,
            etiqueta: 'Tarea 1',
            requerido: true,
            permite_multiples: true, // El frontend puede agregar más tareas si quiere
          },
          {
            orden: 2,
            id_tipo_actividad: tipoRevision?.id_tipo_actividad || null,
            nombre: 'Revisión de libros y cuadernos',
            numero_actividad: null,
            etiqueta: 'Revisión de libros y cuadernos',
            requerido: true,
            permite_multiples: false,
          },
          {
            orden: 3,
            id_tipo_actividad: tipoTarea?.id_tipo_actividad || null,
            nombre: 'Tarea',
            numero_actividad: 2,
            etiqueta: 'Tarea 2',
            requerido: true,
            permite_multiples: true,
          },
          {
            orden: 4,
            id_tipo_actividad: tipoLaboratorio?.id_tipo_actividad || null,
            nombre: 'Laboratorio escrito',
            numero_actividad: 1,
            etiqueta: 'Laboratorio escrito 1',
            requerido: true,
            permite_multiples: true,
          },
        ],
        examenes: [
          {
            nombre: 'Examen mensual',
            campo: 'examen_mensual',
            porcentaje: 30,
            requerido: true,
          },
        ],
        calculo: {
          formula: '(Promedio Actividades × 70%) + (Examen Mensual × 30%)',
          componentes: [
            {
              nombre: 'Actividades continuas',
              porcentaje: 70,
              descripcion: 'Promedio simple de todas las actividades',
            },
            {
              nombre: 'Examen mensual',
              porcentaje: 30,
              descripcion: 'Examen del mes',
            },
          ],
        },
      };
    } else {
      // ==========================================
      // FORMATO PARA BACHILLERATO
      // ==========================================
      const tiposActividad = await this.prisma.tipoActividadEvaluacion.findMany(
        {
          where: {
            activo: true,
            aplica_a_nivel: { has: 'BACHILLERATO' },
          },
          orderBy: { orden: 'asc' },
        },
      );

      return {
        nivel: 'BACHILLERATO',
        asignatura: {
          id: id_asignatura,
          nombre: asignatura?.nombre || '',
          curso: asignatura?.curso?.nombre || '',
          grado: asignatura?.curso?.gradoAcademico?.nombre || '',
        },
        formato: 'CATEGORIZADO',
        instrucciones:
          'Debe ingresar al menos una actividad de cada categoría requerida',
        categorias_requeridas: [
          {
            categoria: 'ACTIVIDAD_INTEGRADORA',
            nombre: 'Actividades Integradoras',
            porcentaje: 25,
            tipo: tiposActividad.find(
              (t) => t.categoria_bachillerato === 'ACTIVIDAD_INTEGRADORA',
            ),
            min_actividades: 1,
            requerido: true,
          },
          {
            categoria: 'TAREA',
            nombre: 'Tareas',
            porcentaje: 5,
            tipo: tiposActividad.find(
              (t) => t.categoria_bachillerato === 'TAREA',
            ),
            min_actividades: 1,
            requerido: true,
          },
          {
            categoria: 'COEVALUACION',
            nombre: 'Coevaluaciones',
            porcentaje: 5,
            tipo: tiposActividad.find(
              (t) => t.categoria_bachillerato === 'COEVALUACION',
            ),
            min_actividades: 1,
            requerido: true,
          },
          {
            categoria: 'LABORATORIO',
            nombre: 'Laboratorios/Prácticos',
            porcentaje: 10,
            tipo: tiposActividad.find(
              (t) => t.categoria_bachillerato === 'LABORATORIO',
            ),
            min_actividades: 1,
            requerido: true,
          },
        ],
        examenes: [
          {
            nombre: 'Examen Parcial',
            campo: 'examen_parcial',
            porcentaje: 25,
            requerido: true,
          },
          {
            nombre: 'Examen del Periodo',
            campo: 'examen_mensual',
            porcentaje: 30,
            requerido: true,
          },
        ],
        calculo: {
          formula:
            '(Act.Int × 25%) + (Tarea × 5%) + (Coev × 5%) + (Lab × 10%) + (Ex.Parcial × 25%) + (Ex.Periodo × 30%)',
          componentes: [
            { nombre: 'Actividades Integradoras', porcentaje: 25 },
            { nombre: 'Tareas', porcentaje: 5 },
            { nombre: 'Coevaluaciones', porcentaje: 5 },
            { nombre: 'Laboratorios/Prácticos', porcentaje: 10 },
            { nombre: 'Examen Parcial', porcentaje: 25 },
            { nombre: 'Examen del Periodo', porcentaje: 30 },
          ],
        },
      };
    }
  }

  /**
   * ========================================================
   * ============= ENDPOINTS SIMPLIFICADOS ==================
   * ========================================================
   * Estos endpoints usan formato numérico (mes: 1-12, año: 2025)
   * para mayor facilidad de uso desde el frontend
   */

  /**
   * Convierte número de mes (1-12) a nombre en español
   */
  private convertirMesNumericoANombre(mesNumerico: number): string {
    const meses = [
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
    return meses[mesNumerico - 1];
  }

  /**
   * Convierte nombre de mes a número (1-12)
   */
  private convertirNombreMesANumerico(nombreMes: string): number {
    const meses = [
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
    return meses.indexOf(nombreMes) + 1;
  }

  /**
   * Calcula automáticamente el trimestre basado en el mes numérico
   * Trimestre 1: Febrero (2), Marzo (3), Abril (4)
   * Trimestre 2: Mayo (5), Junio (6), Julio (7)
   * Trimestre 3: Agosto (8), Septiembre (9), Octubre (10)
   * Periodo 4: Noviembre (11) - Solo para Bachillerato
   */
  private calcularTrimestrePorMes(mesNumerico: number): number {
    if (mesNumerico >= 2 && mesNumerico <= 4) return 1;
    if (mesNumerico >= 5 && mesNumerico <= 7) return 2;
    if (mesNumerico >= 8 && mesNumerico <= 10) return 3;
    if (mesNumerico === 11) return 4; // Periodo 4 para Bachillerato
    throw new BadRequestException(
      `El mes ${mesNumerico} no es válido para el calendario académico. Debe ser entre 2 (Febrero) y 11 (Noviembre)`,
    );
  }

  /**
   * Crea una nota mensual usando formato simplificado (mes numérico, año numérico)
   * Internamente convierte a formato string y usa el método estándar calcularNotaMensual
   */
  async crearNotaSimplificada(dto: any): Promise<any> {
    // Validar campos requeridos
    if (!dto.id_alumno) {
      throw new BadRequestException('id_alumno es requerido');
    }
    if (!dto.id_asignatura) {
      throw new BadRequestException('id_asignatura es requerido');
    }
    if (!dto.mes_numerico && !dto.mes) {
      throw new BadRequestException('mes_numerico o mes es requerido');
    }
    if (!dto.anio) {
      throw new BadRequestException('anio es requerido');
    }
    if (!dto.actividades || !Array.isArray(dto.actividades)) {
      throw new BadRequestException(
        'actividades es requerido y debe ser un array',
      );
    }
    if (dto.examen_mensual === undefined || dto.examen_mensual === null) {
      throw new BadRequestException('examen_mensual es requerido');
    }

    // Normalizar mes_numerico (puede venir como 'mes')
    const mesNumerico = dto.mes_numerico || dto.mes;
    if (!mesNumerico) {
      throw new BadRequestException('mes_numerico es requerido');
    }

    // Convertir mes numérico a nombre
    const mesNombre = this.convertirMesNumericoANombre(parseInt(mesNumerico));

    // Calcular trimestre automáticamente si no viene
    const trimestre =
      dto.trimestre || this.calcularTrimestrePorMes(parseInt(mesNumerico));

    // Construir DTO en formato estándar
    const dtoEstandar = {
      id_alumno: parseInt(dto.id_alumno),
      id_asignatura: parseInt(dto.id_asignatura),
      mes: mesNombre,
      trimestre: parseInt(trimestre),
      anio_academico: dto.anio.toString(),
      actividades: dto.actividades.map((act: any) => ({
        id_tipo_actividad: parseInt(act.id_tipo_actividad),
        numero_actividad: act.numero_actividad
          ? parseInt(act.numero_actividad)
          : null,
        nota: parseFloat(act.nota),
      })),
      examen_mensual: parseFloat(dto.examen_mensual),
      examen_parcial: dto.examen_parcial
        ? parseFloat(dto.examen_parcial)
        : undefined,
    };

    // Usar el método existente
    const resultado = await this.calcularNotaMensual(dtoEstandar);

    // Convertir respuesta a formato simplificado
    return {
      ...resultado,
      mes_numerico: parseInt(mesNumerico),
      anio: parseInt(dto.anio),
    };
  }

  /**
   * Consulta notas mensuales usando filtros simplificados (mes numérico, año numérico)
   */
  async consultarNotasSimplificadas(filtros: any): Promise<any[]> {
    // Construir filtros en formato estándar
    const where: any = {};

    if (filtros.id_alumno) {
      // Convertir a número si viene como string
      where.id_alumno = parseInt(filtros.id_alumno);
    }

    if (filtros.id_asignatura) {
      // Convertir a número si viene como string
      where.id_asignatura = parseInt(filtros.id_asignatura);
    }

    if (filtros.mes_numerico) {
      // Convertir mes numérico a nombre de mes para la consulta
      const mesNumerico = parseInt(filtros.mes_numerico);
      where.mes = this.convertirMesNumericoANombre(mesNumerico);
    }

    if (filtros.trimestre) {
      // Convertir a número si viene como string
      where.trimestre = parseInt(filtros.trimestre);
    }

    if (filtros.anio) {
      // Convertir a string para anio_academico
      where.anio_academico = filtros.anio.toString();
    }

    // Consultar notas
    const notas = await this.prisma.notaMensual.findMany({
      where,
      include: {
        asignatura: {
          select: {
            nombre: true,
          },
        },
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        actividades: {
          include: {
            tipoActividad: true,
          },
          orderBy: {
            id_actividad_evaluacion: 'asc',
          },
        },
      },
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'asc' },
        { mes: 'asc' },
      ],
    });

    // Convertir respuesta a formato simplificado
    return notas.map((nota) => ({
      id_nota_mensual: nota.id_nota_mensual,
      id_alumno: nota.id_alumno,
      id_asignatura: nota.id_asignatura,
      alumno: nota.alumno,
      asignatura: nota.asignatura,
      mes_numerico: this.convertirNombreMesANumerico(nota.mes),
      mes_nombre: nota.mes,
      trimestre: nota.trimestre,
      anio: parseInt(nota.anio_academico),
      actividades: nota.actividades.map((act) => ({
        id_actividad_evaluacion: act.id_actividad_evaluacion,
        id_tipo_actividad: act.id_tipo_actividad,
        tipo_actividad_nombre: act.tipoActividad.nombre,
        numero_actividad: act.numero_actividad,
        nota: act.nota,
        nombre_completo: act.numero_actividad
          ? `${act.tipoActividad.nombre} ${act.numero_actividad}`
          : act.tipoActividad.nombre,
      })),
      examen_mensual: nota.examen_mensual,
      examen_parcial: nota.examen_parcial,
      promedio_puro_actividades: nota.promedio_puro_actividades,
      promedio_70_actividades: nota.promedio_70_actividades,
      promedio_30_examen: nota.promedio_30_examen,
      nota_mensual: nota.nota_mensual,
      porcentaje_aporte: nota.porcentaje_aporte,
      aporte_al_trimestre: nota.aporte_al_trimestre,
      fecha_registro: nota.fecha_registro,
      actualizado_en: nota.actualizado_en,
    }));
  }

  /**
   * Obtiene una nota mensual por ID usando formato simplificado
   */
  async obtenerNotaSimplificadaPorId(id_nota_mensual: number): Promise<any> {
    const nota = await this.prisma.notaMensual.findUnique({
      where: { id_nota_mensual },
      include: {
        asignatura: {
          select: {
            nombre: true,
          },
        },
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        actividades: {
          include: {
            tipoActividad: true,
          },
          orderBy: {
            id_actividad_evaluacion: 'asc',
          },
        },
      },
    });

    if (!nota) {
      throw new NotFoundException(
        `Nota mensual con ID ${id_nota_mensual} no encontrada`,
      );
    }

    // Convertir respuesta a formato simplificado
    return {
      id_nota_mensual: nota.id_nota_mensual,
      id_alumno: nota.id_alumno,
      id_asignatura: nota.id_asignatura,
      alumno: nota.alumno,
      asignatura: nota.asignatura,
      mes_numerico: this.convertirNombreMesANumerico(nota.mes),
      mes_nombre: nota.mes,
      trimestre: nota.trimestre,
      anio: parseInt(nota.anio_academico),
      actividades: nota.actividades.map((act) => ({
        id_actividad_evaluacion: act.id_actividad_evaluacion,
        id_tipo_actividad: act.id_tipo_actividad,
        tipo_actividad_nombre: act.tipoActividad.nombre,
        numero_actividad: act.numero_actividad,
        nota: act.nota,
        nombre_completo: act.numero_actividad
          ? `${act.tipoActividad.nombre} ${act.numero_actividad}`
          : act.tipoActividad.nombre,
      })),
      examen_mensual: nota.examen_mensual,
      examen_parcial: nota.examen_parcial,
      promedio_puro_actividades: nota.promedio_puro_actividades,
      promedio_70_actividades: nota.promedio_70_actividades,
      promedio_30_examen: nota.promedio_30_examen,
      nota_mensual: nota.nota_mensual,
      porcentaje_aporte: nota.porcentaje_aporte,
      aporte_al_trimestre: nota.aporte_al_trimestre,
      fecha_registro: nota.fecha_registro,
      actualizado_en: nota.actualizado_en,
    };
  }
}

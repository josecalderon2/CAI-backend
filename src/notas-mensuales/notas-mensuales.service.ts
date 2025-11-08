import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateNotaMensualDto,
  UpdateNotaMensualDto,
  QueryNotaMensualDto,
  NotaMensualResponseDto,
} from './dto';

@Injectable()
export class NotasMensualesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el promedio puro de las actividades (sin examen)
   * Promedio Puro = Suma de actividades / Cantidad de actividades
   */
  private calcularPromedioPuroActividades(notas: {
    tarea_1?: number;
    revision_libros_cuadernos?: number;
    tarea_2?: number;
    laboratorio_escrito?: number;
  }): number {
    const actividades = [
      notas.tarea_1,
      notas.revision_libros_cuadernos,
      notas.tarea_2,
      notas.laboratorio_escrito,
    ].filter((nota) => nota !== undefined && nota !== null);

    if (actividades.length === 0) {
      return 0;
    }

    const suma = actividades.reduce((acc, nota) => acc + nota, 0);
    const promedioPuro = suma / actividades.length;

    // Redondear a 3 decimales
    return Math.round(promedioPuro * 1000) / 1000;
  }

  /**
   * Calcula todos los componentes del sistema de evaluación:
   * - Promedio Puro: Promedio simple de actividades
   * - Promedio Actividades 70%: Promedio Puro × 0.70
   * - Promedio Examen 30%: Nota del examen × 0.30
   * - Nota Mensual: Promedio Actividades 70% + Promedio Examen 30%
   */
  private calcularNotaMensual(notas: {
    tarea_1?: number;
    revision_libros_cuadernos?: number;
    tarea_2?: number;
    laboratorio_escrito?: number;
    examen_mensual?: number;
  }): {
    promedio_puro_actividades: number;
    promedio_70_actividades: number;
    promedio_30_examen: number;
    nota_mensual: number;
  } {
    // 1. Promedio Puro de Actividades
    const promedio_puro_actividades = this.calcularPromedioPuroActividades(notas);

    // 2. Promedio Actividades 70%
    const promedio_70_actividades = Math.round(promedio_puro_actividades * 0.7 * 1000) / 1000;

    // 3. Promedio Examen 30%
    const examen = notas.examen_mensual || 0;
    const promedio_30_examen = Math.round(examen * 0.3 * 1000) / 1000;

    // 4. Nota Mensual = Promedio Actividades 70% + Promedio Examen 30%
    const nota_mensual = Math.round((promedio_70_actividades + promedio_30_examen) * 1000) / 1000;

    return {
      promedio_puro_actividades,
      promedio_70_actividades,
      promedio_30_examen,
      nota_mensual,
    };
  }

  /**
   * Convierte el número de mes a nombre de mes en español
   */
  private obtenerNombreMes(mes: number): string {
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
    return meses[mes - 1];
  }

  /**
   * Determina el trimestre basado en el mes
   * Trimestre 1: Febrero (2), Marzo (3), Abril (4)
   * Trimestre 2: Mayo (5), Junio (6), Julio (7)
   * Trimestre 3: Agosto (8), Septiembre (9), Octubre (10)
   */
  private obtenerTrimestre(mes: number): number {
    if (mes >= 2 && mes <= 4) return 1;
    if (mes >= 5 && mes <= 7) return 2;
    if (mes >= 8 && mes <= 10) return 3;
    throw new BadRequestException(
      'El mes debe estar entre 2 (Febrero) y 10 (Octubre) para el sistema trimestral',
    );
  }

  /**
   * Crear una nueva nota mensual
   */
  async create(
    createDto: CreateNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    // Verificar que el alumno existe
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: createDto.id_alumno },
    });

    if (!alumno) {
      throw new NotFoundException(
        `Alumno con ID ${createDto.id_alumno} no encontrado`,
      );
    }

    // Verificar que la asignatura existe
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: createDto.id_asignatura },
    });

    if (!asignatura) {
      throw new NotFoundException(
        `Asignatura con ID ${createDto.id_asignatura} no encontrada`,
      );
    }

    // Verificar que no existe una nota para el mismo alumno, asignatura, mes y año
    const notaExistente = await this.prisma.notaMensual.findFirst({
      where: {
        id_alumno: createDto.id_alumno,
        id_asignatura: createDto.id_asignatura,
        mes: this.obtenerNombreMes(createDto.mes),
        anio_academico: createDto.anio.toString(),
      },
    });

    if (notaExistente) {
      throw new ConflictException(
        `Ya existe una nota mensual para el alumno ${createDto.id_alumno}, asignatura ${createDto.id_asignatura}, mes ${createDto.mes} y año ${createDto.anio}`,
      );
    }

    // Calcular todos los componentes de la nota mensual
    const calculoNota = this.calcularNotaMensual({
      tarea_1: createDto.tarea_1,
      revision_libros_cuadernos: createDto.revision_libros_cuadernos,
      tarea_2: createDto.tarea_2,
      laboratorio_escrito: createDto.laboratorio_escrito,
      examen_mensual: createDto.examen_mensual,
    });

    // Obtener el trimestre
    const trimestre = this.obtenerTrimestre(createDto.mes);

    // Calcular el aporte al trimestre según el mes
    const porcentaje_aporte = trimestre === 1 ? 28 : trimestre === 2 ? 27 : 45;
    const aporte_al_trimestre = Math.round(calculoNota.nota_mensual * (porcentaje_aporte / 100) * 1000) / 1000;

    // NOTA: Esta es una versión simplificada que no guarda las notas individuales
    // en la tabla ActividadEvaluacion. Si necesitas guardarlas, habría que crear
    // registros en esa tabla también.

    // Crear la nota mensual en la base de datos
    const notaMensual = await this.prisma.notaMensual.create({
      data: {
        id_alumno: createDto.id_alumno,
        id_asignatura: createDto.id_asignatura,
        mes: this.obtenerNombreMes(createDto.mes),
        trimestre: trimestre,
        anio_academico: createDto.anio.toString(),
        examen_mensual: createDto.examen_mensual || 0,
        promedio_puro_actividades: calculoNota.promedio_puro_actividades,
        promedio_70_actividades: calculoNota.promedio_70_actividades,
        promedio_30_examen: calculoNota.promedio_30_examen,
        nota_mensual: calculoNota.nota_mensual,
        porcentaje_aporte: porcentaje_aporte,
        aporte_al_trimestre: aporte_al_trimestre,
      },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        asignatura: {
          select: {
            nombre: true,
          },
        },
      },
    });

    return {
      id: notaMensual.id_nota_mensual,
      id_alumno: notaMensual.id_alumno,
      id_asignatura: notaMensual.id_asignatura,
      mes: createDto.mes,
      anio: createDto.anio,
      tarea_1: createDto.tarea_1,
      revision_libros_cuadernos: createDto.revision_libros_cuadernos,
      tarea_2: createDto.tarea_2,
      laboratorio_escrito: createDto.laboratorio_escrito,
      examen_mensual: createDto.examen_mensual,
      promedio_puro_actividades: calculoNota.promedio_puro_actividades,
      promedio_70_actividades: calculoNota.promedio_70_actividades,
      promedio_30_examen: calculoNota.promedio_30_examen,
      promedio: calculoNota.nota_mensual,
      fecha_creacion: notaMensual.fecha_registro,
      fecha_actualizacion: notaMensual.actualizado_en,
    };
  }

  /**
   * Actualizar una nota mensual existente
   * NOTA: Como las notas individuales no se almacenan, este método solo puede actualizar
   * el examen mensual. Para actualizar actividades, se debe usar el módulo sistema-evaluacion
   * que sí maneja la tabla ActividadEvaluacion.
   */
  async update(
    id: number,
    updateDto: UpdateNotaMensualDto,
  ): Promise<NotaMensualResponseDto> {
    // Verificar que la nota existe
    const notaExistente = await this.prisma.notaMensual.findUnique({
      where: { id_nota_mensual: id },
    });

    if (!notaExistente) {
      throw new NotFoundException(`Nota mensual con ID ${id} no encontrada`);
    }

    // Solo podemos actualizar el examen mensual en esta versión simplificada
    // Para actualizar actividades completas, usar sistema-evaluacion
    const examenActualizado = updateDto.examen_mensual ?? notaExistente.examen_mensual;
    
    // Recalcular con el nuevo examen (manteniendo el promedio de actividades existente)
    const promedio_puro_actividades = notaExistente.promedio_puro_actividades;
    const promedio_70_actividades = Math.round(promedio_puro_actividades * 0.7 * 1000) / 1000;
    const promedio_30_examen = Math.round(examenActualizado * 0.3 * 1000) / 1000;
    const nota_mensual = Math.round((promedio_70_actividades + promedio_30_examen) * 1000) / 1000;

    const trimestre = notaExistente.trimestre;
    const porcentaje_aporte = trimestre === 1 ? 28 : trimestre === 2 ? 27 : 45;
    const aporte_al_trimestre = Math.round(nota_mensual * (porcentaje_aporte / 100) * 1000) / 1000;

    // Actualizar la nota mensual
    const notaActualizada = await this.prisma.notaMensual.update({
      where: { id_nota_mensual: id },
      data: {
        examen_mensual: examenActualizado,
        promedio_70_actividades: promedio_70_actividades,
        promedio_30_examen: promedio_30_examen,
        nota_mensual: nota_mensual,
        aporte_al_trimestre: aporte_al_trimestre,
      },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        asignatura: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // Extraer el mes numérico del nombre del mes
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
    const mesNumerico = nombresMeses.indexOf(notaActualizada.mes) + 1;

    return {
      id: notaActualizada.id_nota_mensual,
      id_alumno: notaActualizada.id_alumno,
      id_asignatura: notaActualizada.id_asignatura,
      mes: mesNumerico,
      anio: parseInt(notaActualizada.anio_academico),
      tarea_1: updateDto.tarea_1,
      revision_libros_cuadernos: updateDto.revision_libros_cuadernos,
      tarea_2: updateDto.tarea_2,
      laboratorio_escrito: updateDto.laboratorio_escrito,
      examen_mensual: notaActualizada.examen_mensual,
      promedio_puro_actividades: notaActualizada.promedio_puro_actividades,
      promedio_70_actividades: notaActualizada.promedio_70_actividades,
      promedio_30_examen: notaActualizada.promedio_30_examen,
      promedio: notaActualizada.nota_mensual,
      fecha_creacion: notaActualizada.fecha_registro,
      fecha_actualizacion: notaActualizada.actualizado_en,
    };
  }

  /**
   * Buscar notas mensuales con filtros opcionales
   */
  async findAll(query: QueryNotaMensualDto): Promise<NotaMensualResponseDto[]> {
    const where: any = {};

    if (query.id_alumno) {
      where.id_alumno = query.id_alumno;
    }

    if (query.id_asignatura) {
      where.id_asignatura = query.id_asignatura;
    }

    if (query.mes) {
      where.mes = this.obtenerNombreMes(query.mes);
    }

    if (query.anio) {
      where.anio_academico = query.anio.toString();
    }

    const notas = await this.prisma.notaMensual.findMany({
      where,
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        asignatura: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'asc' },
        { mes: 'asc' },
      ],
    });

    // Convertir nombres de meses a números
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

    return notas.map((nota) => ({
      id: nota.id_nota_mensual,
      id_alumno: nota.id_alumno,
      id_asignatura: nota.id_asignatura,
      mes: nombresMeses.indexOf(nota.mes) + 1,
      anio: parseInt(nota.anio_academico),
      // Estos campos no están en el schema actual, por lo que retornamos undefined
      tarea_1: undefined,
      revision_libros_cuadernos: undefined,
      tarea_2: undefined,
      laboratorio_escrito: undefined,
      examen_mensual: nota.examen_mensual,
      promedio_puro_actividades: nota.promedio_puro_actividades,
      promedio_70_actividades: nota.promedio_70_actividades,
      promedio_30_examen: nota.promedio_30_examen,
      promedio: nota.nota_mensual,
      fecha_creacion: nota.fecha_registro,
      fecha_actualizacion: nota.actualizado_en,
    }));
  }

  /**
   * Buscar una nota mensual por ID
   */
  async findOne(id: number): Promise<NotaMensualResponseDto> {
    const nota = await this.prisma.notaMensual.findUnique({
      where: { id_nota_mensual: id },
      include: {
        alumno: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        asignatura: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!nota) {
      throw new NotFoundException(`Nota mensual con ID ${id} no encontrada`);
    }

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
    const mesNumerico = nombresMeses.indexOf(nota.mes) + 1;

    return {
      id: nota.id_nota_mensual,
      id_alumno: nota.id_alumno,
      id_asignatura: nota.id_asignatura,
      mes: mesNumerico,
      anio: parseInt(nota.anio_academico),
      tarea_1: undefined,
      revision_libros_cuadernos: undefined,
      tarea_2: undefined,
      laboratorio_escrito: undefined,
      examen_mensual: nota.examen_mensual,
      promedio_puro_actividades: nota.promedio_puro_actividades,
      promedio_70_actividades: nota.promedio_70_actividades,
      promedio_30_examen: nota.promedio_30_examen,
      promedio: nota.nota_mensual,
      fecha_creacion: nota.fecha_registro,
      fecha_actualizacion: nota.actualizado_en,
    };
  }
}

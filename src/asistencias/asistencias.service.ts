import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAsistenciaDto,
  UpdateAsistenciaDto,
  AsistenciaResponse,
} from './dto';
import { AccionAsistencia } from '@prisma/client';
import { buildAsistenciaHistorialInput } from './utils/asistencia-history.util';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea o actualiza registros de asistencia (individual o en bloque)
   * + historial minimal (CREATE/UPDATE) en transacción.
   */
  async create(
    createAsistenciaDto: CreateAsistenciaDto[],
  ): Promise<AsistenciaResponse[]> {
    const resultados: AsistenciaResponse[] = [];

    for (const asistencia of createAsistenciaDto) {
      const {
        id_alumno,
        id_asignatura,
        id_orientador,
        fecha,
        estado,
        observacion,
      } = asistencia;

      // 1) Validar asignatura
      const asignaturaExiste = await this.prisma.asignatura.findUnique({
        where: { id_asignatura },
      });
      if (!asignaturaExiste) {
        throw new NotFoundException(
          `La asignatura con ID ${id_asignatura} no existe.`,
        );
      }

      // 2) Validar docente-asignatura activa
      const docenteAsignado = await this.prisma.asignaturaOrientador.findFirst({
        where: { id_asignatura, id_orientador, activo: true },
      });
      if (!docenteAsignado) {
        throw new ConflictException(
          `El docente con ID ${id_orientador} no está asignado a la asignatura ${id_asignatura}.`,
        );
      }

      // 3) Transacción: upsert + historial
      const registro = await this.prisma.$transaction(async (tx) => {
        const before = await tx.asistencia.findUnique({
          where: {
            id_alumno_id_asignatura_fecha: {
              id_alumno,
              id_asignatura,
              fecha: new Date(fecha),
            },
          },
        });

        const current = await tx.asistencia.upsert({
          where: {
            id_alumno_id_asignatura_fecha: {
              id_alumno,
              id_asignatura,
              fecha: new Date(fecha),
            },
          },
          update: { estado, observacion },
          create: {
            id_alumno,
            id_asignatura,
            id_orientador,
            fecha: new Date(fecha),
            estado,
            observacion,
          },
          include: {
            alumno: true,
            asignatura: true,
            orientador: true,
          },
        });

        const accion = before
          ? AccionAsistencia.UPDATE
          : AccionAsistencia.CREATE;

        await tx.asistenciaHistorial.create({
          data: buildAsistenciaHistorialInput({
            accion,
            before: before
              ? {
                  id_asistencia: before.id_asistencia,
                  id_alumno: before.id_alumno,
                  id_asignatura: before.id_asignatura,
                  fecha: before.fecha,
                  estado: before.estado,
                  observacion: before.observacion,
                }
              : null,
            after: {
              id_asistencia: current.id_asistencia,
              id_alumno: current.id_alumno,
              id_asignatura: current.id_asignatura,
              fecha: current.fecha,
              estado: current.estado,
              observacion: current.observacion,
            },
            // docente que registra el pase
            id_orientador_registro: id_orientador,
          }),
        });

        return current;
      });

      resultados.push(registro as unknown as AsistenciaResponse);
    }

    return resultados;
  }

  /**
   * Obtiene todas las asistencias de una asignatura en una fecha específica
   */
  async findByAsignaturaAndFecha(
    id_asignatura: number,
    fecha: string,
  ): Promise<AsistenciaResponse[]> {
    const asignaturaExiste = await this.prisma.asignatura.findUnique({
      where: { id_asignatura },
    });

    if (!asignaturaExiste) {
      throw new NotFoundException(
        `La asignatura con ID ${id_asignatura} no existe.`,
      );
    }

    return this.prisma.asistencia.findMany({
      where: { id_asignatura, fecha: new Date(fecha) },
      include: {
        alumno: true,
        asignatura: true,
        orientador: true,
      },
      orderBy: { id_alumno: 'asc' },
    }) as unknown as AsistenciaResponse[];
  }

  /**
   * Actualiza un registro de asistencia (estado u observación)
   * + historial minimal (UPDATE) en transacción.
   */
  async update(
    id_asistencia: number,
    updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    try {
      // Validar que venga al menos un campo parcheable
      const { estado, observacion } = updateAsistenciaDto;
      const hasAnyField =
        typeof estado !== 'undefined' || typeof observacion !== 'undefined';
      if (!hasAnyField) {
        throw new BadRequestException(
          'Debe enviar al menos un campo para actualizar (estado u observacion).',
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // 1) Antes
        const before = await tx.asistencia.findUnique({
          where: { id_asistencia },
        });

        if (!before) {
          throw new NotFoundException(
            `La asistencia con ID ${id_asistencia} no fue encontrada.`,
          );
        }

        // 2) Construir patch solo con campos presentes
        const dataPatch: Record<string, any> = {};
        if (typeof estado !== 'undefined') dataPatch.estado = estado;
        if (typeof observacion !== 'undefined')
          dataPatch.observacion = observacion;

        // 3) Detectar no-op (nada cambia realmente)
        const noEstadoChange =
          typeof estado === 'undefined' || estado === before.estado;
        const noObsChange =
          typeof observacion === 'undefined' ||
          observacion === before.observacion;

        const isNoOp = noEstadoChange && noObsChange;

        if (isNoOp) {
          // No escribir ni historizar si no cambia nada
          const unchanged = await tx.asistencia.findUnique({
            where: { id_asistencia },
            include: {
              alumno: {
                select: { id_alumno: true, nombre: true, apellido: true },
              },
              asignatura: { select: { id_asignatura: true, nombre: true } },
              orientador: {
                select: { id_orientador: true, nombre: true, apellido: true },
              },
            },
          });
          return unchanged!;
        }

        // 4) Aplicar patch
        const after = await tx.asistencia.update({
          where: { id_asistencia },
          data: dataPatch,
          include: {
            alumno: {
              select: { id_alumno: true, nombre: true, apellido: true },
            },
            asignatura: { select: { id_asignatura: true, nombre: true } },
            orientador: {
              select: { id_orientador: true, nombre: true, apellido: true },
            },
          },
        });

        // 5) Registrar historial solo si hubo cambios
        await tx.asistenciaHistorial.create({
          data: buildAsistenciaHistorialInput({
            accion: AccionAsistencia.UPDATE,
            before: {
              id_asistencia: before.id_asistencia,
              id_alumno: before.id_alumno,
              id_asignatura: before.id_asignatura,
              fecha: before.fecha,
              estado: before.estado,
              observacion: before.observacion,
            },
            after: {
              id_asistencia: after.id_asistencia,
              id_alumno: after.alumno.id_alumno,
              id_asignatura: after.asignatura.id_asignatura,
              fecha: after.fecha,
              estado: after.estado,
              observacion: after.observacion,
            },
            // quién ejecutó el cambio: por defecto, el dueño original del registro
            id_orientador_registro: before.id_orientador,
          }),
        });

        return after;
      });

      return result as unknown as AsistenciaResponse;
    } catch (error) {
      console.error('❌ Error en update (PATCH):', error);
      if (error.status) throw error;

      if (error.code === 'P2025') {
        throw new NotFoundException(
          `La asistencia con ID ${id_asistencia} no fue encontrada.`,
        );
      }

      throw new InternalServerErrorException(
        `Error al actualizar asistencia: ${error.message}`,
      );
    }
  }

  /**
   * 🔍 Obtiene todas las asistencias registradas por un docente
   */
  async findByDocente(id_orientador: number) {
    try {
      const asistencias = await this.prisma.asistencia.findMany({
        where: { id_orientador },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          asignatura: {
            select: { id_asignatura: true, nombre: true, id_curso: true },
          },
        },
        orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
      });

      if (!asistencias.length) {
        throw new NotFoundException(
          `El docente con ID ${id_orientador} no tiene asistencias registradas.`,
        );
      }

      return asistencias as unknown as AsistenciaResponse[];
    } catch (error) {
      console.error('❌ Error en findByDocente:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * 🔍 Historial de asistencias de un alumno (operativo)
   */
  async findByAlumno(id_alumno: number) {
    try {
      const asistencias = await this.prisma.asistencia.findMany({
        where: { id_alumno },
        include: {
          asignatura: {
            select: { id_asignatura: true, nombre: true, id_curso: true },
          },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
        },
        orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
      });

      if (!asistencias.length) {
        throw new NotFoundException(
          `El alumno con ID ${id_alumno} no tiene asistencias registradas.`,
        );
      }

      return asistencias as unknown as AsistenciaResponse[];
    } catch (error) {
      console.error('❌ Error en findByAlumno:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAsistenciaDto,
  UpdateAsistenciaDto,
  AsistenciaResponse,
} from './dto';

@Injectable()
export class AsistenciaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea o actualiza registros de asistencia (individual o en bloque)
   */
  async create(
    createAsistenciaDto: CreateAsistenciaDto[],
  ): Promise<AsistenciaResponse[]> {
    const resultados: AsistenciaResponse[] = [];

    for (const asistencia of createAsistenciaDto) {
      const { id_alumno, id_asignatura, id_orientador, fecha, estado, observacion } =
        asistencia;

      // Verificar que la asignatura exista
      const asignaturaExiste = await this.prisma.asignatura.findUnique({
        where: { id_asignatura },
      });

      if (!asignaturaExiste) {
        throw new NotFoundException(
          `La asignatura con ID ${id_asignatura} no existe.`,
        );
      }

      // Verificar que el docente esté asignado a esa asignatura
      const docenteAsignado = await this.prisma.asignaturaOrientador.findFirst({
        where: {
          id_asignatura,
          id_orientador,
          activo: true,
        },
      });

      if (!docenteAsignado) {
        throw new ConflictException(
          `El docente con ID ${id_orientador} no está asignado a la asignatura ${id_asignatura}.`,
        );
      }

      // Crear o actualizar la asistencia
      const registro = await this.prisma.asistencia.upsert({
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
      where: {
        id_asignatura,
        fecha: new Date(fecha),
      },
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
   */
  async update(
    id_asistencia: number,
    updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    try {
      const asistencia = await this.prisma.asistencia.findUnique({
        where: { id_asistencia },
      });

      if (!asistencia) {
        throw new NotFoundException(
          `La asistencia con ID ${id_asistencia} no fue encontrada.`,
        );
      }

      const asistenciaActualizada = await this.prisma.asistencia.update({
        where: { id_asistencia },
        data: {
          ...(updateAsistenciaDto.estado && { estado: updateAsistenciaDto.estado }),
          ...(updateAsistenciaDto.observacion && { observacion: updateAsistenciaDto.observacion }),
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          asignatura: { select: { id_asignatura: true, nombre: true } },
          orientador: { select: { id_orientador: true, nombre: true, apellido: true } },
        },
      });

      return asistenciaActualizada as unknown as AsistenciaResponse;
    } catch (error) {
      console.error('❌ Error en update:', error);
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
   * Incluye información del alumno, asignatura y detalles básicos
   */
  async findByDocente(id_orientador: number) {
    try {
      // Trae todas las asistencias registradas por el docente
      const asistencias = await this.prisma.asistencia.findMany({
        where: { id_orientador },
        include: {
          alumno: {
            select: { id_alumno: true, nombre: true, apellido: true },
          },
          asignatura: {
            select: { id_asignatura: true, nombre: true, id_curso: true },
          },
        },
        orderBy: [{ fecha: 'desc' }, { id_asignatura: 'asc' }],
      });

      // Si no hay registros, lanza excepción descriptiva
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
   * 🔍 Obtiene todo el historial de asistencias de un alumno
   * Incluye materia, fecha, estado, observación y el docente que la registró
   */
  async findByAlumno(id_alumno: number) {
    try {
      // Busca todas las asistencias en la tabla por el alumno
      const asistencias = await this.prisma.asistencia.findMany({
        where: { id_alumno },
        include: {
          asignatura: {
            select: {
              id_asignatura: true,
              nombre: true,
              id_curso: true,
            },
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

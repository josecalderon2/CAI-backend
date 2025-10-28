import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { BulkAsistenciaDto } from './dto/bulk-asistencia.dto';

@Injectable()
export class AsistenciaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra la asistencia para múltiples alumnos en una transacción.
   * Utiliza upsert para ser idempotente (evitar duplicados).
   */
  async createBulk(dto: BulkAsistenciaDto) {
    const { registros } = dto;

    const upsertOperations = registros.map((registro) => {
      // Clave única para el upsert
      const where = {
        id_alumno_id_asignatura_fecha: {
          id_alumno: registro.id_alumno,
          id_asignatura: registro.id_asignatura,
          fecha: registro.fecha,
        },
      };

      return this.prisma.asistencia.upsert({
        where: where,
        update: {
          estado: registro.estado,
          observacion: registro.observacion,
          id_orientador: registro.id_orientador, // Actualiza quién lo modificó
        },
        create: registro,
      });
    });

    // Ejecuta todas las operaciones en una sola transacción
    return this.prisma.$transaction(upsertOperations);
  }

  /**
   * Crea un único registro de asistencia (para correcciones).
   */
  async create(dto: CreateAsistenciaDto) {
    return this.prisma.asistencia.create({
      data: dto,
    });
  }

  /**
   * Obtiene todos los registros de asistencia.
   */
  async findAll() {
    return this.prisma.asistencia.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
    });
  }

  /**
   * Obtiene un registro de asistencia por ID.
   */
  async findOne(id_asistencia: number) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id_asistencia },
      include: {
        alumno: true,
        asignatura: true,
        orientador: true,
      },
    });
    if (!asistencia) {
      throw new NotFoundException(
        `Registro de asistencia con ID ${id_asistencia} no encontrado.`,
      );
    }
    return asistencia;
  }

  /**
   * Obtiene todos los registros de asistencia de un alumno.
   */
  async findByStudent(id_alumno: number) {
    return this.prisma.asistencia.findMany({
      where: { id_alumno },
      orderBy: { fecha: 'desc' },
      include: {
        asignatura: { select: { nombre: true } },
        orientador: { select: { nombre: true, apellido: true } },
      },
    });
  }

  /**
   * Actualiza un único registro de asistencia (para correcciones).
   */
  async update(id_asistencia: number, dto: UpdateAsistenciaDto) {
    await this.findOne(id_asistencia); // Verifica que exista
    return this.prisma.asistencia.update({
      where: { id_asistencia },
      data: dto,
    });
  }

  /**
   * Elimina un único registro de asistencia.
   */
  async remove(id_asistencia: number) {
    await this.findOne(id_asistencia); // Verifica que exista
    return this.prisma.asistencia.delete({
      where: { id_asistencia },
    });
  }
}

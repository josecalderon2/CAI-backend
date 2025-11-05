import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTipoEvaluacionDto } from './dto/create-tipo-evaluacion.dto';
import { UpdateTipoEvaluacionDto } from './dto/update-tipo-evaluacion.dto';

@Injectable()
export class TipoEvaluacionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los tipos de evaluación
   * @param incluirInactivos - Si es true, retorna todos (activos e inactivos)
   */
  async findAll(incluirInactivos: boolean = false) {
    return await this.prisma.tipo_evaluacion.findMany({
      where: incluirInactivos ? {} : { activo: true },
      orderBy: {
        nombre: 'asc',
      },
      include: {
        _count: {
          select: { evaluaciones: true },
        },
      },
    });
  }

  /**
   * Obtener un tipo de evaluación por ID
   */
  async findOne(id: number) {
    const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
      where: { id_tipo_evaluacion: id },
      include: {
        _count: {
          select: { evaluaciones: true },
        },
      },
    });

    if (!tipoEvaluacion) {
      throw new NotFoundException(
        `Tipo de evaluación con ID ${id} no encontrado`,
      );
    }

    return tipoEvaluacion;
  }

  /**
   * Crear un nuevo tipo de evaluación
   */
  async create(createDto: CreateTipoEvaluacionDto) {
    // Verificar si ya existe un tipo con ese nombre (activo)
    const existente = await this.prisma.tipo_evaluacion.findFirst({
      where: {
        nombre: {
          equals: createDto.nombre,
          mode: 'insensitive',
        },
        activo: true,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tipo de evaluación activo con el nombre "${createDto.nombre}"`,
      );
    }

    return await this.prisma.tipo_evaluacion.create({
      data: {
        nombre: createDto.nombre,
        activo: true,
      },
    });
  }

  /**
   * Actualizar un tipo de evaluación
   */
  async update(id: number, updateDto: UpdateTipoEvaluacionDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se va a actualizar el nombre, verificar que no exista otro con ese nombre
    if (updateDto.nombre) {
      const existente = await this.prisma.tipo_evaluacion.findFirst({
        where: {
          nombre: {
            equals: updateDto.nombre,
            mode: 'insensitive',
          },
          id_tipo_evaluacion: {
            not: id,
          },
          activo: true,
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe otro tipo de evaluación activo con el nombre "${updateDto.nombre}"`,
        );
      }
    }

    return await this.prisma.tipo_evaluacion.update({
      where: { id_tipo_evaluacion: id },
      data: updateDto,
    });
  }

  /**
   * Desactivar un tipo de evaluación
   */
  async remove(id: number) {
    // Verificar que existe
    const tipoEvaluacion = await this.findOne(id);

    // Desactivar en lugar de eliminar
    await this.prisma.tipo_evaluacion.update({
      where: { id_tipo_evaluacion: id },
      data: { activo: false },
    });

    return {
      message: `Tipo de evaluación "${tipoEvaluacion.nombre}" desactivado exitosamente`,
    };
  }
}

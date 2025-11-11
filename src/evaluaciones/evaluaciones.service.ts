import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { EvaluacionResponse } from './dto/evaluacion.response';
import { Evaluacion } from '@prisma/client';

@Injectable()
export class EvaluacionesService {
  constructor(private prisma: PrismaService) {}

  private evaluacionSelect = {
    id_evaluacion: true,
    nombre: true,
    puntaje_maximo: true,
    puntaje_minimo: true,
    anio_academico: true,
    mes: true,
    trimestre: true,
    periodo: true,
    createdAt: true,
    tipoEvaluacion: {
      select: {
        id_tipo_evaluacion: true,
        nombre: true,
        porcentaje: true,
      },
    },
    asignatura: {
      select: {
        id_asignatura: true,
        nombre: true,
      },
    },
    orientador: {
      select: {
        id_orientador: true,
        nombre: true,
        apellido: true,
      },
    },
  };

  async create(
    createEvaluacionDto: CreateEvaluacionDto,
    id_orientador: number,
  ) {
    // Verificar que el tipo de evaluación existe
    const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
      where: { id_tipo_evaluacion: createEvaluacionDto.id_tipo_evaluacion },
    });

    if (!tipoEvaluacion) {
      throw new NotFoundException('Tipo de evaluación no encontrado');
    }

    // Primero obtenemos el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador: id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la asignatura existe y pertenece al orientador
    const asignaturaOrientador =
      await this.prisma.asignaturaOrientador.findFirst({
        where: {
          id_asignatura: createEvaluacionDto.id_asignatura,
          id_orientador: orientador.id_orientador,
          activo: true,
        },
      });

    if (!asignaturaOrientador) {
      throw new ForbiddenException(
        'No tienes permiso para crear evaluaciones en esta asignatura',
      );
    }

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        ...createEvaluacionDto,
        id_orientador: orientador.id_orientador,
      },
      select: this.evaluacionSelect,
    });

    return evaluacion as unknown as EvaluacionResponse;
  }

  async findAll(id_orientador?: number) {
    // Si se proporciona un ID, buscamos primero el orientador
    let where = {};

    if (id_orientador) {
      const orientador = await this.prisma.orientador.findUnique({
        where: { id_orientador: id_orientador },
      });
      if (orientador) {
        where = { id_orientador: orientador.id_orientador };
      }
    }

    const evaluaciones = await this.prisma.evaluacion.findMany({
      where,
      select: this.evaluacionSelect,
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'desc' },
        { mes: 'desc' },
        { periodo: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return evaluaciones as unknown as EvaluacionResponse[];
  }

  async findByOrientadorAsignaturas(id_orientador: number) {
    // Verificar que el orientador existe
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Obtener las asignaturas asignadas al orientador
    const asignaturasOrientador =
      await this.prisma.asignaturaOrientador.findMany({
        where: {
          id_orientador: orientador.id_orientador,
          activo: true,
        },
        select: {
          id_asignatura: true,
        },
      });

    // Extraer los IDs de las asignaturas
    const asignaturasIds = asignaturasOrientador.map(
      (ao) => ao.id_asignatura,
    );

    // Obtener todas las evaluaciones de esas asignaturas
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: {
        id_asignatura: {
          in: asignaturasIds,
        },
      },
      select: this.evaluacionSelect,
      orderBy: [
        { anio_academico: 'desc' },
        { trimestre: 'desc' },
        { mes: 'desc' },
        { periodo: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return evaluaciones as unknown as EvaluacionResponse[];
  }

  async findOne(id: number, id_orientador?: number) {
    let where: any = { id_evaluacion: id };

    if (id_orientador) {
      const orientador = await this.prisma.orientador.findUnique({
        where: { id_orientador: id_orientador },
      });
      if (orientador) {
        where.id_orientador = orientador.id_orientador;
      }
    }

    const evaluacion = await this.prisma.evaluacion.findFirst({
      where,
      select: this.evaluacionSelect,
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    return evaluacion as unknown as EvaluacionResponse;
  }

  async update(
    id: number,
    updateEvaluacionDto: UpdateEvaluacionDto,
    id_orientador: number,
  ) {
    // Obtener el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion: id,
        id_orientador: orientador.id_orientador,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    // Si se está actualizando el tipo de evaluación, verificar que existe
    if (updateEvaluacionDto.id_tipo_evaluacion) {
      const tipoEvaluacion = await this.prisma.tipo_evaluacion.findUnique({
        where: { id_tipo_evaluacion: updateEvaluacionDto.id_tipo_evaluacion },
      });

      if (!tipoEvaluacion) {
        throw new NotFoundException('Tipo de evaluación no encontrado');
      }
    }

    // Si se está actualizando la asignatura, verificar que pertenece al orientador
    if (updateEvaluacionDto.id_asignatura) {
      const asignaturaOrientador =
        await this.prisma.asignaturaOrientador.findFirst({
          where: {
            id_asignatura: updateEvaluacionDto.id_asignatura,
            id_orientador,
            activo: true,
          },
        });

      if (!asignaturaOrientador) {
        throw new ForbiddenException(
          'No tienes permiso para asignar esta asignatura',
        );
      }
    }

    const updated = await this.prisma.evaluacion.update({
      where: { id_evaluacion: id },
      data: updateEvaluacionDto,
      select: this.evaluacionSelect,
    });

    return updated as unknown as EvaluacionResponse;
  }

  async remove(id: number, id_orientador: number) {
    // Obtener el orientador
    const orientador = await this.prisma.orientador.findUnique({
      where: { id_orientador },
    });

    if (!orientador) {
      throw new ForbiddenException('No tienes permisos de orientador');
    }

    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion: id,
        id_orientador,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    await this.prisma.evaluacion.delete({
      where: { id_evaluacion: id },
    });

    return { message: 'Evaluación eliminada correctamente' };
  }
}

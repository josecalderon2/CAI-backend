import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TiposEvaluacionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.tipo_evaluacion.findMany({
      where: {
        activo: true,
      },
      select: {
        id_tipo_evaluacion: true,
        nombre: true,
        porcentaje: true,
      },
      orderBy: {
        id_tipo_evaluacion: 'asc',
      },
    });
  }

  async getTiposEvaluacionByAsignatura(id_asignatura: number) {
    // Obtener la asignatura con su curso y grado académico
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
        'Asignatura no encontrada o no tiene grado académico asociado',
      );
    }

    // Obtener los tipos de evaluación para ese grado académico
    const tiposEvaluacion = await this.prisma.tipo_evaluacion.findMany({
      where: {
        id_grado_academico: asignatura.curso.gradoAcademico.id_grado_academico,
        activo: true,
      },
      select: {
        id_tipo_evaluacion: true,
        nombre: true,
        porcentaje: true,
      },
      orderBy: {
        porcentaje: 'desc',
      },
    });

    return tiposEvaluacion;
  }
}

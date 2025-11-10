import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { UpdateCalificacionDto } from './dto/update-calificacion.dto';
import { CalificacionResponse } from './dto/calificacion.response';

@Injectable()
export class CalificacionesService {
  constructor(private prisma: PrismaService) {}

  private calificacionSelect = {
    id_nota: true,
    calificacion: true,
    alumno: {
      select: {
        id_alumno: true,
        nombre: true,
        apellido: true,
      },
    },
    evaluacion: {
      select: {
        id_evaluacion: true,
        nombre: true,
        puntaje_maximo: true,
        puntaje_minimo: true,
      },
    },
    asignatura: {
      select: {
        id_asignatura: true,
        nombre: true,
      },
    },
  };

  async create(
    createCalificacionDto: CreateCalificacionDto,
    id_orientador: number,
  ) {
    // Verificar que la evaluación existe y pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion: createCalificacionDto.id_evaluacion,
        id_orientador,
      },
      select: {
        id_evaluacion: true,
        id_asignatura: true,
        anio_academico: true,
        trimestre: true,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(
        'Evaluación no encontrada o no tienes permiso para calificarla',
      );
    }

    // Verificar que no existe una calificación previa para este alumno en esta evaluación
    const calificacionExistente = await this.prisma.notas.findFirst({
      where: {
        id_alumno: createCalificacionDto.id_alumno,
        id_evaluacion: createCalificacionDto.id_evaluacion,
      },
    });

    if (calificacionExistente) {
      throw new ForbiddenException(
        'Ya existe una calificación para este alumno en esta evaluación',
      );
    }

    // Verificar que el alumno existe y está inscrito en algún curso
    const alumno = await this.prisma.alumno.findFirst({
      where: {
        id_alumno: createCalificacionDto.id_alumno,
        inscripciones: {
          some: {
            estado: 'ACTIVO',
            anioAcademico: evaluacion.anio_academico,
          },
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException(
        'Alumno no encontrado o no está inscrito en el año académico actual',
      );
    }

    // Crear la calificación
    const calificacion = await this.prisma.notas.create({
      data: {
        id_alumno: createCalificacionDto.id_alumno,
        id_evaluacion: createCalificacionDto.id_evaluacion,
        id_asignatura: evaluacion.id_asignatura,
        calificacion: createCalificacionDto.calificacion,
        trimestre: evaluacion.trimestre?.toString(),
      },
      select: this.calificacionSelect,
    });

    // Actualizar el promedio en el historial académico
    await this.actualizarPromedio(
      createCalificacionDto.id_alumno,
      evaluacion.anio_academico,
    );

    return calificacion as unknown as CalificacionResponse;
  }

  async findAll(id_evaluacion: number, id_orientador: number) {
    // Verificar que la evaluación pertenece al orientador
    const evaluacion = await this.prisma.evaluacion.findFirst({
      where: {
        id_evaluacion,
        id_orientador,
      },
    });

    if (!evaluacion) {
      throw new NotFoundException(
        'Evaluación no encontrada o no tienes permiso para ver las calificaciones',
      );
    }

    const calificaciones = await this.prisma.notas.findMany({
      where: {
        id_evaluacion,
      },
      select: this.calificacionSelect,
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

    return calificaciones as unknown as CalificacionResponse[];
  }

  async update(
    id: number,
    updateCalificacionDto: UpdateCalificacionDto,
    id_orientador: number,
  ) {
    // Verificar que la calificación existe y obtener todos los datos necesarios
    const calificacion = await this.prisma.notas.findFirst({
      where: {
        id_nota: id,
      },
      include: {
        evaluacion: {
          select: {
            id_orientador: true,
            anio_academico: true,
          },
        },
      },
    });

    if (!calificacion || !calificacion.evaluacion) {
      throw new NotFoundException('Calificación no encontrada');
    }

    // Verificar que la evaluación pertenece al orientador
    if (calificacion.evaluacion.id_orientador !== id_orientador) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta calificación',
      );
    }

    // Actualizar la calificación
    const updated = await this.prisma.notas.update({
      where: {
        id_nota: id,
      },
      data: {
        calificacion: updateCalificacionDto.calificacion,
      },
      select: this.calificacionSelect,
    });

    // Actualizar el promedio en el historial académico
    await this.actualizarPromedio(
      calificacion.id_alumno,
      calificacion.evaluacion.anio_academico,
    );

    return updated as unknown as CalificacionResponse;
  }

  async remove(id: number, id_orientador: number) {
    // Verificar que la calificación existe y obtener todos los datos necesarios
    const calificacion = await this.prisma.notas.findFirst({
      where: {
        id_nota: id,
      },
      include: {
        evaluacion: {
          select: {
            id_orientador: true,
            anio_academico: true,
          },
        },
      },
    });

    if (!calificacion || !calificacion.evaluacion) {
      throw new NotFoundException('Calificación no encontrada');
    }

    // Verificar que la evaluación pertenece al orientador
    if (calificacion.evaluacion.id_orientador !== id_orientador) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta calificación',
      );
    }

    const alumnoId = calificacion.id_alumno;
    const anioAcademico = calificacion.evaluacion.anio_academico;

    // Eliminar la calificación
    await this.prisma.notas.delete({
      where: {
        id_nota: id,
      },
    });

    // Actualizar el promedio en el historial académico
    await this.actualizarPromedio(alumnoId, anioAcademico);

    return { message: 'Calificación eliminada correctamente' };
  }

  private async actualizarPromedio(id_alumno: number, anio_academico: string) {
    // Obtener todas las calificaciones del alumno en el año académico actual
    const calificaciones = await this.prisma.notas.findMany({
      where: {
        id_alumno,
        evaluacion: {
          anio_academico,
        },
      },
      select: {
        calificacion: true,
      },
    });

    // Calcular el promedio
    const promedio =
      calificaciones.length > 0
        ? calificaciones.reduce(
            (acc, nota) => acc + (nota.calificacion || 0),
            0,
          ) / calificaciones.length
        : 0;

    // Actualizar el historial académico
    await this.prisma.historialAcademico.updateMany({
      where: {
        alumnoId: id_alumno,
        anioAcademico: anio_academico,
      },
      data: {
        notaPromedio: promedio,
      },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConductaDto, UpdateConductaDto, ConductaResponse } from './dto';

@Injectable()
export class ConductasService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📌 Crea un nuevo registro de conducta
   */
  async create(
    createConductaDto: CreateConductaDto,
  ): Promise<ConductaResponse> {
    try {
      const {
        id_alumno,
        id_orientador,
        descripcion,
        fecha,
        anio_academico,
        trimestre,
        id_infraccion,
      } = createConductaDto;

      // Verificar que el alumno exista
      const alumnoExiste = await this.prisma.alumno.findUnique({
        where: { id_alumno },
      });
      if (!alumnoExiste) {
        throw new NotFoundException(`El alumno con ID ${id_alumno} no existe.`);
      }

      // Verificar que el orientador exista
      const orientadorExiste = await this.prisma.orientador.findUnique({
        where: { id_orientador },
      });
      if (!orientadorExiste) {
        throw new NotFoundException(
          `El orientador con ID ${id_orientador} no existe.`,
        );
      }

      // Calcular año académico y trimestre si no se enviaron
      const fechaRegistro = new Date(fecha);
      const anio = anio_academico ?? fechaRegistro.getFullYear().toString();
      const mes = fechaRegistro.getMonth() + 1;
      const trimestreCalculado = trimestre ?? Math.ceil(mes / 3);

      const nuevaConducta = await this.prisma.conducta.create({
        data: {
          id_alumno,
          id_orientador,
          id_infraccion_catalogo: id_infraccion,
          observacion: descripcion,
          fecha: fechaRegistro,
          anio_academico: anio,
          trimestre: trimestreCalculado,
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
          infraccion: true,
        },
      });

      return nuevaConducta as unknown as ConductaResponse;
    } catch (error) {
      console.error('❌ Error al crear conducta:', error);
      if (error.status) throw error;
      throw new InternalServerErrorException(
        `Error interno al registrar conducta: ${error.message}`,
      );
    }
  }

  /**
   * ✏️ Actualiza una conducta existente
   */
  async update(
    id_conducta: number,
    updateConductaDto: UpdateConductaDto,
  ): Promise<ConductaResponse> {
    try {
      const conducta = await this.prisma.conducta.findUnique({
        where: { id_conducta },
      });

      if (!conducta) {
        throw new NotFoundException(
          `La conducta con ID ${id_conducta} no fue encontrada.`,
        );
      }

      const conductaActualizada = await this.prisma.conducta.update({
        where: { id_conducta },
        data: {
          ...(updateConductaDto.descripcion && {
            observacion: updateConductaDto.descripcion,
          }),
          ...(updateConductaDto.id_infraccion && {
            id_infraccion_catalogo: updateConductaDto.id_infraccion,
          }),
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
          infraccion: true,
        },
      });

      return conductaActualizada as unknown as ConductaResponse;
    } catch (error) {
      console.error('❌ Error en updateConducta:', error);
      if (error.status) throw error;
      throw new InternalServerErrorException(
        `Error al actualizar conducta: ${error.message}`,
      );
    }
  }

  /**
   * 🔍 Obtiene todas las conductas registradas por un orientador
   */
  async findByOrientador(id_orientador: number): Promise<ConductaResponse[]> {
    try {
      const registros = await this.prisma.conducta.findMany({
        where: { id_orientador },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
          infraccion: true,
        },
        orderBy: { fecha: 'desc' },
      });

      if (!registros.length) {
        throw new NotFoundException(
          `El orientador con ID ${id_orientador} no tiene conductas registradas.`,
        );
      }

      return registros as unknown as ConductaResponse[];
    } catch (error) {
      console.error('❌ Error en findByOrientador:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * 🔍 Obtiene todas las conductas de un alumno
   */
  async findByAlumno(id_alumno: number): Promise<ConductaResponse[]> {
    try {
      const registros = await this.prisma.conducta.findMany({
        where: { id_alumno },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
          infraccion: true,
        },
        orderBy: { fecha: 'desc' },
      });

      if (!registros.length) {
        throw new NotFoundException(
          `El alumno con ID ${id_alumno} no tiene conductas registradas.`,
        );
      }

      return registros as unknown as ConductaResponse[];
    } catch (error) {
      console.error('❌ Error en findByAlumno:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * 📅 Filtra conductas por curso y rango de fechas (mensual o trimestral)
   */
  async findByCursoYRango(
    id_curso: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<ConductaResponse[]> {
    try {
      // Buscar alumnos del curso
      const alumnos = await this.prisma.alumno.findMany({
        where: {
          cursos: {
            some: { id_curso },
          },
        },
        select: { id_alumno: true },
      });

      if (!alumnos.length) {
        throw new NotFoundException(
          `El curso con ID ${id_curso} no tiene alumnos.`,
        );
      }

      const registros = await this.prisma.conducta.findMany({
        where: {
          id_alumno: { in: alumnos.map((a) => a.id_alumno) },
          fecha: { gte: fechaInicio, lte: fechaFin },
        },
        include: {
          alumno: { select: { id_alumno: true, nombre: true, apellido: true } },
          orientador: {
            select: { id_orientador: true, nombre: true, apellido: true },
          },
          infraccion: true,
        },
        orderBy: [{ fecha: 'desc' }],
      });

      return registros as unknown as ConductaResponse[];
    } catch (error) {
      console.error('❌ Error en findByCursoYRango:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * ❌ Elimina una conducta por ID
   */
  async remove(id_conducta: number): Promise<{ message: string }> {
    try {
      const conducta = await this.prisma.conducta.findUnique({
        where: { id_conducta },
      });

      if (!conducta) {
        throw new NotFoundException(
          `La conducta con ID ${id_conducta} no existe.`,
        );
      }

      await this.prisma.conducta.delete({
        where: { id_conducta },
      });

      return { message: `Conducta ${id_conducta} eliminada exitosamente.` };
    } catch (error) {
      console.error('❌ Error en removeConducta:', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

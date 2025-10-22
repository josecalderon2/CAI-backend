import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { CursoCuposDto, ListaCursosCuposDto } from './dto/curso-cupos.dto';

const CURSO_SELECT = {
  id_curso: true,
  nombre: true,
  seccion: true,
  descripcion: true,
  id_grado_academico: true,
  id_orientador: true,
  cupo: true,
  aula: true,
  activo: true,
  gradoAcademico: { select: { id_grado_academico: true, nombre: true } },
  orientador: { select: { id_orientador: true, nombre: true, apellido: true } },
};

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  // Método para listar todos los cursos de forma simplificada (para selectores/dropdowns)
  async findAllSimple() {
    return this.prisma.curso.findMany({
      where: { activo: true },
      select: {
        id_curso: true,
        nombre: true,
        seccion: true,
        gradoAcademico: {
          select: { nombre: true },
        },
      },
      orderBy: [
        { gradoAcademico: { nombre: 'asc' } },
        { nombre: 'asc' },
        { seccion: 'asc' },
      ],
    });
  }

  async create(dto: CreateCursoDto) {
    const { id_grado_academico, id_orientador, ...rest } = dto as any;
    const data: any = { ...rest };

    if (id_grado_academico) {
      const grado = await this.prisma.grado_Academico.findUnique({
        where: { id_grado_academico: Number(id_grado_academico) },
      });
      if (!grado) throw new NotFoundException('Grado académico no encontrado');
      data.gradoAcademico = {
        connect: { id_grado_academico: Number(id_grado_academico) },
      };
    }

    if (id_orientador) {
      const ori = await this.prisma.orientador.findUnique({
        where: { id_orientador: Number(id_orientador) },
      });
      if (!ori) throw new NotFoundException('Orientador no encontrado');
      data.orientador = { connect: { id_orientador: Number(id_orientador) } };
    }

    const created = await this.prisma.curso.create({
      data: data as any,
      select: CURSO_SELECT,
    });
    return created;
  }

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const skip = (page - 1) * limit;

    const whereAny: any = {};
    if (params.activo === true || params.activo === false)
      whereAny.activo = params.activo;
    if (params.id_grado_academico)
      whereAny.id_grado_academico = Number(params.id_grado_academico);
    // modalidad se asume en Grado_Academico.opcion (gradoAcademico es relación singular en Curso)
    if (params.modalidad)
      whereAny.gradoAcademico = {
        opcion: { contains: params.modalidad, mode: 'insensitive' },
      };

    if (params.q) {
      const terms = params.q.split(' ').filter((t) => t.trim() !== '');
      whereAny.AND = terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: 'insensitive' } },
          { seccion: { contains: term, mode: 'insensitive' } },
          { descripcion: { contains: term, mode: 'insensitive' } },
          { aula: { contains: term, mode: 'insensitive' } },
          { orientador: { nombre: { contains: term, mode: 'insensitive' } } },
          { orientador: { apellido: { contains: term, mode: 'insensitive' } } },
        ],
      }));
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.curso.findMany({
        where: whereAny,
        select: CURSO_SELECT,
        skip,
        take: limit,
        orderBy: { id_curso: 'desc' },
      }),
      this.prisma.curso.count({ where: whereAny }),
    ]);

    return { page, limit, total, pages: Math.ceil(total / limit), items };
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      select: CURSO_SELECT,
    });
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);
    const { id_grado_academico, id_orientador, ...rest } = dto as any;
    const data: any = { ...rest };

    if (id_grado_academico !== undefined) {
      if (id_grado_academico === null) {
        data.gradoAcademico = { disconnect: true };
      } else {
        const grado = await this.prisma.grado_Academico.findUnique({
          where: { id_grado_academico: Number(id_grado_academico) },
        });
        if (!grado)
          throw new NotFoundException('Grado académico no encontrado');
        data.gradoAcademico = {
          connect: { id_grado_academico: Number(id_grado_academico) },
        };
      }
    }

    if (id_orientador !== undefined) {
      if (id_orientador === null) {
        data.orientador = { disconnect: true };
      } else {
        const ori = await this.prisma.orientador.findUnique({
          where: { id_orientador: Number(id_orientador) },
        });
        if (!ori) throw new NotFoundException('Orientador no encontrado');
        data.orientador = { connect: { id_orientador: Number(id_orientador) } };
      }
    }

    return this.prisma.curso.update({
      where: { id_curso: id },
      data: data as any,
      select: CURSO_SELECT,
    });
  }

  async softDelete(id: number) {
    await this.findOne(id);
    const data: any = { activo: false };
    return this.prisma.curso.update({
      where: { id_curso: id },
      data: data as any,
      select: CURSO_SELECT,
    });
  }

  async restore(id: number) {
    await this.findOne(id);
    const data: any = { activo: true };
    return this.prisma.curso.update({
      where: { id_curso: id },
      data: data as any,
      select: CURSO_SELECT,
    });
  }

  async stats() {
    const total = await this.prisma.curso.count();
    const activos = await this.prisma.curso.count({
      where: { activo: true } as any,
    });
    const capacidadTotal = await this.prisma.curso.aggregate({
      _sum: { cupo: true },
    });
    const avgAlumnos = await this.prisma.curso.aggregate({
      _avg: { cupo: true },
    });

    return {
      totalCursos: total,
      cursosActivos: activos,
      capacidadTotal: capacidadTotal._sum.cupo ?? 0,
      promedioAlumnosPorCurso: Number((avgAlumnos._avg.cupo ?? 0).toFixed(2)),
    };
  }

  /**
   * Obtiene información de cupos para un curso específico
   * @param id ID del curso
   * @returns Información detallada sobre cupos totales, ocupados y disponibles
   */
  async findCursoCupos(id: number): Promise<CursoCuposDto> {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      select: {
        id_curso: true,
        nombre: true,
        seccion: true,
        cupo: true,
      },
    });

    if (!curso) throw new NotFoundException('Curso no encontrado');

    // Obtener el conteo de alumnos en este curso
    const alumnosCount = await this.prisma.alumno.count({
      where: {
        cursos: {
          some: {
            id_curso: id,
          },
        },
      },
    });

    const cupoTotal = curso.cupo || 0;
    const cuposOcupados = alumnosCount;
    const cuposDisponibles = Math.max(0, cupoTotal - cuposOcupados);
    const porcentajeOcupacion =
      cupoTotal > 0
        ? parseFloat(((cuposOcupados * 100) / cupoTotal).toFixed(2))
        : 0;

    // Obtener la descripción del curso por separado para evitar errores de tipo
    const cursoDetalle = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      select: { descripcion: true } as any,
    });

    return {
      id_curso: curso.id_curso,
      nombre: curso.nombre,
      seccion: curso.seccion || undefined,
      descripcion: (cursoDetalle as any)?.descripcion,
      cupoTotal,
      cuposOcupados,
      cuposDisponibles,
      porcentajeOcupacion,
    };
  }

  /**
   * Obtiene información de cupos para todos los cursos
   * @param params Parámetros de filtrado y paginación
   * @returns Lista paginada de cursos con información de cupos
   */
  async findAllCursosCupos(params: any): Promise<ListaCursosCuposDto> {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const skip = (page - 1) * limit;

    const whereAny: any = {};
    if (params.activo === true || params.activo === false)
      whereAny.activo = params.activo;
    if (params.id_grado_academico)
      whereAny.id_grado_academico = Number(params.id_grado_academico);
    if (params.modalidad)
      whereAny.gradoAcademico = {
        opcion: { contains: params.modalidad, mode: 'insensitive' },
      };

    if (params.q) {
      const terms = params.q.split(' ').filter((t) => t.trim() !== '');
      whereAny.AND = terms.map((term) => ({
        OR: [
          { nombre: { contains: term, mode: 'insensitive' } },
          { seccion: { contains: term, mode: 'insensitive' } },
          { aula: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    // Obtener los cursos con la información básica
    const [cursos, total] = await this.prisma.$transaction([
      this.prisma.curso.findMany({
        where: whereAny,
        select: {
          id_curso: true,
          nombre: true,
          seccion: true,
          cupo: true,
        },
        skip,
        take: limit,
        orderBy: { id_curso: 'desc' },
      }),
      this.prisma.curso.count({ where: whereAny }),
    ]);

    // Procesar cada curso para obtener el conteo de alumnos y la descripción
    const cursosPromises = cursos.map(async (curso) => {
      // Obtener el conteo de alumnos
      const alumnosCount = await this.prisma.alumno.count({
        where: {
          cursos: {
            some: {
              id_curso: curso.id_curso,
            },
          },
        },
      });

      // Obtener la descripción del curso
      const cursoDetalle = await this.prisma.curso.findUnique({
        where: { id_curso: curso.id_curso },
        select: { descripcion: true } as any, // Usamos any para evitar errores de tipo
      });

      const cupoTotal = curso.cupo || 0;
      const cuposOcupados = alumnosCount;
      const cuposDisponibles = Math.max(0, cupoTotal - cuposOcupados);
      const porcentajeOcupacion =
        cupoTotal > 0
          ? parseFloat(((cuposOcupados * 100) / cupoTotal).toFixed(2))
          : 0;

      return {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        seccion: curso.seccion || undefined,
        descripcion: (cursoDetalle as any)?.descripcion,
        cupoTotal,
        cuposOcupados,
        cuposDisponibles,
        porcentajeOcupacion,
      };
    });

    const items = await Promise.all(cursosPromises);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

const CURSO_SELECT = {
  id_curso: true,
  nombre: true,
  seccion: true,
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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGradoAcademicoDto } from './dto/create-grado-academico.dto';
import { UpdateGradoAcademicoDto } from './dto/update-grado-academico.dto';

const SELECT = {
  id_grado_academico: true,
  nombre: true,
  opcion: true,
  n_anios: true,
  nota_minima: true,
  id_jornada: true,
};

@Injectable()
export class GradoAcademicoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGradoAcademicoDto) {
    const data: any = { ...dto };
    return this.prisma.grado_Academico.create({ data, select: SELECT });
  }

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.q) {
      where.OR = [
        { nombre: { contains: params.q, mode: 'insensitive' } },
        { opcion: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.grado_Academico.findMany({
        where,
        select: SELECT,
        skip,
        take: limit,
        orderBy: { id_grado_academico: 'desc' },
      }),
      this.prisma.grado_Academico.count({ where }),
    ]);

    return { page, limit, total, pages: Math.ceil(total / limit), items };
  }

  async findOne(id: number) {
    const g = await this.prisma.grado_Academico.findUnique({
      where: { id_grado_academico: id },
      select: SELECT,
    });
    if (!g) throw new NotFoundException('Grado académico no encontrado');
    return g;
  }

  async update(id: number, dto: UpdateGradoAcademicoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    return this.prisma.grado_Academico.update({
      where: { id_grado_academico: id },
      data,
      select: SELECT,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.grado_Academico.delete({
      where: { id_grado_academico: id },
    });
  }
}

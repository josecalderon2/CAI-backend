import { Injectable } from '@nestjs/common';
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
}

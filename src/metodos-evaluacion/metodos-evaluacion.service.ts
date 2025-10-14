import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MetodosEvaluacionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.metodo_evaluacion.findMany();
  }
}
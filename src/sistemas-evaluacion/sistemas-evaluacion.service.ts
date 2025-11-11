import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SistemasEvaluacionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.sistema_Evaluacion.findMany();
  }
}
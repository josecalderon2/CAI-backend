import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TiposAsignaturaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.tipo_Asignatura.findMany(); // 👈 Nombre real según schema
  }
}
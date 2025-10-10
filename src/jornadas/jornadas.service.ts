import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JornadaDto } from './dto/jornada.dto';

@Injectable()
export class JornadasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las jornadas
   * @returns Lista de jornadas
   */
  async findAll(): Promise<JornadaDto[]> {
    return this.prisma.jornada.findMany({
      select: {
        id_jornada: true,
        nombre: true,
      },
    });
  }

  /**
   * Obtiene una jornada por su ID
   * @param id ID de la jornada
   * @returns Jornada encontrada o null si no existe
   */
  async findOne(id: number): Promise<JornadaDto | null> {
    return this.prisma.jornada.findUnique({
      where: { id_jornada: id },
      select: {
        id_jornada: true,
        nombre: true,
      },
    });
  }
}

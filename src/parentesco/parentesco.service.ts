import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParentescoDto } from './dto/create-parentesco.dto';

@Injectable()
export class ParentescoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los parentescos
   */
  async findAll() {
    return this.prisma.parentesco.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Crea un nuevo parentesco
   */
  async create(createParentescoDto: CreateParentescoDto) {
    return this.prisma.parentesco.create({
      data: createParentescoDto,
    });
  }

  /**
   * Busca un parentesco por su ID
   */
  async findOne(id: number) {
    return this.prisma.parentesco.findUnique({
      where: { id_parentesco: id },
    });
  }

  /**
   * Elimina un parentesco por su ID
   */
  async remove(id: number) {
    return this.prisma.parentesco.delete({
      where: { id_parentesco: id },
    });
  }
}

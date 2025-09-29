import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResponsableDto, UpdateResponsableDto } from './dto';

@Injectable()
export class ResponsablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResponsableDto: CreateResponsableDto) {
    return this.prisma.responsable.create({
      data: createResponsableDto,
    });
  }

  async findAll() {
    return this.prisma.responsable.findMany();
  }

  async findOne(id: number) {
    const responsable = await this.prisma.responsable.findUnique({
      where: { id_responsable: id },
    });

    if (!responsable) {
      throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
    }

    return responsable;
  }

  async update(id: number, updateResponsableDto: UpdateResponsableDto) {
    try {
      return await this.prisma.responsable.update({
        where: { id_responsable: id },
        data: updateResponsableDto,
      });
    } catch (error) {
      throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.responsable.delete({
        where: { id_responsable: id },
      });
    } catch (error) {
      throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
    }
  }
}

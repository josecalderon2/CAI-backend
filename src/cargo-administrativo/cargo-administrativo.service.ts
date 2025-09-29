import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoAdministrativoDto } from './dto/create-cargo-administrativo.dto';
import { UpdateCargoAdministrativoDto } from './dto/update-cargo-administrativo.dto';

@Injectable()
export class CargoAdministrativoService {
  constructor(private prisma: PrismaService) {}

  async create(createCargoAdministrativoDto: CreateCargoAdministrativoDto) {
    return this.prisma.cargo_administrativo.create({
      data: createCargoAdministrativoDto,
    });
  }

  async findAll() {
    return this.prisma.cargo_administrativo.findMany({
      select: {
        id_cargo_administrativo: true,
        nombre: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.cargo_administrativo.findUnique({
      where: { id_cargo_administrativo: id },
      select: {
        id_cargo_administrativo: true,
        nombre: true,
      },
    });
  }

  async update(id: number, updateCargoAdministrativoDto: UpdateCargoAdministrativoDto) {
    return this.prisma.cargo_administrativo.update({
      where: { id_cargo_administrativo: id },
      data: updateCargoAdministrativoDto,
    });
  }

  async remove(id: number) {
    return this.prisma.cargo_administrativo.delete({
      where: { id_cargo_administrativo: id },
    });
  }
}
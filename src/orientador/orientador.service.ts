import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrientadorDto } from './dto/create-orientador.dto';
import { UpdateOrientadorDto } from './dto/update-orientador.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

const ORIENTADOR_SELECT = {
  id_orientador: true,
  nombre: true,
  apellido: true,
  dui: true,
  telefono: true,
  email: true,
  activo: true,
  id_cargo_administrativo: true,
  cargoAdministrativo: {
    select: { id_cargo_administrativo: true, nombre: true },
  },
};

@Injectable()
export class OrientadorService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  async create(dto: CreateOrientadorDto) {
    try {
      const data: any = { ...dto };
      data.email = data.email.trim().toLowerCase();
      data.password = await this.hashPassword(dto.password);

      const exists = await this.prisma.orientador.findUnique({
        where: { email: data.email },
      });
      if (exists) throw new ConflictException('El email ya está en uso');

      return await this.prisma.orientador.create({
        data,
        select: ORIENTADOR_SELECT,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está en uso');
      }
      throw new InternalServerErrorException('Error al crear orientador');
    }
  }

  async findAll(params: { activo?: boolean; q?: string }) {
    const where: any = {};
    if (typeof params.activo === 'boolean') where.activo = params.activo;
    if (params.q) {
      where.OR = [
        { nombre: { contains: params.q, mode: 'insensitive' } },
        { apellido: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
        { telefono: { contains: params.q, mode: 'insensitive' } },
        { dui: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.orientador.findMany({
      where,
      select: ORIENTADOR_SELECT,
      orderBy: { id_orientador: 'desc' },
    });
  }

  async findOne(id: number) {
    const ori = await this.prisma.orientador.findUnique({
      where: { id_orientador: id },
      select: ORIENTADOR_SELECT,
    });
    if (!ori) throw new NotFoundException('Orientador no encontrado');
    return ori;
  }

  async update(id: number, dto: UpdateOrientadorDto) {
    try {
      const data: any = { ...dto };
      if (data.email) data.email = data.email.trim().toLowerCase();
      if (dto.password) data.password = await this.hashPassword(dto.password);

      return await this.prisma.orientador.update({
        where: { id_orientador: id },
        data,
        select: ORIENTADOR_SELECT,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está en uso');
      }
      throw new InternalServerErrorException('Error al actualizar orientador');
    }
  }

  async softDelete(id: number) {
    return this.prisma.orientador.update({
      where: { id_orientador: id },
      data: { activo: false },
      select: ORIENTADOR_SELECT,
    });
  }

  async restore(id: number) {
    return this.prisma.orientador.update({
      where: { id_orientador: id },
      data: { activo: true },
      select: ORIENTADOR_SELECT,
    });
  }
}

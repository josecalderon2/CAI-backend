import { Injectable, NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { UpdateAdministrativoDto } from './dto/update-administrativo.dto';
import * as bcrypt from 'bcrypt';

const ADMIN_SELECT = {
  id_administrativo: true,
  id_cargo_administrativo: true,
  nombre: true,
  apellido: true,
  direccion: true,
  dui: true,
  telefono: true,
  email: true,
  activo: true,
  modalidad: true,
  createdAt: true,
  updatedAt: true,
  cargoAdministrativo: {
    select: { id_cargo_administrativo: true, nombre: true },
  },
};

@Injectable()
export class AdministrativoService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  async create(dto: CreateAdministrativoDto) {
    try {
      const data: any = { ...dto };
      if (data.email) data.email = data.email.trim().toLowerCase();
      data.password = await this.hashPassword(dto.password);

      // Pre-chequeo de unicidad de email
      if (data.email) {
        const exists = await this.prisma.administrativo.findUnique({
          where: { email: data.email },
        });
        if (exists) throw new ConflictException('El email ya está en uso');
      }

      return await this.prisma.administrativo.create({
        data,
        select: ADMIN_SELECT,
      });
    } catch (e) {
      // Manejo fino de P2002
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        if (
          Array.isArray((e.meta as any)?.target) &&
          (e.meta as any).target.includes('email')
        ) {
          throw new ConflictException('El email ya está en uso');
        }
      }
      throw e;
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    activo?: boolean;
    q?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 10)));
    const skip = (page - 1) * limit;

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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.administrativo.findMany({
        where,
        select: ADMIN_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.administrativo.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.administrativo.findUnique({
      where: { id_administrativo: id },
      select: ADMIN_SELECT,
    });
    if (!item) throw new NotFoundException('Administrativo no encontrado');
    return item;
  }

  async update(id: number, dto: UpdateAdministrativoDto) {
    try {
      const data: any = { ...dto };

      if (data.email) data.email = data.email.trim().toLowerCase();
      if (dto.password) data.password = await this.hashPassword(dto.password);

      // Si quieren cambiar el email, validar que no exista en otro registro
      if (data.email) {
        const other = await this.prisma.administrativo.findUnique({
          where: { email: data.email },
        });
        if (other && other.id_administrativo !== id) {
          throw new ConflictException(
            'El email ya está en uso por otro usuario',
          );
        }
      }

      return await this.prisma.administrativo.update({
        where: { id_administrativo: id },
        data,
        select: ADMIN_SELECT,
      });
    } catch (e) {
      // Por si se escapa el P2002 en condiciones de carrera
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        if (
          Array.isArray((e.meta as any)?.target) &&
          (e.meta as any).target.includes('email')
        ) {
          throw new ConflictException('El email ya está en uso');
        }
      }
      throw e;
    }
  }
  async softDelete(id: number) {
    return this.prisma.administrativo.update({
      where: { id_administrativo: id },
      data: { activo: false },
      select: ADMIN_SELECT,
    });
  }

  async restore(id: number) {
    return this.prisma.administrativo.update({
      where: { id_administrativo: id },
      data: { activo: true },
      select: ADMIN_SELECT,
    });
  }
}

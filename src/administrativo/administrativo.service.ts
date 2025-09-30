import { Injectable, NotFoundException } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { UpdateAdministrativoDto } from './dto/update-administrativo.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

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
  createdAt: true,
  updatedAt: true,
  cargoAdministrativo: {
    select: { id_cargo_administrativo: true, nombre: true },
  },
};

@Injectable()
export class AdministrativoService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  private async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  private generate4DigitPassword(): string {
    // 1000 - 9999 (4 dígitos)
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async create(dto: CreateAdministrativoDto, creatorEmail: string) {
    try {
      const data: any = { ...dto };
      if (data.email) data.email = data.email.trim().toLowerCase();

      // Siempre ignoramos dto.password y generamos una de 4 dígitos
      const generatedPassword = this.generate4DigitPassword();
      data.password = await this.hashPassword(generatedPassword);

      // Pre-chequeo de unicidad de email
      if (data.email) {
        const exists = await this.prisma.administrativo.findUnique({
          where: { email: data.email },
        });
        if (exists) throw new ConflictException('El email ya está en uso');
      }

      const created = await this.prisma.administrativo.create({
        data,
        select: ADMIN_SELECT,
      });

      // Enviar correo al usuario
      await this.mail.sendPasswordToUser({
        to: created.email,
        newUserName: `${created.nombre} ${created.apellido}`.trim(),
        generatedPassword,
      });

      return created;
    } catch (e) {
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

  // Actualizar PERFIL (solo nombre, apellido, password)
  async updatePerfil(selfId: number, dto: UpdatePerfilDto) {
    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.apellido !== undefined) data.apellido = dto.apellido;
    if (dto.password) data.password = await this.hashPassword(dto.password);

    if (Object.keys(data).length === 0) {
      // No-op, podrías tirar BadRequestException si prefieres
      return this.findOne(selfId);
    }

    return this.prisma.administrativo.update({
      where: { id_administrativo: selfId },
      data,
      select: ADMIN_SELECT,
    });
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

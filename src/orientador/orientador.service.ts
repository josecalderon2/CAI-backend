import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrientadorDto } from './dto/create-orientador.dto';
import { UpdateOrientadorDto } from './dto/update-orientador.dto';
import { UpdatePerfilOrientadorDto } from './dto/update-perfil.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { MailService } from '../mail/mail.service';

const ORIENTADOR_SELECT = {
  id_orientador: true,
  nombre: true,
  apellido: true,
  dui: true,
  telefono: true,
  direccion: true,
  email: true,
  activo: true,
  id_cargo_administrativo: true,
  cargoAdministrativo: {
    select: { id_cargo_administrativo: true, nombre: true },
  },
};

@Injectable()
export class OrientadorService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  private async hashPassword(plain: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }

  private generate4DigitPassword(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async create(dto: CreateOrientadorDto) {
    try {
      const data: any = { ...dto };
      data.email = data.email.trim().toLowerCase();

      // SIEMPRE ignoramos dto.password -> generamos una de 4 dígitos
      const generatedPassword = this.generate4DigitPassword();
      data.password = await this.hashPassword(generatedPassword);

      const exists = await this.prisma.orientador.findUnique({
        where: { email: data.email },
      });
      if (exists) throw new ConflictException('El email ya está en uso');

      const created = await this.prisma.orientador.create({
        data,
        select: ORIENTADOR_SELECT,
      });

      // Enviar al usuario creado
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
        throw new ConflictException('El email ya está en uso');
      }
      throw new InternalServerErrorException('Error al crear orientador');
    }
  }

  // (Opcional) listado con paginación y búsqueda como en administrativo
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
      this.prisma.orientador.findMany({
        where,
        select: ORIENTADOR_SELECT,
        skip,
        take: limit,
        orderBy: { id_orientador: 'desc' },
      }),
      this.prisma.orientador.count({ where }),
    ]);

    return { page, limit, total, pages: Math.ceil(total / limit), items };
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

      // Verifica que el email no esté en otro registro
      if (data.email) {
        const other = await this.prisma.orientador.findUnique({
          where: { email: data.email },
        });
        if (other && other.id_orientador !== id) {
          throw new ConflictException(
            'El email ya está en uso por otro usuario',
          );
        }
      }

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

  // Perfil (self-service)
  async updatePerfil(selfId: number, dto: UpdatePerfilOrientadorDto) {
    const data: any = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.apellido !== undefined) data.apellido = dto.apellido;
    if (dto.password) data.password = await this.hashPassword(dto.password);

    if (Object.keys(data).length === 0) return this.findOne(selfId);

    return this.prisma.orientador.update({
      where: { id_orientador: selfId },
      data,
      select: ORIENTADOR_SELECT,
    });
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

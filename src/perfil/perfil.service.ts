import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PerfilService {
  constructor(private prisma: PrismaService) {}

  async updatePerfil(user: any, data: { nombre?: string; apellido?: string }) {
    const tipo = user.tipo;
    const id = user.id;

    if (!data.nombre && !data.apellido)
      throw new BadRequestException('Debe enviar al menos un campo a actualizar.');

    const payload: any = {};
    if (data.nombre) payload.nombre = data.nombre;
    if (data.apellido) payload.apellido = data.apellido;

    if (tipo === 'ADMINISTRATIVO') {
      return this.prisma.administrativo.update({
        where: { id_administrativo: Number(id) },
        data: payload,
        select: { id_administrativo: true, nombre: true, apellido: true, email: true },
      });
    } else if (tipo === 'ORIENTADOR') {
      return this.prisma.orientador.update({
        where: { id_orientador: Number(id) },
        data: payload,
        select: { id_orientador: true, nombre: true, apellido: true, email: true },
      });
    }

    throw new NotFoundException('Tipo de usuario no válido.');
  }
  
  async updatePassword(user: any, currentPass: string, newPass: string) {
    const tipo = user.tipo;
    const id = user.id;
    const userId = Number(id);

    let record: any = null;

    if (tipo === 'ADMINISTRATIVO') {
      record = await this.prisma.administrativo.findUnique({
        where: { id_administrativo: userId },
      });
    } else if (tipo === 'ORIENTADOR') {
      record = await this.prisma.orientador.findUnique({
        where: { id_orientador: userId },
      });
    } else {
      throw new NotFoundException('Tipo de usuario no válido.');
    }

    if (!record) throw new NotFoundException('Usuario no encontrado.');

    const valid = await bcrypt.compare(currentPass, record.password);
    if (!valid) throw new BadRequestException('Contraseña actual incorrecta.');

    if (newPass.length < 6)
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres.');

    const hashed = await bcrypt.hash(newPass, 10);

    if (tipo === 'ADMINISTRATIVO') {
      return this.prisma.administrativo.update({
        where: { id_administrativo: userId },
        data: { password: hashed },
        select: { email: true, nombre: true },
      });
    }

    return this.prisma.orientador.update({
      where: { id_orientador: userId },
      data: { password: hashed },
      select: { email: true, nombre: true },
    });
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser, Role } from './types/auth-user';
import { ActividadRegistroService } from '../actividades-recientes/actividad-registro.service';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

const ALLOWED_ROLES: Role[] = ['Admin', 'P.A', 'Orientador'];

function mapCargoToRole(nombre?: string | null): Role {
  const n = (nombre ?? '').trim();
  // Normalizamos nombres comunes a nuestros roles
  if (n.toLowerCase() === 'admin') return 'Admin';
  if (n.toLowerCase() === 'p.a' || n.toLowerCase() === 'pa') return 'P.A';
  if (n.toLowerCase() === 'orientador') return 'Orientador';
  throw new UnauthorizedException('Cargo no válido para login');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private actividadRegistroService: ActividadRegistroService,
    // 👇 NUEVO
    private mail: MailService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // genera el link correcto (front si hay FRONTEND_URL; si no, API con o sin prefijo)
  private buildResetUrl(plainToken: string) {
    // Usa siempre la URL del frontend
    const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    return `${base}/reset-password?token=${plainToken}`;
  }

  private async findUserByEmail(
    email: string,
  ): Promise<
    | { origen: 'ADMINISTRATIVO'; record: any; role: Role }
    | { origen: 'ORIENTADOR'; record: any; role: Role }
    | null
  > {
    const admin = await this.prisma.administrativo.findUnique({
      where: { email },
      include: { cargoAdministrativo: true },
    });

    if (admin) {
      const role = mapCargoToRole(admin.cargoAdministrativo?.nombre);
      if (!ALLOWED_ROLES.includes(role)) {
        throw new UnauthorizedException('Rol no autorizado');
      }
      return { origen: 'ADMINISTRATIVO', record: admin, role };
    }

    const ori = await this.prisma.orientador.findUnique({
      where: { email },
      include: { cargoAdministrativo: true }, // <- IMPORTANTE
    });

    if (ori) {
      const role = mapCargoToRole(ori.cargoAdministrativo?.nombre);
      if (!ALLOWED_ROLES.includes(role)) {
        throw new UnauthorizedException('Rol no autorizado');
      }
      return { origen: 'ORIENTADOR', record: ori, role };
    }

    return null;
  }

  async validateLogin(dto: LoginDto): Promise<AuthUser> {
    const hit = await this.findUserByEmail(dto.email);
    if (!hit) throw new UnauthorizedException('Credenciales inválidas');

    const { origen, record, role } = hit;
    const ok = await bcrypt.compare(dto.password, record.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    // debe estar activo
    if (record.activo === false) {
      // Mensaje específico por tipo de cuenta
      const mensaje =
        origen === 'ADMINISTRATIVO'
          ? 'Cuenta administrativa desactivada. Contacte al administrador.'
          : 'Cuenta de orientador desactivada. Contacte al administrador.';
      throw new UnauthorizedException(mensaje);
    }

    const nombre =
      (record.nombre ?? '').toString().trim() ||
      (record.apellido ?? '').toString().trim() ||
      record.email;

    return {
      tipo: origen,
      id:
        origen === 'ADMINISTRATIVO'
          ? record.id_administrativo
          : record.id_orientador,
      email: record.email,
      nombre,
      role,
    };
  }

  async signToken(user: AuthUser) {
    const payload = {
      sub: `${user.tipo}:${user.id}`,
      ...user,
    };

    // Registrar actividad de inicio de sesión
    await this.actividadRegistroService.registrarInicioSesion(
      user.email,
      user.role,
    );

    return {
      access_token: await this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '8h',
      }),
      user,
    };
  }

  // ==========================
  //  RECUPERACIÓN DE CONTRASEÑA
  // ==========================

  /**
   * Genera un token de un solo uso, lo guarda hasheado en BD y envía
   * un correo con el link de recuperación. No revela si el email existe.
   */
  // Mantiene solo el ÚLTIMO token por usuario. Limpia expirados del owner.

async forgotPassword(email: string, meta?: { ip?: string; userAgent?: string }) {
  const hit = await this.findUserByEmail(email);
  if (!hit) return; // mensaje genérico: no revelar existencia

  const { origen, record, role } = hit;

  const plainToken = crypto.randomBytes(32).toString('hex');
  const tokenHash  = this.hashToken(plainToken);
  const expiresAt  = new Date(Date.now() + 15 * 60 * 1000);

  // Filtro por dueño (admin u orientador) para limpiar y crear
  const ownerWhere =
    origen === 'ADMINISTRATIVO'
      ? { adminId: record.id_administrativo }
      : { orientadorId: record.id_orientador };

  // Transacción para evitar carreras: creamos el nuevo y borramos los otros
  const created = await this.prisma.$transaction(async (tx) => {
    // 1) elimina tokens expirados de este owner (por higiene)
    await tx.passwordResetToken.deleteMany({
      where: { ...ownerWhere, expiresAt: { lt: new Date() } },
    });

    // 2) crea el NUEVO token
    const row = await tx.passwordResetToken.create({
      data: {
        ...(origen === 'ADMINISTRATIVO'
          ? { adminId: record.id_administrativo }
          : { orientadorId: record.id_orientador }),
        tokenHash,
        expiresAt,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      },
    });

    // 3) elimina cualquier otro token activo (no usado) del mismo owner
    await tx.passwordResetToken.deleteMany({
      where: { ...ownerWhere, usedAt: null, id: { not: row.id } },
    });

    return row;
  });

  const resetUrl = this.buildResetUrl(plainToken);

  const nombre =
    (record.nombre ?? '').toString().trim() ||
    (record.apellido ?? '').toString().trim() ||
    record.email;

  await this.mail.sendPasswordResetEmail({
    to: record.email,
    nombre,
    rol: role, // 'Admin' | 'P.A' | 'Orientador'
    resetUrl,
    minutos: 15,
  });

  return { id: created.id };
}

async verifyResetToken(plainToken: string) {
  const tokenHash = this.hashToken(plainToken);
  const record = await this.prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
  });
  if (!record) throw new BadRequestException('Token inválido o ya usado');
  if (record.expiresAt.getTime() < Date.now()) {
    throw new BadRequestException('Token expirado');
  }
  return true;
}

async resetPassword(plainToken: string, newPassword: string) {
  const tokenHash = this.hashToken(plainToken);

  // recupera el token y dueño
  const record = await this.prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
    include: {
      administrativo: true,
      orientador: true,
    },
  });

  if (!record) throw new BadRequestException('Token inválido o ya usado');
  if (record.expiresAt.getTime() < Date.now()) {
    // token expirado → bórralo y avisa
    await this.prisma.passwordResetToken.delete({ where: { id: record.id } });
    throw new BadRequestException('Token expirado');
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  // Filtro por dueño
  const ownerWhere = record.adminId
    ? { adminId: record.adminId }
    : { orientadorId: record.orientadorId! };

  await this.prisma.$transaction(async (tx) => {
    // 1) actualiza contraseña en la tabla correspondiente
    if (record.adminId) {
      await tx.administrativo.update({
        where: { id_administrativo: record.adminId },
        data: { password: hashed },
      });
    } else {
      await tx.orientador.update({
        where: { id_orientador: record.orientadorId! },
        data: { password: hashed },
      });
    }

    // 2) elimina el token usado
    await tx.passwordResetToken.delete({ where: { id: record.id } });

    // 3) elimina EXPIRADOS del mismo owner (por higiene)
    await tx.passwordResetToken.deleteMany({
      where: { ...ownerWhere, expiresAt: { lt: new Date() } },
    });

    // 4) elimina CUALQUIER OTRO token aún activo del mismo owner
    await tx.passwordResetToken.deleteMany({
      where: { ...ownerWhere, usedAt: null },
    });
  });

  return true;
}
}

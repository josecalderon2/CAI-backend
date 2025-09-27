import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser, Role } from './types/auth-user';

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
  ) {}

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
    return {
      access_token: await this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '8h',
      }),
      user,
    };
  }
}

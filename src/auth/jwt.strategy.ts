import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, Role } from './types/auth-user';

type JwtPayload = {
  sub: string;     // `${tipo}:${id}`
  tipo: 'ADMINISTRATIVO' | 'ORIENTADOR';
  id: number;
  email: string;
  nombre: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    // Lo que se inyecta en req.user
    return {
      tipo: payload.tipo,
      id: payload.id,
      email: payload.email,
      nombre: payload.nombre,
      role: payload.role,
    };
  }
}

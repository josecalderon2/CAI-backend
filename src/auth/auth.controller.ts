import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login correcto' })
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateLogin(dto);
    return this.auth.signToken(user);
  }

  // Perfil del usuario autenticado
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  getMe(@Req() req: any) {
    return req.user;
  }

  @Get('solo-admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth('JWT-auth')
  adminOnly() {
    return { ok: true, area: 'Solo Admin' };
  }

  @Get('solo-pa')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('P.A')
  @ApiBearerAuth('JWT-auth')
  paOnly() {
    return { ok: true, area: 'Solo P.A' };
  }

  @Get('solo-orientador')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Orientador')
  @ApiBearerAuth('JWT-auth')
  orientadorOnly() {
    return { ok: true, area: 'Solo Orientador' };
  }
}

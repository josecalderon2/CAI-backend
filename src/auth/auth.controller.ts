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
import { ApiBearerAuth, ApiResponse, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiQuery} from '@nestjs/swagger';
import { Header, Query } from '@nestjs/common';

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@cai.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Si el correo existe, se envía un enlace de recuperación' })
  async forgotPassword(@Body() dto: any, @Req() req: any) {
    await this.auth.forgotPassword(dto.email, {
      ip: req.ip,
      userAgent: req.headers?.['user-agent'] || '',
    });
    return { message: 'If the email exists, a reset link was sent.' };
  }

    @Get('reset-password')
    @ApiOperation({ summary: 'Validar token de recuperación de contraseña' })
    @ApiQuery({ name: 'token', type: String, required: true })
    @ApiResponse({ status: 200, description: 'Token válido' })
    @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
    async validateResetToken(@Query('token') token: string) {
      try {
        await this.auth.verifyResetToken(token);
        return {
          message: 'Token is valid',
          statusCode: 200,
        };
      } catch (e) {
        return {
          message: e.message || 'Invalid or expired token',
          statusCode: 400,
        };
      }
    }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: { type: 'string', example: '7e0f7b2a1d9f4e0a8c3b9...' },
        newPassword: { type: 'string', minLength: 8, example: 'NuevaClaveSegura123!' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida correctamente' })
  async resetPassword(@Body() dto: any) {
    await this.auth.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password has been reset successfully.' };
  }
}
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

  // Página simple para que el link del correo no dé 404 y permita cambiar la contraseña
@Get('reset-password')
@HttpCode(HttpStatus.OK)
@Header('Content-Type', 'text/html')
@ApiOperation({ summary: 'Página de restablecimiento (HTML mínimo)' })
@ApiQuery({ name: 'token', required: true, type: String })
async resetPasswordPage(@Query('token') token: string) {
  // Valida el token antes de mostrar el formulario
  try {
    await this.auth.verifyResetToken(token);
  } catch {
    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Recuperación de acceso</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7fafc;margin:0;padding:2rem}
      .card{max-width:480px;margin:4rem auto;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.07);padding:1.5rem}
      h1{font-size:1.25rem;margin:0 0 1rem}
      .muted{color:#6b7280}
      .btn{display:inline-block;margin-top:1rem;padding:.75rem 1rem;border-radius:10px;background:#111827;color:#fff;text-decoration:none}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Enlace inválido o expirado</h1>
      <p class="muted">Solicita nuevamente la recuperación de contraseña.</p>
      <a class="btn" href="/">Volver</a>
    </div>
  </body>
</html>`;
  }

  // Si es válido, muestra el formulario que hace POST al MISMO path
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Restablecer contraseña</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7fafc;margin:0;padding:2rem}
      .card{max-width:480px;margin:4rem auto;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.07);padding:1.5rem}
      h1{font-size:1.25rem;margin:0 0 1rem}
      label{display:block;margin:.5rem 0 .25rem}
      input{width:100%;padding:.65rem .75rem;border:1px solid #e5e7eb;border-radius:10px}
      .btn{margin-top:1rem;width:100%;padding:.75rem;border:0;border-radius:10px;background:#111827;color:#fff;font-weight:600}
      .muted{color:#6b7280;font-size:.9rem;margin-top:.5rem}
      .ok{color:#047857}
      .err{color:#b91c1c}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Restablecer contraseña</h1>
      <form id="f" method="POST" action="">
        <input type="hidden" name="token" value="${token}">
        <label>Nueva contraseña</label>
        <input id="p1" name="newPassword" type="password" minlength="8" required />
        <label>Confirmar contraseña</label>
        <input id="p2" type="password" minlength="8" required />
        <button class="btn" type="submit">Cambiar contraseña</button>
        <p id="msg" class="muted"></p>
      </form>
    </div>
    <script>
      const f = document.getElementById('f');
      const p1 = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      const msg = document.getElementById('msg');
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.textContent = '';
        if (p1.value !== p2.value) {
          msg.textContent = 'Las contraseñas no coinciden';
          msg.className = 'muted err';
          return;
        }
        // Enviar como application/x-www-form-urlencoded (Nest lo soporta)
        const body = new URLSearchParams(new FormData(f));
        const res = await fetch('', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        if (res.ok) {
          msg.textContent = 'Contraseña cambiada. Ya puedes iniciar sesión.';
          msg.className = 'muted ok';
          p1.value = ''; p2.value = '';
        } else {
          const j = await res.json().catch(() => ({}));
          msg.textContent = j.message || 'No se pudo cambiar la contraseña';
          msg.className = 'muted err';
        }
      });
    </script>
  </body>
</html>`;
}

}
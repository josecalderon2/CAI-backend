import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Redirect,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Backup')
@Controller('backup')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('ejecutar')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Ejecutar backup manual de la base de datos',
    description:
      'Genera un backup de PostgreSQL y lo sube automáticamente a Google Drive. El archivo llevará la fecha y hora en el nombre.',
  })
  async ejecutarBackup() {
    return await this.backupService.ejecutarBackupCompleto();
  }

  @Get('listar')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Listar backups locales disponibles',
    description:
      'Muestra todos los backups almacenados localmente con su fecha y tamaño.',
  })
  async listarBackups() {
    const backups = await this.backupService.listarBackupsLocales();
    return {
      total: backups.length,
      backups,
    };
  }

  @Get('autorizar-google')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Obtener URL de autorización de Google Drive',
    description:
      'Genera una URL para autorizar el acceso a Google Drive. Debes visitar esta URL en tu navegador y luego usar el código que obtienes.',
  })
  async autorizarGoogle() {
    const authUrl = await this.backupService.generarUrlAutorizacion();
    return {
      message: 'Visita esta URL en tu navegador y autoriza la aplicación',
      url: authUrl,
      instructions:
        'Después de autorizar, copia el código de la URL y llama a /backup/guardar-token?code=TU_CODIGO',
    };
  }

  @Post('guardar-token')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Guardar token de autorización de Google Drive',
    description:
      'Guarda el código de autorización obtenido después de visitar la URL de autorización.',
  })
  @ApiQuery({
    name: 'code',
    description: 'Código de autorización de Google',
    required: true,
  })
  async guardarToken(@Query('code') code: string) {
    await this.backupService.guardarTokenAutorizacion(code);
    return {
      success: true,
      message: 'Token guardado exitosamente. Ahora puedes ejecutar backups.',
    };
  }
}

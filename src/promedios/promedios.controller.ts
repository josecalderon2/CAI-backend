import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PromediosService } from './promedios.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Promedios')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('promedios')
export class PromediosController {
  constructor(private readonly promediosService: PromediosService) {}

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('alumno/:alumnoId')
  @ApiOperation({ summary: 'Obtener todos los promedios de un alumno' })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  async obtenerPromediosAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promediosService.obtenerPromediosAlumno(
      alumnoId,
      anioAcademico,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('verificar-aprobacion/:alumnoId')
  @ApiOperation({ summary: 'Verificar si un alumno puede ser promovido' })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  async verificarAprobacion(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promediosService.verificarAprobacionParaPromocion(
      alumnoId,
      anioAcademico,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Post('recalcular/:alumnoId')
  @ApiOperation({ summary: 'Recalcular todos los promedios de un alumno' })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  async recalcularPromedios(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promediosService.recalcularTodosLosPromedios(
      alumnoId,
      anioAcademico,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Post('cerrar/:alumnoId')
  @ApiOperation({
    summary: 'Cerrar calificaciones de un alumno (marcar como finalizado)',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiQuery({
    name: 'cursoId',
    description: 'ID del curso',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  async cerrarCalificaciones(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promediosService.cerrarCalificaciones(
      alumnoId,
      cursoId,
      anioAcademico,
    );
  }
}

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
  @Get('mensual/:alumnoId/:asignaturaId')
  @ApiOperation({
    summary:
      'Obtener promedios mensuales de una asignatura con desglose completo',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiParam({
    name: 'asignaturaId',
    description: 'ID de la asignatura',
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre (1, 2 o 3)',
    required: false,
    type: 'number',
  })
  async obtenerPromediosMensuales(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('asignaturaId', ParseIntPipe) asignaturaId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('trimestre') trimestre?: number,
  ) {
    return this.promediosService.obtenerPromediosMensualesConDesglose(
      alumnoId,
      asignaturaId,
      anioAcademico,
      trimestre,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('trimestral/:alumnoId/:asignaturaId')
  @ApiOperation({
    summary:
      'Obtener promedios trimestrales de una asignatura con desglose completo',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiParam({
    name: 'asignaturaId',
    description: 'ID de la asignatura',
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre específico (1, 2 o 3)',
    required: false,
    type: 'number',
  })
  async obtenerPromediosTrimestrales(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('asignaturaId', ParseIntPipe) asignaturaId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('trimestre') trimestre?: number,
  ) {
    return this.promediosService.obtenerPromediosTrimestralesConDesglose(
      alumnoId,
      asignaturaId,
      anioAcademico,
      trimestre,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('periodo/:alumnoId/:asignaturaId')
  @ApiOperation({
    summary: 'Obtener promedios por periodo (BACHILLERATO) con desglose',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiParam({
    name: 'asignaturaId',
    description: 'ID de la asignatura',
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  @ApiQuery({
    name: 'periodo',
    description: 'Periodo específico (1, 2, 3 o 4)',
    required: false,
    type: 'number',
  })
  async obtenerPromediosPeriodo(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Param('asignaturaId', ParseIntPipe) asignaturaId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('periodo') periodo?: number,
  ) {
    return this.promediosService.obtenerPromediosPeriodoConDesglose(
      alumnoId,
      asignaturaId,
      anioAcademico,
      periodo,
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('desglose-completo/:alumnoId')
  @ApiOperation({
    summary: 'Obtener desglose completo de todas las asignaturas de un alumno',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  async obtenerDesgloseCompleto(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promediosService.obtenerDesgloseCompletoAlumno(
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

import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PromediosService } from './promedios.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerificacionCierreResponseDto } from './dto/verificacion-cierre.dto';

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
  @Get('verificar-cierre')
  @ApiOperation({
    summary:
      'Verificar el estado de las calificaciones antes de cerrar (advertencias y estadísticas)',
  })
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
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre (1, 2 o 3) - Solo para básica',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'periodo',
    description: 'Periodo (1, 2, 3 o 4) - Solo para bachillerato',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de verificación obtenido exitosamente',
    type: VerificacionCierreResponseDto,
  })
  async verificarEstadoParaCierre(
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('trimestre') trimestre?: number,
    @Query('periodo') periodo?: number,
  ) {
    return this.promediosService.verificarEstadoParaCierre(
      cursoId,
      anioAcademico,
      trimestre ? Number(trimestre) : undefined,
      periodo ? Number(periodo) : undefined,
    );
  }

  @Roles('Orientador')
  @Get('verificar-cierre-asignatura')
  @ApiOperation({
    summary:
      'Verificar el estado de las calificaciones de UNA ASIGNATURA antes de cerrar',
  })
  @ApiQuery({
    name: 'asignaturaId',
    description: 'ID de la asignatura',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre (1, 2 o 3) - Solo para básica',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'periodo',
    description: 'Periodo (1, 2, 3 o 4) - Solo para bachillerato',
    required: false,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description:
      'Estado de verificación de la asignatura obtenido exitosamente',
    type: VerificacionCierreResponseDto,
  })
  async verificarEstadoParaCierreAsignatura(
    @Query('asignaturaId', ParseIntPipe) asignaturaId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Req() req: any,
    @Query('trimestre') trimestre?: number,
    @Query('periodo') periodo?: number,
  ) {
    const orientadorId = req.user.id_orientador;
    return this.promediosService.verificarEstadoParaCierreAsignatura(
      asignaturaId,
      anioAcademico,
      orientadorId,
      trimestre ? Number(trimestre) : undefined,
      periodo ? Number(periodo) : undefined,
    );
  }

  @Roles('Orientador')
  @Post('cerrar-asignatura')
  @ApiOperation({
    summary:
      'Cerrar calificaciones de UNA ASIGNATURA específica (solo las que imparte el orientador)',
  })
  @ApiQuery({
    name: 'asignaturaId',
    description: 'ID de la asignatura',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre (1, 2 o 3) - Solo para básica',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'periodo',
    description: 'Periodo (1, 2, 3 o 4) - Solo para bachillerato',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'forzar',
    description:
      'Forzar cierre aunque haya advertencias (alumnos sin calificar, etc.)',
    required: false,
    type: 'boolean',
  })
  async cerrarCalificacionesAsignatura(
    @Query('asignaturaId', ParseIntPipe) asignaturaId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Req() req: any,
    @Query('trimestre') trimestre?: number,
    @Query('periodo') periodo?: number,
    @Query('forzar') forzar?: string,
  ) {
    const orientadorId = req.user.id_orientador;
    return this.promediosService.cerrarCalificacionesAsignatura(
      asignaturaId,
      anioAcademico,
      orientadorId,
      trimestre ? Number(trimestre) : undefined,
      periodo ? Number(periodo) : undefined,
      forzar === 'true',
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
  @ApiQuery({
    name: 'forzar',
    description: 'Forzar cierre aunque haya advertencias',
    required: false,
    type: 'boolean',
  })
  async cerrarCalificaciones(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('forzar') forzar?: string,
  ) {
    return this.promediosService.cerrarCalificaciones(
      alumnoId,
      cursoId,
      anioAcademico,
      forzar === 'true',
    );
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Post('cerrar-curso')
  @ApiOperation({
    summary:
      'Cerrar calificaciones de TODO un curso (todos los alumnos activos)',
  })
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
  @ApiQuery({
    name: 'trimestre',
    description: 'Trimestre (1, 2 o 3) - Solo para básica',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'periodo',
    description: 'Periodo (1, 2, 3 o 4) - Solo para bachillerato',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'forzar',
    description:
      'Forzar cierre aunque haya advertencias (alumnos sin calificar, etc.)',
    required: false,
    type: 'boolean',
  })
  async cerrarCalificacionesCurso(
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('trimestre') trimestre?: number,
    @Query('periodo') periodo?: number,
    @Query('forzar') forzar?: string,
  ) {
    return this.promediosService.cerrarCalificacionesCurso(
      cursoId,
      anioAcademico,
      trimestre ? Number(trimestre) : undefined,
      periodo ? Number(periodo) : undefined,
      forzar === 'true',
    );
  }
}

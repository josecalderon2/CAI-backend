import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReportesNotasService } from './reportes-notas.service';

@ApiTags('ReportesNotas')
@Controller('reportes-notas')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReportesNotasController {
  constructor(private readonly reportesService: ReportesNotasService) {}

  @Get('evaluaciones')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Lista de evaluaciones con porcentajes reales por asignatura',
    description:
      '🟢 ORIENTADOR: Solo sus asignaturas | 🔴 ADMIN/P.A: Todas las asignaturas. ' +
      'Obtiene todas las evaluaciones de una asignatura con sus porcentajes distribuidos según el sistema de calificación (trimestre para BÁSICA, periodo para BACHILLERATO)',
  })
  @ApiQuery({
    name: 'id_asignatura',
    required: true,
    description: 'ID de la asignatura',
    example: 2,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  @ApiQuery({
    name: 'trimestre',
    required: false,
    description: 'Trimestre (1-3) - Solo para BÁSICA',
    enum: [1, 2, 3],
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'periodo',
    required: false,
    description: 'Periodo (1-4) - Solo para BACHILLERATO',
    enum: [1, 2, 3, 4],
    schema: { type: 'integer' },
  })
  async evaluacionesPorAsignatura(
    @Query('id_asignatura') id_asignatura: string,
    @Query('anio') anio?: string,
    @Query('trimestre') trimestre?: string,
    @Query('periodo') periodo?: string,
  ) {
    const asignatura = id_asignatura ? parseInt(id_asignatura, 10) : undefined;
    return this.reportesService.evaluacionesPorAsignatura(
      asignatura,
      anio,
      trimestre ? parseInt(trimestre, 10) : undefined,
      periodo ? parseInt(periodo, 10) : undefined,
    );
  }

  @Get('evaluacion/:id/alumnos-calificaciones')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Alumnos con sus calificaciones en una evaluación',
    description:
      '🟢 ORIENTADOR: Solo sus evaluaciones | 🔴 ADMIN/P.A: Todas las evaluaciones. ' +
      'Lista todos los alumnos del curso con sus calificaciones (o null si no tienen) para una evaluación específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la evaluación',
    example: 19,
    schema: { type: 'integer' },
  })
  async alumnosConCalificaciones(@Param('id') id: string, @Req() req: any) {
    return this.reportesService.alumnosConCalificaciones(
      parseInt(id, 10),
      req.user.id,
    );
  }

  @Get('alumno/:id/notas')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Historial completo de notas de un alumno',
    description:
      '🟢 ORIENTADOR: Solo notas de sus asignaturas | 🔴 ADMIN/P.A: Todas las notas. ' +
      'Obtiene todas las notas registradas de un alumno con detalles de asignatura y evaluación',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del alumno',
    example: 1,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico para filtrar',
    example: '2025',
  })
  async notasHistoricasPorAlumno(
    @Param('id') id: string,
    @Query('anio') anio?: string,
  ) {
    return this.reportesService.notasHistoricasPorAlumno(
      parseInt(id, 10),
      anio,
    );
  }

  @Get('promedios/alumno/:id')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Todos los promedios de un alumno',
    description:
      '🟢 ORIENTADOR: Promedios de sus asignaturas | 🔴 ADMIN/P.A: Todos los promedios. ' +
      'Obtiene promedios mensuales, trimestrales, de periodo, finales por asignatura y promedio general del alumno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del alumno',
    example: 1,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  async promediosPorAlumno(
    @Param('id') id: string,
    @Query('anio') anio?: string,
  ) {
    return this.reportesService.promediosPorAlumno(parseInt(id, 10), anio);
  }

  @Get('curso/:id/ranking')
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: '🔴 SOLO ADMIN/P.A - Ranking de alumnos por promedio general',
    description:
      'Reporte institucional: Lista los mejores alumnos del curso ordenados por promedio general descendente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del curso',
    example: 1,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  @ApiQuery({
    name: 'top',
    required: false,
    description: 'Cantidad de alumnos a mostrar',
    example: 10,
    schema: { type: 'integer', default: 10 },
  })
  async rankingPorCurso(
    @Param('id') id: string,
    @Query('anio') anio?: string,
    @Query('top') top?: string,
  ) {
    return this.reportesService.rankingPorCurso(
      parseInt(id, 10),
      anio,
      top ? parseInt(top, 10) : 10,
    );
  }

  @Get('asignatura/:id/distribucion')
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary:
      '🔴 SOLO ADMIN/P.A - Estadísticas de distribución de calificaciones',
    description:
      'Reporte institucional: Analiza la distribución de notas (aprobados, reprobados, promedio, nota máxima/mínima) de una asignatura',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura',
    example: 4,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  async distribucionPorAsignatura(
    @Param('id') id: string,
    @Query('anio') anio?: string,
  ) {
    return this.reportesService.distribucionPorAsignatura(
      parseInt(id, 10),
      anio,
    );
  }

  @Get('evaluacion/:id/pendientes')
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: '🔴 SOLO ADMIN/P.A - Alumnos sin calificación registrada',
    description:
      'Reporte institucional: Lista los alumnos que aún no tienen nota registrada para una evaluación específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la evaluación',
    example: 19,
    schema: { type: 'integer' },
  })
  async pendientesPorEvaluacion(@Param('id') id: string) {
    return this.reportesService.pendientesPorEvaluacion(parseInt(id, 10));
  }

  // ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de 'boleta/alumno/:id'
  // para evitar conflictos de rutas
  @Get('boleta/alumno/:id/detalle')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: '📄 Boleta detallada por trimestre/periodo para entregar a padres',
    description:
      '🟢 ORIENTADOR: Genera reporte completo para padres de familia. ' +
      'Incluye todas las notas de cada evaluación del trimestre/periodo, promedios, asistencia y conducta. ' +
      'BÁSICA usa "trimestre" (1-3), BACHILLERATO usa "periodo" (1-4)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del alumno',
    example: 1,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  @ApiQuery({
    name: 'trimestre',
    required: false,
    description: 'Trimestre (1-3) - Solo para BÁSICA (Primaria y Secundaria)',
    enum: [1, 2, 3],
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'periodo',
    required: false,
    description: 'Periodo (1-4) - Solo para BACHILLERATO',
    enum: [1, 2, 3, 4],
    schema: { type: 'integer' },
  })
  async boletaDetalladaAlumno(
    @Param('id') id: string,
    @Query('anio') anio?: string,
    @Query('trimestre') trimestre?: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.reportesService.boletaDetalladaAlumno(
      parseInt(id, 10),
      anio,
      trimestre ? parseInt(trimestre, 10) : undefined,
      periodo ? parseInt(periodo, 10) : undefined,
    );
  }

  @Get('boleta/alumno/:id')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Boleta completa del alumno con asistencia y conducta',
    description:
      '🟢 ORIENTADOR: Solo datos de sus asignaturas | 🔴 ADMIN/P.A: Boleta completa. ' +
      'Genera la boleta completa incluyendo todas las asignaturas con notas, promedios, asistencia y conducta',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del alumno',
    example: 1,
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año académico',
    example: '2025',
  })
  async boletaAlumno(@Param('id') id: string, @Query('anio') anio?: string) {
    return this.reportesService.boletaAlumno(parseInt(id, 10), anio);
  }
}

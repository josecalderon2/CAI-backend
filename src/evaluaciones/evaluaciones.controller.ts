import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@ApiTags('Evaluaciones')
@Controller('evaluaciones')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva evaluación' })
  create(@Body() createEvaluacionDto: CreateEvaluacionDto, @Req() req: any) {
    const id_orientador = req.user.id;
    return this.evaluacionesService.create(createEvaluacionDto, id_orientador);
  }

  @Get('anios-disponibles')
  @ApiOperation({
    summary: 'Obtener años académicos con evaluaciones/notas disponibles',
    description:
      'Retorna todos los años académicos que tienen evaluaciones registradas. ' +
      'Útil para llenar filtros dinámicamente en reportes de notas.',
  })
  getAniosDisponibles() {
    return this.evaluacionesService.getAniosDisponibles();
  }

  @Get('mis-asignaturas/evaluaciones')
  @ApiOperation({
    summary: 'Obtener evaluaciones de las asignaturas asignadas al orientador',
  })
  findByMisAsignaturas(@Req() req: any) {
    return this.evaluacionesService.findByOrientadorAsignaturas(req.user.id);
  }

  @Get('tipos-evaluacion/asignatura/:id_asignatura')
  @ApiOperation({
    summary:
      'Obtener tipos de evaluación válidos para una asignatura específica',
  })
  getTiposEvaluacionByAsignatura(
    @Param('id_asignatura', ParseIntPipe) id_asignatura: number,
  ) {
    return this.evaluacionesService.getTiposEvaluacionByAsignatura(
      id_asignatura,
    );
  }

  @Get('asignatura/:id_asignatura')
  @ApiOperation({
    summary: 'Obtener evaluaciones de una asignatura específica',
    description:
      'Retorna todas las evaluaciones de una asignatura filtradas por año académico. ' +
      'Útil para dropdowns de evaluaciones en el frontend.',
  })
  getEvaluacionesPorAsignatura(
    @Param('id_asignatura', ParseIntPipe) id_asignatura: number,
    @Req() req: any,
  ) {
    const anioAcademico = req.query.anio || new Date().getFullYear().toString();
    return this.evaluacionesService.findEvaluacionesPorAsignatura(
      id_asignatura,
      anioAcademico,
    );
  }

  @Get('porcentajes/asignatura/:id_asignatura')
  @ApiOperation({
    summary:
      'Calcular porcentajes reales de evaluaciones considerando divisiones',
  })
  calcularPorcentajes(
    @Param('id_asignatura', ParseIntPipe) id_asignatura: number,
    @Req() req: any,
  ) {
    // Por ahora usa el año actual, pero podrías recibir estos valores como query params
    const anioActual = new Date().getFullYear().toString();
    return this.evaluacionesService.calcularPorcentajesReales(
      id_asignatura,
      anioActual,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las evaluaciones',
  })
  findAll(@Req() req: any) {
    return this.evaluacionesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una evaluación por ID',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluacionesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una evaluación',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
    @Req() req: any,
  ) {
    return this.evaluacionesService.update(
      id,
      updateEvaluacionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una evaluación',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.evaluacionesService.remove(id, req.user.id);
  }

  @Get(':id/alumnos-con-calificaciones')
  @ApiOperation({
    summary: 'Obtener alumnos de una evaluación con sus calificaciones',
    description:
      'Retorna todos los alumnos del curso asociado a la evaluación, ' +
      'incluyendo quiénes ya tienen calificación y quiénes no. ' +
      'Útil para el formulario de ingreso de notas.',
  })
  getAlumnosConCalificaciones(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.evaluacionesService.getAlumnosConCalificaciones(
      id,
      req.user.id,
    );
  }
}

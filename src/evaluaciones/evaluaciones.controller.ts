import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { FiltrosHistorialDto } from './dto/filtros-historial.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Evaluaciones')
@Controller('evaluaciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  @Roles('Orientador')
  @ApiOperation({ 
    summary: 'Crear nueva evaluación',
    description: 'Permite al orientador crear una evaluación para una de sus asignaturas asignadas'
  })
  @ApiResponse({ status: 201, description: 'Evaluación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o asignatura no asignada' })
  @ApiResponse({ status: 404, description: 'Tipo de evaluación no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe una evaluación con ese nombre' })
  create(@Body() createEvaluacionDto: CreateEvaluacionDto, @Request() req) {
    const idOrientador = req.user.id;
    return this.evaluacionesService.create(createEvaluacionDto, idOrientador);
  }

  @Get()
  @Roles('Orientador', 'P.A', 'Admin')
  @ApiOperation({ 
    summary: 'Obtener todas las evaluaciones',
    description: 'Orientador ve solo sus evaluaciones. Admin y P.A ven todas'
  })
  @ApiResponse({ status: 200, description: 'Lista de evaluaciones' })
  findAll(@Request() req) {
    const idOrientador = req.user.role === 'Orientador' ? req.user.id : undefined;
    return this.evaluacionesService.findAll(idOrientador);
  }

  @Get('tipo/:idTipo')
  @Roles('Orientador', 'P.A', 'Admin')
  @ApiOperation({ 
    summary: 'Obtener evaluaciones por tipo',
    description: 'Retorna todas las evaluaciones de un tipo específico'
  })
  @ApiParam({ name: 'idTipo', description: 'ID del tipo de evaluación', type: Number })
  @ApiResponse({ status: 200, description: 'Evaluaciones del tipo especificado' })
  @ApiResponse({ status: 404, description: 'Tipo de evaluación no encontrado' })
  findByTipo(@Param('idTipo', ParseIntPipe) idTipo: number, @Request() req) {
    const idOrientador = req.user.role === 'Orientador' ? req.user.id : undefined;
    return this.evaluacionesService.findByTipo(idTipo, idOrientador);
  }

  @Get('historial')
  @Roles('P.A', 'Admin')
  @ApiOperation({ 
    summary: 'Obtener historial de evaluaciones',
    description: 'Retorna el historial de evaluaciones con filtros y paginación. Solo para personal administrativo y admin'
  })
  @ApiQuery({ name: 'id_tipo_evaluacion', required: false, type: Number })
  @ApiQuery({ name: 'nombre', required: false, type: String })
  @ApiQuery({ name: 'fecha_inicio', required: false, type: String })
  @ApiQuery({ name: 'fecha_fin', required: false, type: String })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historial de evaluaciones con estadísticas' })
  getHistorial(@Query() filtros: FiltrosHistorialDto) {
    return this.evaluacionesService.getHistorial(filtros);
  }

  @Get('estadisticas')
  @Roles('P.A', 'Admin')
  @ApiOperation({ 
    summary: 'Obtener estadísticas generales de evaluaciones',
    description: 'Retorna estadísticas generales del sistema de evaluaciones'
  })
  @ApiResponse({ status: 200, description: 'Estadísticas generales' })
  getEstadisticasGenerales() {
    return this.evaluacionesService.getEstadisticasGenerales();
  }

  @Get(':id')
  @Roles('Orientador', 'P.A', 'Admin')
  @ApiOperation({ 
    summary: 'Obtener una evaluación por ID',
    description: 'Retorna los detalles de una evaluación específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la evaluación', type: Number })
  @ApiResponse({ status: 200, description: 'Detalles de la evaluación' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const idOrientador = req.user.role === 'Orientador' ? req.user.id : undefined;
    return this.evaluacionesService.findOne(id, idOrientador);
  }

  @Patch(':id')
  @Roles('Orientador')
  @ApiOperation({ 
    summary: 'Actualizar una evaluación',
    description: 'Permite al orientador actualizar una de sus evaluaciones'
  })
  @ApiParam({ name: 'id', description: 'ID de la evaluación', type: Number })
  @ApiResponse({ status: 200, description: 'Evaluación actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o sin permiso' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe otra evaluación con ese nombre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
    @Request() req,
  ) {
    const idOrientador = req.user.id;
    return this.evaluacionesService.update(id, updateEvaluacionDto, idOrientador);
  }

  @Delete(':id')
  @Roles('Orientador')
  @ApiOperation({ 
    summary: 'Eliminar una evaluación',
    description: 'Elimina una evaluación del orientador si no tiene notas asociadas'
  })
  @ApiParam({ name: 'id', description: 'ID de la evaluación', type: Number })
  @ApiResponse({ status: 200, description: 'Evaluación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Evaluación no encontrada' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar porque tiene notas asociadas' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const idOrientador = req.user.id;
    return this.evaluacionesService.remove(id, idOrientador);
  }
}

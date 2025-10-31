import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BulkAsistenciaDto } from './dto/bulk-asistencia.dto';

@ApiTags('Asistencia') // Agrupa en Swagger
@Controller('asistencia')
// @UseGuards(TuGuardiaDeAutenticacion) // Descomenta para proteger
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  /**
   * Endpoint principal para la toma de asistencia masiva por parte del docente.
   */
  @Post('bulk')
  @ApiOperation({
    summary: 'Registrar asistencia en lote',
    description:
      'Permite registrar o actualizar la asistencia de múltiples alumnos en una sola transacción. Utiliza upsert para evitar duplicados.',
  })
  @ApiCreatedResponse({
    description: 'Asistencias registradas exitosamente',
  })
  createBulk(@Body() bulkAsistenciaDto: BulkAsistenciaDto) {
    return this.asistenciaService.createBulk(bulkAsistenciaDto);
  }

  /**
   * Crea un único registro de asistencia (corrección).
   */
  @Post()
  @ApiOperation({
    summary: 'Registrar una asistencia individual',
    description:
      'Crea un único registro de asistencia para correcciones o registros individuales.',
  })
  @ApiCreatedResponse({
    description: 'Asistencia registrada exitosamente',
  })
  create(@Body() createAsistenciaDto: CreateAsistenciaDto) {
    return this.asistenciaService.create(createAsistenciaDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las asistencias',
    description:
      'Obtiene todos los registros de asistencia ordenados por fecha descendente.',
  })
  @ApiOkResponse({
    description: 'Lista de asistencias obtenida exitosamente',
  })
  findAll() {
    return this.asistenciaService.findAll();
  }

  /**
   * IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
   * Busca asistencias con filtros para el historial
   */
  @Get('buscar/filtros')
  @ApiOperation({
    summary: 'Buscar asistencias con filtros',
    description:
      'Permite buscar asistencias por curso, alumno, fecha, rango de fechas o estado. Útil para encontrar registros que necesitan modificación.',
  })
  @ApiOkResponse({
    description: 'Asistencias encontradas exitosamente',
  })
  findWithFilters(@Query() filters: any) {
    return this.asistenciaService.findWithFilters({
      cursoId: filters.cursoId ? parseInt(filters.cursoId) : undefined,
      alumnoId: filters.alumnoId ? parseInt(filters.alumnoId) : undefined,
      fecha: filters.fecha,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      estado: filters.estado,
    });
  }

  /**
   * Obtiene el historial de cambios de un registro de asistencia
   */
  @Get('historial/:id')
  @ApiOperation({
    summary: 'Obtener historial de cambios de una asistencia',
    description:
      'Muestra todas las modificaciones realizadas sobre un registro de asistencia específico para auditoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de asistencia',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Historial obtenido exitosamente',
  })
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.getHistorial(id);
  }

  /**
   * Obtiene el historial de cambios de un alumno
   */
  @Get('historial/alumno/:id_alumno')
  @ApiOperation({
    summary: 'Obtener historial de cambios de un alumno',
    description:
      'Muestra todas las modificaciones de asistencia realizadas sobre un alumno específico.',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Historial del alumno obtenido exitosamente',
  })
  getHistorialAlumno(
    @Param('id_alumno', ParseIntPipe) id_alumno: number,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.asistenciaService.getHistorialAlumno(
      id_alumno,
      fechaDesde,
      fechaHasta,
    );
  }

  /**
   * Verifica el estado de asistencia de un alumno en una fecha específica
   */
  @Get('verificar/:id_alumno/:fecha')
  @ApiOperation({
    summary: 'Verificar estado de asistencia de un alumno en una fecha',
    description:
      'Retorna el estado de asistencia de un alumno para una fecha específica si existe.',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: Number,
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha en formato YYYY-MM-DD',
    type: String,
  })
  @ApiOkResponse({
    description: 'Estado de asistencia encontrado o null si no existe',
  })
  verificarEstadoAlumno(
    @Param('id_alumno', ParseIntPipe) id_alumno: number,
    @Param('fecha') fecha: string,
  ) {
    return this.asistenciaService.verificarEstadoAlumno(id_alumno, fecha);
  }

  @Get('alumno/:id_alumno')
  @ApiOperation({
    summary: 'Obtener asistencias de un alumno',
    description:
      'Obtiene todos los registros de asistencia de un alumno específico.',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Asistencias del alumno obtenidas exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Alumno no encontrado',
  })
  findByStudent(@Param('id_alumno', ParseIntPipe) id_alumno: number) {
    return this.asistenciaService.findByStudent(id_alumno);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una asistencia por ID',
    description:
      'Obtiene los detalles completos de un registro de asistencia específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de asistencia',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Asistencia obtenida exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Registro de asistencia no encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.findOne(id);
  }

  /**
   * Modifica un registro de asistencia existente
   * Útil para correcciones posteriores (ej. justificación con constancia médica)
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Modificar una asistencia',
    description:
      'Actualiza un registro de asistencia existente. Útil para correcciones posteriores como cambiar de SP a E (justificado con constancia médica) o modificar el estado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de asistencia a modificar',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Asistencia actualizada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Registro de asistencia no encontrado',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ) {
    return this.asistenciaService.update(id, updateAsistenciaDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una asistencia',
    description: 'Elimina un registro de asistencia. Use con precaución.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de asistencia a eliminar',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Asistencia eliminada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Registro de asistencia no encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.remove(id);
  }
}

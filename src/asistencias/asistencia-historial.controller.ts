// src/asistencias/asistencia-historial.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AsistenciaHistorialService } from './asistencia-historial.service';

@ApiTags('Asistencia - Historial')
@Controller('asistencia/historial')
export class AsistenciaHistorialController {
  constructor(private readonly service: AsistenciaHistorialService) {}

  @Get(':id_asistencia')
  @ApiOperation({ summary: 'Historial de un registro de asistencia por ID' })
  @ApiParam({ name: 'id_asistencia', type: Number })
  findByAsistencia(@Param('id_asistencia') id: string) {
    return this.service.findByAsistencia(+id);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar historial filtrado/paginado' })
  @ApiQuery({ name: 'id_alumno', required: false, type: Number })
  @ApiQuery({ name: 'id_asignatura', required: false, type: Number })
  @ApiQuery({
    name: 'desde',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'hasta',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'accion',
    required: false,
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'BULK_IMPORT', 'RECTIFY', 'ROLLBACK'],
  })
  @ApiQuery({ name: 'correlacion_id', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(
    @Query('id_alumno') id_alumno?: string,
    @Query('id_asignatura') id_asignatura?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('accion') accion?: string,
    @Query('correlacion_id') correlacion_id?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.search({
      id_alumno: id_alumno ? +id_alumno : undefined,
      id_asignatura: id_asignatura ? +id_asignatura : undefined,
      desde,
      hasta,
      accion: accion as any,
      correlacion_id,
      page: +page,
      limit: +limit,
    });
  }
}

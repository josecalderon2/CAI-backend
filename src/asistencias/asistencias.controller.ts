import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AsistenciaService } from './asistencias.service';
import {
  CreateAsistenciaDto,
  UpdateAsistenciaDto,
  AsistenciaResponse,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Asistencias')
@Controller('asistencias')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  // 🟢 Registrar asistencias diarias (individual o bloque)
  @Post()
  @ApiOperation({
    summary: 'Registrar asistencias (individual o bloque)',
    description:
      'Registra o actualiza asistencias diarias para uno o varios alumnos. Requiere: id_alumno, id_asignatura, id_orientador, fecha, estado. Opcionales: observacion, anio_academico, trimestre.',
  })
  @ApiBody({
    type: [CreateAsistenciaDto],
    description:
      'Arreglo de asistencias a registrar/actualizar. "estado" admite P, E, SP, A.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencias procesadas correctamente.',
    type: [AsistenciaResponse],
  })
  async create(
    @Body() createAsistenciaDto: CreateAsistenciaDto[],
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.create(createAsistenciaDto);
  }

  // 🔵 Obtener asistencias por asignatura y fecha específica
  @Get('asignatura/:id_asignatura/fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener asistencias por asignatura y fecha',
    description:
      'Devuelve todas las asistencias de una asignatura en una fecha (YYYY-MM-DD).',
  })
  @ApiParam({
    name: 'id_asignatura',
    type: Number,
    description: 'ID de la asignatura',
  })
  @ApiParam({ name: 'fecha', type: String, description: 'Fecha (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Listado de asistencias.',
    type: [AsistenciaResponse],
  })
  async findByAsignaturaAndFecha(
    @Param('id_asignatura', ParseIntPipe) id_asignatura: number,
    @Param('fecha') fecha: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAsignaturaAndFecha(
      id_asignatura,
      fecha,
    );
  }

  // 🟣 Obtener todas las asistencias registradas por un docente
  @Get('docente/:id_orientador')
  @ApiOperation({
    summary: 'Obtener asistencias registradas por un docente',
    description:
      'Devuelve todas las asistencias registradas por el orientador especificado.',
  })
  @ApiParam({
    name: 'id_orientador',
    type: Number,
    description: 'ID del orientador',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de asistencias del orientador.',
    type: [AsistenciaResponse],
  })
  async findByDocente(
    @Param('id_orientador', ParseIntPipe) id_orientador: number,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByDocente(id_orientador);
  }

  // 🟡 Obtener historial completo de un alumno
  @Get('alumno/:id_alumno')
  @ApiOperation({
    summary: 'Obtener historial de asistencias de un alumno',
    description:
      'Devuelve todas las asistencias registradas del alumno indicado.',
  })
  @ApiParam({ name: 'id_alumno', type: Number, description: 'ID del alumno' })
  @ApiResponse({
    status: 200,
    description: 'Historial de asistencia del alumno.',
    type: [AsistenciaResponse],
  })
  async findByAlumno(
    @Param('id_alumno', ParseIntPipe) id_alumno: number,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAlumno(id_alumno);
  }

  // 🟠 Actualizar una asistencia específica
  @Patch(':id_asistencia')
  @ApiOperation({
    summary: 'Actualizar asistencia',
    description: 'Modifica estado, observación o trimestre de una asistencia.',
  })
  @ApiParam({
    name: 'id_asistencia',
    type: Number,
    description: 'ID de la asistencia',
  })
  @ApiBody({
    type: UpdateAsistenciaDto,
    description:
      'Campos permitidos: estado (P/E/SP/A), observacion, trimestre.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia actualizada.',
    type: AsistenciaResponse,
  })
  async update(
    @Param('id_asistencia', ParseIntPipe) id_asistencia: number,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    return this.asistenciaService.update(id_asistencia, updateAsistenciaDto);
  }

  // 📊 Consolidado mensual por curso
  @Get('mensual/curso/:id_curso/:anio/:mes')
  @ApiOperation({
    summary: 'Consolidado mensual por curso',
    description:
      'Consolida P+E como presentes y SP como sin permiso por alumno y materia del mes indicado.',
  })
  @ApiParam({ name: 'id_curso', description: 'ID del curso', type: Number })
  @ApiParam({ name: 'anio', description: 'Año académico', type: Number })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)', type: Number })
  @ApiResponse({ status: 200, description: 'Consolidado mensual.' })
  @ApiResponse({ status: 404, description: 'No se encontraron datos.' })
  async getConsolidadoMensual(
    @Param('id_curso', ParseIntPipe) id_curso: number,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.asistenciaService.getConsolidadoMensual(id_curso, anio, mes);
  }

  // 📊 Consolidado trimestral por curso
  @Get('trimestral/curso/:id_curso/:anio/:trimestre')
  @ApiOperation({
    summary: 'Consolidado trimestral por curso',
    description:
      'Suma tres meses del trimestre y calcula conducta: 10 - (SP*0.2 + MenosGrave*1 + Grave*2 + MuyGrave*3).',
  })
  @ApiParam({ name: 'id_curso', description: 'ID del curso', type: Number })
  @ApiParam({ name: 'anio', description: 'Año académico', type: Number })
  @ApiParam({ name: 'trimestre', description: 'Trimestre (1-4)', type: Number })
  @ApiResponse({ status: 200, description: 'Consolidado trimestral.' })
  @ApiResponse({ status: 404, description: 'No se encontraron datos.' })
  async getConsolidadoTrimestral(
    @Param('id_curso', ParseIntPipe) id_curso: number,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('trimestre', ParseIntPipe) trimestre: number,
  ) {
    return this.asistenciaService.getConsolidadoTrimestral(
      id_curso,
      anio,
      trimestre,
    );
  }
}

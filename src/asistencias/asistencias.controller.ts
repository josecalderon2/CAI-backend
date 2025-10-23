import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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

  // 🟢 Registrar asistencias diarias (individual o en bloque)
  @Post()
  @ApiOperation({
    summary: 'Registrar asistencias (individual o bloque)',
    description:
      'Permite registrar o actualizar asistencias diarias para uno o varios alumnos. Incluye id_alumno, id_asignatura, id_orientador, fecha, estado, observacion, anio_academico y trimestre.',
  })
  @ApiBody({
    type: [CreateAsistenciaDto],
    description:
      'Lista de asistencias a registrar. Cada objeto incluye id_alumno, id_asignatura, id_orientador, fecha, estado, observacion, anio_academico y trimestre.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada exitosamente.',
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
    description: 'Devuelve todas las asistencias de una asignatura en una fecha específica.',
  })
  @ApiParam({ name: 'id_asignatura', type: 'number', description: 'ID de la asignatura' })
  @ApiParam({ name: 'fecha', type: 'string', description: 'Fecha del registro (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias obtenida con éxito.',
    type: [AsistenciaResponse],
  })
  async findByAsignaturaAndFecha(
    @Param('id_asignatura') id_asignatura: string,
    @Param('fecha') fecha: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAsignaturaAndFecha(+id_asignatura, fecha);
  }

  // 🟣 Obtener todas las asistencias registradas por un docente
  @Get('docente/:id_orientador')
  @ApiOperation({
    summary: 'Obtener asistencias registradas por un docente',
    description:
      'Devuelve todas las asistencias registradas por el orientador especificado.',
  })
  @ApiParam({ name: 'id_orientador', type: 'number', description: 'ID del orientador' })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias del orientador obtenida correctamente.',
    type: [AsistenciaResponse],
  })
  async findByDocente(
    @Param('id_orientador') id_orientador: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByDocente(+id_orientador);
  }

  // 🟡 Obtener historial completo de un alumno
  @Get('alumno/:id_alumno')
  @ApiOperation({
    summary: 'Obtener historial de asistencias de un alumno',
    description: 'Devuelve todas las asistencias registradas del alumno indicado.',
  })
  @ApiParam({ name: 'id_alumno', type: 'number', description: 'ID del alumno' })
  @ApiResponse({
    status: 200,
    description: 'Historial de asistencia del alumno recuperado exitosamente.',
    type: [AsistenciaResponse],
  })
  async findByAlumno(
    @Param('id_alumno') id_alumno: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAlumno(+id_alumno);
  }

  // 🟠 Actualizar una asistencia específica
  @Patch(':id_asistencia')
  @ApiOperation({
    summary: 'Actualizar asistencia',
    description: 'Permite modificar el estado, observación o trimestre de una asistencia existente.',
  })
  @ApiParam({ name: 'id_asistencia', type: 'number', description: 'ID de la asistencia' })
  @ApiBody({
    type: UpdateAsistenciaDto,
    description: 'Datos que pueden actualizarse: estado, observación o trimestre.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia actualizada correctamente.',
    type: AsistenciaResponse,
  })
  async update(
    @Param('id_asistencia') id_asistencia: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    return this.asistenciaService.update(+id_asistencia, updateAsistenciaDto);
  }

  // 📊 Consolidado mensual por curso
  @Get('mensual/curso/:id_curso/:anio/:mes')
  @ApiOperation({
    summary: 'Obtener consolidado mensual por curso',
    description:
      'Devuelve el consolidado mensual de asistencias del curso: lista de alumnos, materias y cantidad de presentes (P) y sin permiso (SP) durante el mes indicado.',
  })
  @ApiParam({ name: 'id_curso', description: 'ID del curso', type: 'number' })
  @ApiParam({ name: 'anio', description: 'Año académico', type: 'number' })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Consolidado mensual obtenido exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'No se encontraron datos.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getConsolidadoMensual(
    @Param('id_curso') id_curso: string,
    @Param('anio') anio: string,
    @Param('mes') mes: string,
  ) {
    return this.asistenciaService.getConsolidadoMensual(+id_curso, +anio, +mes);
  }

  // 📊 Consolidado trimestral por curso
  @Get('trimestral/curso/:id_curso/:anio/:trimestre')
  @ApiOperation({
    summary: 'Obtener consolidado trimestral por curso',
    description:
      'Devuelve el consolidado trimestral de asistencias del curso: lista de alumnos, materias y cantidad de presentes (P) y sin permiso (SP) en los meses del trimestre indicado.',
  })
  @ApiParam({ name: 'id_curso', description: 'ID del curso', type: 'number' })
  @ApiParam({ name: 'anio', description: 'Año académico', type: 'number' })
  @ApiParam({
    name: 'trimestre',
    description: 'Trimestre (1-4)',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Consolidado trimestral obtenido exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'No se encontraron datos.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getConsolidadoTrimestral(
    @Param('id_curso') id_curso: string,
    @Param('anio') anio: string,
    @Param('trimestre') trimestre: string,
  ) {
    return this.asistenciaService.getConsolidadoTrimestral(
      +id_curso,
      +anio,
      +trimestre,
    );
  }
}

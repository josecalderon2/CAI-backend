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

@ApiTags('Asistencia')
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  // 🟢 Crear o actualizar registros de asistencia (individual o en bloque)
  @Post()
  @ApiOperation({
    summary: 'Registrar o actualizar asistencia (individual o en bloque)',
  })
  @ApiBody({
    type: [CreateAsistenciaDto],
    description:
      'Lista de asistencias para registrar. Cada objeto debe incluir id_alumno, id_asignatura, id_orientador, fecha, estado y observacion.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada exitosamente.',
    content: {
      'application/json': {
        example: [
          {
            id_asistencia: 1,
            fecha: '2025-10-22T00:00:00.000Z',
            estado: 'PRESENTE',
            observacion: 'Llegó puntual y con uniforme completo',
            alumno: { id_alumno: 2, nombre: 'Kendel', apellido: 'Arevalo' },
            asignatura: { id_asignatura: 7, nombre: 'Matemáticas' },
            orientador: { id_orientador: 3, nombre: 'Nelson', apellido: 'Medina' },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o asignatura no pertenece al docente.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async create(
    @Body() createAsistenciaDto: CreateAsistenciaDto[],
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.create(createAsistenciaDto);
  }

  // 🔵 Obtener todas las asistencias de una asignatura en una fecha específica
  @Get('asignatura/:id_asignatura/fecha/:fecha')
  @ApiOperation({
    summary: 'Obtener asistencia por asignatura y fecha específica',
  })
  @ApiParam({
    name: 'id_asignatura',
    description: 'ID de la asignatura',
    type: 'number',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha del registro de asistencia (YYYY-MM-DD)',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias obtenida con éxito.',
    content: {
      'application/json': {
        example: [
          {
            id_asistencia: 4,
            fecha: '2025-10-25T00:00:00.000Z',
            estado: 'TARDE',
            observacion: 'Llegó con 20 minutos de retraso',
            alumno: { id_alumno: 2, nombre: 'Kendel', apellido: 'Arevalo' },
            asignatura: { id_asignatura: 7, nombre: 'Matemáticas' },
            orientador: { id_orientador: 3, nombre: 'Nelson', apellido: 'Medina' },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'La asignatura no existe o no tiene asistencias registradas.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message:
            'La asignatura con ID 7 no tiene asistencias registradas.',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async findByAsignaturaAndFecha(
    @Param('id_asignatura') id_asignatura: string,
    @Param('fecha') fecha: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAsignaturaAndFecha(
      +id_asignatura,
      fecha,
    );
  }

  // 🟣 Obtener todas las asistencias registradas por un docente
  @Get('docente/:id_orientador')
  @ApiOperation({
    summary: 'Obtener todas las asistencias registradas por un docente',
  })
  @ApiParam({
    name: 'id_orientador',
    description: 'ID del docente que registró las asistencias',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias recuperada con éxito.',
    content: {
      'application/json': {
        example: [
          {
            id_asistencia: 1,
            fecha: '2025-10-22T00:00:00.000Z',
            estado: 'PRESENTE',
            observacion: 'Llegó puntual',
            alumno: { id_alumno: 2, nombre: 'Kendel', apellido: 'Arevalo' },
            asignatura: { id_asignatura: 7, nombre: 'Matemáticas' },
            orientador: { id_orientador: 3, nombre: 'Nelson', apellido: 'Medina' },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'El docente no tiene asistencias registradas.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message:
            'El docente con ID 2 no tiene asistencias registradas.',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async findByDocente(
    @Param('id_orientador') id_orientador: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByDocente(+id_orientador);
  }

  // 🟡 Obtener historial de asistencias de un alumno
  @Get('alumno/:id_alumno')
  @ApiOperation({
    summary: 'Obtener historial de asistencias de un alumno',
  })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de asistencia recuperado con éxito.',
    content: {
      'application/json': {
        example: [
          {
            id_asistencia: 2,
            fecha: '2025-10-23T00:00:00.000Z',
            estado: 'PERMISO',
            observacion: 'Ausente por cita médica justificada',
            alumno: { id_alumno: 2, nombre: 'Kendel', apellido: 'Arevalo' },
            asignatura: { id_asignatura: 7, nombre: 'Matemáticas' },
            orientador: { id_orientador: 3, nombre: 'Nelson', apellido: 'Medina' },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'El alumno no tiene asistencias registradas.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'El alumno con ID 2 no tiene asistencias registradas.',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async findByAlumno(
    @Param('id_alumno') id_alumno: string,
  ): Promise<AsistenciaResponse[]> {
    return this.asistenciaService.findByAlumno(+id_alumno);
  }

  // 🟠 Actualizar el estado u observación de una asistencia
  @Patch(':id_asistencia')
  @ApiOperation({ summary: 'Actualizar estado u observación de asistencia' })
  @ApiParam({
    name: 'id_asistencia',
    description: 'ID de la asistencia a actualizar',
    type: 'number',
  })
  @ApiBody({
    type: UpdateAsistenciaDto,
    description: 'Datos a actualizar (estado u observación)',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia actualizada exitosamente.',
    content: {
      'application/json': {
        example: {
          id_asistencia: 1,
          estado: 'PRESENTE',
          observacion: 'Llegó puntual y participó activamente',
          alumno: { id_alumno: 2, nombre: 'Kendel', apellido: 'Arevalo' },
          asignatura: { id_asignatura: 7, nombre: 'Matemáticas' },
          orientador: { id_orientador: 3, nombre: 'Nelson', apellido: 'Medina' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'La asistencia no fue encontrada.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'La asistencia con ID 10 no fue encontrada.',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en la actualización.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  async update(
    @Param('id_asistencia') id_asistencia: string,
    @Body() updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaResponse> {
    return this.asistenciaService.update(+id_asistencia, updateAsistenciaDto);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ConductasService } from './conducta.service';
import {
  CreateConductaDto,
  UpdateConductaDto,
  ConductaResponse,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Conducta')
@Controller('conductas')
export class ConductasController {
  constructor(private readonly conductasService: ConductasService) {}

  // 🟢 Crear conducta
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva conducta' })
  @ApiBody({
    type: CreateConductaDto,
    description:
      'Registra una conducta asociada a un alumno. Incluye id_alumno, id_orientador, gravedad, descripción y fecha.',
  })
  @ApiResponse({
    status: 201,
    description: 'Conducta registrada exitosamente',
    type: ConductaResponse,
  })
  @ApiResponse({ status: 404, description: 'Alumno u orientador no encontrado' })
  async create(
    @Body() createConductaDto: CreateConductaDto,
  ): Promise<ConductaResponse> {
    return this.conductasService.create(createConductaDto);
  }

  // 🟣 Obtener conductas por orientador
  @Get('orientador/:id_orientador')
  @ApiOperation({ summary: 'Obtener todas las conductas registradas por un orientador' })
  @ApiParam({
    name: 'id_orientador',
    description: 'ID del orientador (docente) que registró las conductas',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de conductas registradas por el orientador',
    type: [ConductaResponse],
  })
  async findByOrientador(
    @Param('id_orientador') id_orientador: string,
  ): Promise<ConductaResponse[]> {
    return this.conductasService.findByOrientador(+id_orientador);
  }

  // 🔵 Obtener historial de conducta de un alumno
  @Get('alumno/:id_alumno')
  @ApiOperation({ summary: 'Obtener historial de conducta de un alumno' })
  @ApiParam({
    name: 'id_alumno',
    description: 'ID del alumno del cual se desea obtener el historial',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de conducta del alumno',
    type: [ConductaResponse],
  })
  async findByAlumno(
    @Param('id_alumno') id_alumno: string,
  ): Promise<ConductaResponse[]> {
    return this.conductasService.findByAlumno(+id_alumno);
  }

  // 🟠 Obtener conductas de un curso dentro de un rango de fechas (mensual o trimestral)
  @Get('curso/:id_curso')
  @ApiOperation({
    summary: 'Obtener conductas de un curso en un rango de fechas (mensual o trimestral)',
  })
  @ApiParam({
    name: 'id_curso',
    description: 'ID del curso del que se desean obtener las conductas',
    type: Number,
  })
  @ApiQuery({
    name: 'fechaInicio',
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
    required: true,
  })
  @ApiQuery({
    name: 'fechaFin',
    description: 'Fecha final del rango (YYYY-MM-DD)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Conductas obtenidas correctamente dentro del rango solicitado',
    type: [ConductaResponse],
  })
  @ApiResponse({
    status: 404,
    description: 'El curso no tiene alumnos o no hay conductas registradas en el rango',
  })
  async findByCursoYRango(
    @Param('id_curso') id_curso: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<ConductaResponse[]> {
    return this.conductasService.findByCursoYRango(
      +id_curso,
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  // ✏️ Actualizar conducta
  @Patch(':id_conducta')
  @ApiOperation({ summary: 'Actualizar gravedad o descripción de una conducta' })
  @ApiParam({
    name: 'id_conducta',
    description: 'ID de la conducta a actualizar',
    type: Number,
  })
  @ApiBody({
    type: UpdateConductaDto,
    description: 'Datos que se desean actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Conducta actualizada exitosamente',
    type: ConductaResponse,
  })
  async update(
    @Param('id_conducta') id_conducta: string,
    @Body() updateConductaDto: UpdateConductaDto,
  ): Promise<ConductaResponse> {
    return this.conductasService.update(+id_conducta, updateConductaDto);
  }

  // ❌ Eliminar conducta
  @Delete(':id_conducta')
  @ApiOperation({ summary: 'Eliminar una conducta por ID' })
  @ApiParam({
    name: 'id_conducta',
    description: 'ID de la conducta a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Conducta eliminada correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Conducta no encontrada',
  })
  async remove(
    @Param('id_conducta') id_conducta: string,
  ): Promise<{ message: string }> {
    return this.conductasService.remove(+id_conducta);
  }
}

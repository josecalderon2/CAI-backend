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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConductasService } from './conducta.service';
import { CreateConductaDto, UpdateConductaDto, ConductaResponse } from './dto';

@ApiTags('Conducta')
@Controller('conducta')
// @UseGuards(TuGuardiaDeAutenticacion) // Descomenta para proteger las rutas
export class ConductaController {
  constructor(private readonly conductasService: ConductasService) {}

  /**
   * 📌 Crea un nuevo registro de conducta
   */
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva conducta' })
  @ApiResponse({
    status: 201,
    description: 'Conducta registrada exitosamente',
    type: ConductaResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Alumno u orientador no encontrado',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  create(
    @Body() createConductaDto: CreateConductaDto,
  ): Promise<ConductaResponse> {
    return this.conductasService.create(createConductaDto);
  }

  /**
   * ✏️ Actualiza una conducta existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una conducta existente' })
  @ApiParam({ name: 'id', description: 'ID de la conducta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Conducta actualizada exitosamente',
    type: ConductaResponse,
  })
  @ApiResponse({ status: 404, description: 'Conducta no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConductaDto: UpdateConductaDto,
  ): Promise<ConductaResponse> {
    return this.conductasService.update(id, updateConductaDto);
  }

  /**
   * 🔍 Obtiene todas las conductas registradas por un orientador
   */
  @Get('orientador/:id_orientador')
  @ApiOperation({ summary: 'Obtener todas las conductas de un orientador' })
  @ApiParam({
    name: 'id_orientador',
    description: 'ID del orientador',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de conductas del orientador',
    type: [ConductaResponse],
  })
  @ApiResponse({
    status: 404,
    description: 'Orientador sin conductas registradas',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByOrientador(
    @Param('id_orientador', ParseIntPipe) id_orientador: number,
  ): Promise<ConductaResponse[]> {
    return this.conductasService.findByOrientador(id_orientador);
  }

  /**
   * 🔍 Obtiene todas las conductas de un alumno
   */
  @Get('alumno/:id_alumno')
  @ApiOperation({ summary: 'Obtener todas las conductas de un alumno' })
  @ApiParam({ name: 'id_alumno', description: 'ID del alumno', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de conductas del alumno',
    type: [ConductaResponse],
  })
  @ApiResponse({ status: 404, description: 'Alumno sin conductas registradas' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByAlumno(
    @Param('id_alumno', ParseIntPipe) id_alumno: number,
  ): Promise<ConductaResponse[]> {
    return this.conductasService.findByAlumno(id_alumno);
  }

  /**
   * 📅 Filtra conductas por curso y rango de fechas
   */
  @Get('curso/:id_curso')
  @ApiOperation({ summary: 'Filtrar conductas por curso y rango de fechas' })
  @ApiParam({ name: 'id_curso', description: 'ID del curso', type: Number })
  @ApiQuery({
    name: 'fechaInicio',
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'fechaFin',
    description: 'Fecha de fin del rango (YYYY-MM-DD)',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de conductas del curso en el rango de fechas',
    type: [ConductaResponse],
  })
  @ApiResponse({
    status: 404,
    description: 'Curso sin alumnos o sin conductas',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  findByCursoYRango(
    @Param('id_curso', ParseIntPipe) id_curso: number,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<ConductaResponse[]> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return this.conductasService.findByCursoYRango(id_curso, inicio, fin);
  }

  /**
   * ❌ Elimina una conducta por ID
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una conducta' })
  @ApiParam({ name: 'id', description: 'ID de la conducta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Conducta eliminada exitosamente',
    schema: {
      example: { message: 'Conducta 1 eliminada exitosamente.' },
    },
  })
  @ApiResponse({ status: 404, description: 'Conducta no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.conductasService.remove(id);
  }
}

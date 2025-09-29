import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AlumnosService } from './alumnos.service';
import {
  CreateAlumnoDto,
  CreateAlumnoResponsableDto,
  UpdateAlumnoDto,
} from './dto';

@ApiTags('Alumnos')
@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  @ApiOperation({ summary: 'Crear un nuevo alumno' })
  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnosService.create(createAlumnoDto);
  }

  @ApiOperation({ summary: 'Obtener todos los alumnos' })
  @ApiQuery({
    name: 'incluirInactivos',
    required: false,
    type: Boolean,
    description: 'Si es true, incluye alumnos inactivos',
  })
  @Get()
  findAll(@Query('incluirInactivos') incluirInactivos?: string) {
    const incluirInactivosBoolean = incluirInactivos === 'true';
    return this.alumnosService.findAll(incluirInactivosBoolean);
  }

  @ApiOperation({ summary: 'Obtener un alumno por ID' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alumnosService.findOne(+id);
  }

  @ApiOperation({ summary: 'Actualizar datos de un alumno' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlumnoDto: UpdateAlumnoDto) {
    return this.alumnosService.update(+id, updateAlumnoDto);
  }

  @ApiOperation({ summary: 'Desactivar un alumno (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alumnosService.remove(+id);
  }

  @ApiOperation({ summary: 'Reactivar un alumno desactivado' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.alumnosService.restore(+id);
  }

  @ApiOperation({ summary: 'Añadir un responsable a un alumno' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @Post(':id/responsables')
  agregarResponsable(
    @Param('id') id: string,
    @Body() responsableDto: CreateAlumnoResponsableDto,
  ) {
    return this.alumnosService.agregarResponsable(+id, responsableDto);
  }

  @ApiOperation({ summary: 'Actualizar la relación alumno-responsable' })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiParam({
    name: 'responsableId',
    description: 'ID de la relación alumno-responsable',
  })
  @Patch(':id/responsables/:responsableId')
  actualizarResponsable(
    @Param('id') alumnoId: string,
    @Param('responsableId') responsableId: string,
    @Body() responsableDto: CreateAlumnoResponsableDto,
  ) {
    return this.alumnosService.actualizarResponsable(
      +alumnoId,
      +responsableId,
      responsableDto,
    );
  }

  @ApiOperation({
    summary: 'Eliminar la relación entre un alumno y un responsable',
  })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiParam({
    name: 'responsableId',
    description: 'ID de la relación alumno-responsable',
  })
  @Delete(':id/responsables/:responsableId')
  eliminarResponsable(
    @Param('id') alumnoId: string,
    @Param('responsableId') responsableId: string,
  ) {
    return this.alumnosService.eliminarResponsable(+alumnoId, +responsableId);
  }
}

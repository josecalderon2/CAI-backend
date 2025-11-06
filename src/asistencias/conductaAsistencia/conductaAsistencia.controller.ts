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
import { AuthGuard } from '@nestjs/passport';
import { ConductaAsistenciaService } from './conductaAsistencia.service';
import { CreateConductaDto } from './dto/create-conducta.dto';
import { UpdateConductaDto } from './dto/update-conducta.dto';
import { CreateInfraccionCatalogoDto } from './dto/create-infraccion-catalogo.dto';
import { UpdateInfraccionCatalogoDto } from './dto/update-infraccion-catalogo.dto';
import { FiltrosConductaDto } from './dto/filtros-conducta.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Conducta y Catálogo') // Agrupa en Swagger
@Controller('conducta')
// @UseGuards(TuGuardiaDeAutenticacion) // Descomenta para proteger todas las rutas
export class ConductaController {
  constructor(private readonly conductaService: ConductaAsistenciaService) {}

  // ======================================================
  // ===     Rutas: Catálogo de Infracciones            ===
  // ======================================================

  @Post('catalogo')
  createCatalogo(@Body() dto: CreateInfraccionCatalogoDto) {
    return this.conductaService.createCatalogo(dto);
  }

  @Get('catalogo')
  @ApiOperation({
    summary: 'Obtener infracciones activas del catálogo',
    description:
      'Retorna solo las infracciones activas (activo: true). Para obtener todas incluyendo inactivas, usar /catalogo/all',
  })
  findAllCatalogo() {
    return this.conductaService.findAllCatalogo();
  }

  @Get('catalogo/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener TODAS las infracciones del catálogo (incluye inactivas)',
    description:
      'Retorna todas las infracciones del catálogo, tanto activas como inactivas. Solo para administradores.',
  })
  findAllCatalogoIncludingInactive() {
    return this.conductaService.findAllCatalogoIncludingInactive();
  }

  @Get('catalogo/:id')
  findOneCatalogo(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.findOneCatalogo(id);
  }

  @Patch('catalogo/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'P.A')
  updateCatalogo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInfraccionCatalogoDto,
  ) {
    return this.conductaService.updateCatalogo(id, dto);
  }

  @Delete('catalogo/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: 'Desactivar infracción del catálogo (Soft Delete)',
    description:
      'Desactiva una infracción del catálogo marcándola como inactiva (activo: false). ' +
      'Los registros históricos de alumnos con esta infracción se mantienen intactos.',
  })
  removeCatalogo(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.removeCatalogo(id);
  }

  @Patch('catalogo/:id/restore')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  @ApiOperation({
    summary: 'Reactivar infracción del catálogo',
    description:
      'Reactiva una infracción previamente desactivada, marcándola como activa (activo: true). ' +
      'La infracción volverá a estar disponible para asignar a nuevos registros de conducta.',
  })
  restoreCatalogo(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.restoreCatalogo(id);
  }

  // ======================================================
  // ===      Rutas: Instancias de Conducta             ===
  // ======================================================

  @Post()
  create(@Body() dto: CreateConductaDto) {
    return this.conductaService.create(dto);
  }

  @Get()
  findAll() {
    return this.conductaService.findAll();
  }

  @Get('anios-disponibles')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener años académicos disponibles en registros de conducta',
    description:
      'Retorna todos los años académicos que tienen registros de conducta/infracciones. ' +
      'Útil para llenar filtros dinámicamente según los datos existentes en la base de datos.',
  })
  @ApiOkResponse({
    description:
      'Lista de años académicos disponibles con trimestres para cada año.',
    schema: {
      example: {
        anios: [
          {
            anio_academico: '2025',
            trimestres_disponibles: [1, 2, 3],
            total_registros: 45,
          },
          {
            anio_academico: '2024',
            trimestres_disponibles: [1, 2, 3, 4],
            total_registros: 120,
          },
        ],
      },
    },
  })
  getAniosDisponibles() {
    return this.conductaService.getAniosDisponibles();
  }

  @Get('alumnos-con-infracciones')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin', 'P.A')
  @ApiOperation({
    summary: 'GET ALL - Obtener alumnos que tienen infracciones',
    description:
      'Endpoint tipo GET ALL que retorna solo los alumnos que tienen al menos 1 infracción. ' +
      'Los alumnos sin infracciones NO se incluyen en la respuesta. ' +
      'Todos los filtros son OPCIONALES. Sin filtros retorna todos los alumnos con infracciones. ' +
      'Los filtros disponibles son: curso, año académico y trimestre.',
  })
  @ApiQuery({
    name: 'id_curso',
    required: false,
    type: Number,
    description:
      '(OPCIONAL) ID del curso para filtrar. Si no se proporciona, incluye alumnos de todos los cursos.',
  })
  @ApiQuery({
    name: 'anio_academico',
    required: false,
    type: String,
    description:
      '(OPCIONAL) Año académico para filtrar infracciones (ej: 2025). Si no se proporciona, incluye infracciones de todos los años.',
  })
  @ApiQuery({
    name: 'trimestre',
    required: false,
    type: Number,
    description:
      '(OPCIONAL) Trimestre para filtrar infracciones (1-4). Si no se proporciona, incluye infracciones de todos los trimestres.',
  })
  @ApiOkResponse({
    description:
      'Lista de alumnos que tienen infracciones, con sus estadísticas y filtros aplicados. ' +
      'Solo incluye alumnos con al menos 1 infracción.',
  })
  findAlumnosConInfracciones(@Query() filtros: FiltrosConductaDto) {
    return this.conductaService.findAlumnosConInfracciones(filtros);
  }

  @Get('alumno/:id_alumno')
  findByStudent(@Param('id_alumno', ParseIntPipe) id_alumno: number) {
    return this.conductaService.findByStudent(id_alumno);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConductaDto,
  ) {
    return this.conductaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.conductaService.remove(id);
  }
}

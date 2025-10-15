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
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { ListDtoExt } from './dto/list-asignaciones.dto';
import {
  AsignacionResponse,
  PaginadoAsignaciones,
} from './dto/asignacion.response';

@ApiTags('Asignaciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly service: AsignacionesService) {}

  // CREATE
  @Roles('Admin', 'P.A')
  @Post()
  @ApiOperation({ summary: 'Crear asignación (Orientador ↔ Asignatura)' })
  @ApiBody({
    type: CreateAsignacionDto,
    examples: {
      ejemplo: {
        value: {
          id_asignatura: 12,
          id_orientador: 5,
          anio_academico: '2025',
          fecha_asignacion: '2025-01-15T12:00:00.000Z',
          activo: true,
          es_orientador: null,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Asignación creada',
    type: AsignacionResponse,
  })
  create(@Body() dto: CreateAsignacionDto) {
    return this.service.create(dto);
  }

  // GET minimal
  @Roles('Admin', 'P.A')
  @Get()
  @ApiOperation({
    summary: 'Listar asignaciones (filtros opcionales en query)',
  })
  @ApiOkResponse({ type: PaginadoAsignaciones })
  findAll(@Query() query: ListDtoExt) {
    return this.service.findAll(query);
  }

  // DETAIL
  @Roles('Admin', 'P.A')
  @Get(':id')
  @ApiOperation({ summary: 'Detalle de asignación' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: AsignacionResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // UPDATE (PATCH parcial)
  @Roles('Admin', 'P.A')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar asignación (PATCH parcial)' })
  @ApiOkResponse({ type: AsignacionResponse })
  @ApiBody({
    type: UpdateAsignacionDto,
    examples: {
      ejemplo: {
        value: {
          // id_asignatura: 13,
          // id_orientador: 7,
          anio_academico: '2025',
          // fecha_asignacion: '2025-02-01T12:00:00.000Z',
          // fecha_fin: '2025-10-01T00:00:00.000Z',
          // activo: true,
          // es_orientador: false,
          // orientador_principal_id: 9,
          // curso_nombre: '6°',
          // seccion: 'C',
          // nombre_asignatura: 'Matemática I',
          // cargaHorariaSemanal: 5
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAsignacionDto,
  ) {
    return this.service.update(id, dto);
  }

  // SOFT DELETE
  @Roles('Admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar/Finalizar asignación (soft delete)' })
  @ApiOkResponse({ type: AsignacionResponse })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

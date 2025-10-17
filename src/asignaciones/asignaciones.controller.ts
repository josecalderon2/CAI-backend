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
import { HistorialParamsDto } from './dto/historial-params.dto';
import { LogNormalizeQueryPipe } from './dto/pipes/log-normalize-query.pipe';

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
  @ApiBody({ type: CreateAsignacionDto })
  @ApiCreatedResponse({ description: 'Asignación creada', type: AsignacionResponse })
  create(@Body() dto: CreateAsignacionDto) {
    return this.service.create(dto);
  }

  // LIST
  @Roles('Admin', 'P.A')
  @Get()
  @ApiOperation({ summary: 'Listar asignaciones (filtros opcionales en query)' })
  @ApiOkResponse({ type: PaginadoAsignaciones })
  findAll(@Query() query: ListDtoExt) {
    return this.service.findAll(query);
  }

  // HISTORIAL
  @Roles('Admin')
  @Get('historial')
  @ApiOperation({ summary: 'Obtener el historial de las asignaciones' })
  getHistorial(@Query(new LogNormalizeQueryPipe()) query: HistorialParamsDto) {
    return this.service.getHistorial(query);
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
  @ApiBody({ type: UpdateAsignacionDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsignacionDto) {
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

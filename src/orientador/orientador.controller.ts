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
  Req,
} from '@nestjs/common';
import { OrientadorService } from './orientador.service';
import { CreateOrientadorDto } from './dto/create-orientador.dto';
import { UpdateOrientadorDto } from './dto/update-orientador.dto';
import { UpdatePerfilOrientadorDto } from './dto/update-perfil.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Orientador')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('orientador')
export class OrientadorController {
  constructor(private readonly service: OrientadorService) {}

  // --- ENDPOINT PARA LISTAR TODOS LOS ORIENTADORES (para selects/dropdowns) ---
  @Roles('Admin', 'P.A', 'Orientador')
  @Get('all')
  @ApiOperation({
    summary: 'Listar todos los orientadores activos (para selects/dropdowns)',
  })
  @ApiOkResponse({ description: 'Lista simple de orientadores activos' })
  findAllSimple() {
    return this.service.findAllSimple();
  }

  // --- PERFIL (self) PRIMERO para evitar colisión con :id ---
  @Roles('Admin', 'P.A', 'Orientador')
  @Patch('profile')
  @ApiOperation({
    summary: 'Actualizar perfil (nombre, apellido y/o password)',
  })
  @ApiOkResponse({ description: 'Perfil de orientador actualizado' })
  updatePerfil(@Body() dto: UpdatePerfilOrientadorDto, @Req() req: any) {
    const selfId = req.user?.id_orientador ?? req.user?.id ?? req.user?.sub;
    return this.service.updatePerfil(Number(selfId), dto);
  }

  @Roles('Admin')
  @Post()
  @ApiCreatedResponse({
    description:
      'Orientador creado (password auto 4 dígitos enviado al usuario)',
  })
  create(@Body() dto: CreateOrientadorDto) {
    return this.service.create(dto);
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get()
  @ApiOkResponse({ description: 'Lista de orientadores (paginada)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiQuery({ name: 'q', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('activo') activo?: string,
    @Query('q') q?: string,
  ) {
    const activoBool =
      typeof activo === 'string'
        ? activo === 'true'
          ? true
          : activo === 'false'
            ? false
            : undefined
        : undefined;

    return this.service.findAll({
      page: Number(page),
      limit: Number(limit),
      activo: activoBool,
      q,
    });
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de orientador' })
  @ApiNotFoundResponse({ description: 'No encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('Admin')
  @Patch(':id')
  @ApiOkResponse({ description: 'Orientador actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrientadorDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  @ApiOkResponse({ description: 'Orientador desactivado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  @Roles('Admin')
  @Patch(':id/restore')
  @ApiOkResponse({ description: 'Orientador reactivado' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restore(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdministrativoService } from './administrativo.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { UpdateAdministrativoDto } from './dto/update-administrativo.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Administrativo')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard) // protege TODO el controller con JWT + Roles
@Controller('administrativo')
export class AdministrativoController {
  constructor(private readonly service: AdministrativoService) {}

  // SOLO Admin crea
  @Roles('Admin')
  @Post()
  @ApiCreatedResponse({ description: 'Administrativo creado' })
  create(@Body() dto: CreateAdministrativoDto) {
    return this.service.create(dto);
  }

  // Autenticado: listado paginado, filtrado y búsqueda
  @Get()
  @ApiOkResponse({ description: 'Lista paginada de administrativos' })
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

  // Autenticado: detalle por id
  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de un administrativo' })
  @ApiNotFoundResponse({ description: 'No encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // SOLO Admin actualiza
  @Roles('Admin')
  @Patch(':id')
  @ApiOkResponse({ description: 'Administrativo actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdministrativoDto,
  ) {
    return this.service.update(id, dto);
  }

  // SOLO Admin desactiva (soft delete)
  @Roles('Admin')
  @Delete(':id')
  @ApiOkResponse({ description: 'Administrativo desactivado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  // SOLO Admin reactiva
  @Roles('Admin')
  @Patch(':id/restore')
  @ApiOkResponse({ description: 'Administrativo reactivado' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restore(id);
  }
}

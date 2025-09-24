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
import { OrientadorService } from './orientador.service';
import { CreateOrientadorDto } from './dto/create-orientador.dto';
import { UpdateOrientadorDto } from './dto/update-orientador.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiQuery,
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

  @Roles('Admin')
  @Post()
  @ApiCreatedResponse({ description: 'Orientador creado' })
  create(@Body() dto: CreateOrientadorDto) {
    return this.service.create(dto);
  }

  @Roles('Admin')
  @Get()
  @ApiOkResponse({ description: 'Lista de orientadores' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query('activo') activo?: string, @Query('q') q?: string) {
    const activoBool =
      activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.service.findAll({ activo: activoBool, q });
  }

  @Roles('Admin')
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

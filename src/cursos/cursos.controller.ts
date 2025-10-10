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
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { ListCursosDto } from './dto/list-cursos.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CursoCuposDto, ListaCursosCuposDto } from './dto/curso-cupos.dto';

@ApiTags('Cursos')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('cursos')
export class CursosController {
  constructor(private readonly service: CursosService) {}

  @Roles('Admin')
  @Post()
  @ApiCreatedResponse({ description: 'Curso creado' })
  create(@Body() dto: CreateCursoDto) {
    return this.service.create(dto);
  }

  @Roles('Admin', 'P.A')
  @Get()
  @ApiOkResponse({ description: 'Lista de cursos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query() query: ListCursosDto) {
    return this.service.findAll(query as any);
  }

  @Roles('Admin', 'P.A')
  @Get('stats')
  stats() {
    return this.service.stats();
  }

  @Roles('Admin', 'P.A')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('Admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCursoDto) {
    return this.service.update(id, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  @Roles('Admin')
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restore(id);
  }

  @Roles('Admin', 'P.A')
  @Get('cupos/listado')
  @ApiOkResponse({
    description: 'Lista de cursos con información detallada de cupos',
    type: ListaCursosCuposDto,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAllCupos(@Query() query: ListCursosDto) {
    return this.service.findAllCursosCupos(query);
  }

  @Roles('Admin', 'P.A')
  @Get(':id/cupos')
  @ApiOkResponse({
    description: 'Información detallada de cupos para un curso específico',
    type: CursoCuposDto,
  })
  findCursoConCupos(@Param('id', ParseIntPipe) id: number) {
    return this.service.findCursoCupos(id);
  }
}

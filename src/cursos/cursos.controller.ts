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
  ApiOperation,
  ApiParam,
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

  // --- EXISTENTES ---
  @Roles('Admin', 'P.A')
  @Get('all')
  @ApiOperation({
    summary: 'Listar todos los cursos activos (para selects/dropdowns)',
  })
  @ApiOkResponse({ description: 'Lista simple de cursos activos' })
  findAllSimple() {
    return this.service.findAllSimple();
  }

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

  // --- NUEVOS ENDPOINTS PARA TU FRONT ---

  // Cursos asignados a un docente
  @Roles('Admin', 'P.A', 'Orientador') // asegúrate que coincida con tu enum/roles reales
  @Get('asignados/:docenteId')
  @ApiOperation({ summary: 'Cursos asignados a un docente' })
  @ApiParam({ name: 'docenteId', type: Number })
  @ApiOkResponse({
    description: 'Listado de cursos asignados al docente',
  })
  findCursosAsignadosDocente(
    @Param('docenteId', ParseIntPipe) docenteId: number,
  ) {
    return this.service.findCursosAsignadosDocente(docenteId);
  }

  // Alumnos por curso (sin rut)
  @Roles('Admin', 'P.A', 'Orientador')
  @Get(':cursoId/alumnos')
  @ApiOperation({ summary: 'Alumnos matriculados en un curso' })
  @ApiParam({ name: 'cursoId', type: Number })
  @ApiOkResponse({
    description: 'Listado de alumnos del curso',
  })
  getAlumnosPorCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.service.getAlumnosPorCurso(cursoId);
  }
}

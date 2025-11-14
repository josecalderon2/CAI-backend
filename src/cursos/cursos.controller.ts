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
  Request,
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

  // --- ENDPOINT PARA LISTAR TODOS LOS CURSOS ACTIVOS (para selects/dropdowns) ---
  @Roles('Admin', 'P.A')
  @Get('all')
  @ApiOperation({
    summary: 'Listar todos los cursos activos (para selects/dropdowns)',
  })
  @ApiOkResponse({ description: 'Lista simple de cursos activos' })
  findAllSimple() {
    return this.service.findAllSimple();
  }

  /**
   * GET /cursos/mis-cursos
   * Obtiene los cursos asignados al docente/orientador autenticado
   * Usa el token JWT para identificar al usuario automáticamente
   *
   * Ventajas de seguridad:
   * - No expone todos los cursos del sistema
   * - Valida el token JWT en cada request
   * - Solo retorna cursos autorizados para el usuario
   */
  @Get('mis-cursos')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener mis cursos asignados (usuario autenticado)',
    description:
      'Retorna todos los cursos donde el usuario autenticado tiene algún rol: orientador titular, en historial vigente o con asignaturas asignadas. Usa automáticamente el ID del usuario del token JWT.',
  })
  @ApiOkResponse({
    description: 'Lista de cursos asignados al usuario autenticado',
  })
  async getMisCursos(@Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userTipo = req.user.tipo;

    console.log(
      `🔍 Usuario autenticado: ID=${userId}, Role=${userRole}, Tipo=${userTipo}`,
    );

    // Si es Admin o P.A, retornar todos los cursos
    if (userRole === 'Admin' || userRole === 'P.A') {
      console.log('👑 Usuario es Admin/P.A - Retornando todos los cursos');
      return this.service.findAllCursosConRelaciones();
    }

    // Si es Orientador, retornar solo sus cursos asignados
    return this.service.findCursosByOrientador(userId);
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

  /**
   * Obtener cursos asignados a un orientador específico
   * Incluye cursos donde el orientador:
   * - Es el orientador titular (id_orientador)
   * - Está en el historial vigente
   * - Tiene asignaturas asignadas
   */
  @Get('asignados/:orientadorId')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener cursos asignados a un orientador',
    description:
      'Retorna todos los cursos donde el orientador tiene algún rol: titular, en historial vigente o con asignaturas asignadas',
  })
  @ApiOkResponse({
    description: 'Lista de cursos asignados al orientador',
  })
  async findCursosAsignadosDocente(
    @Param('orientadorId', ParseIntPipe) orientadorId: number,
  ) {
    return this.service.findCursosAsignadosDocente(orientadorId);
  }

  /**
   * Obtener alumnos de un curso específico
   * Retorna la lista de alumnos matriculados en el curso
   */
  @Get(':id/alumnos')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener alumnos de un curso',
    description:
      'Retorna todos los alumnos matriculados en un curso específico',
  })
  @ApiOkResponse({
    description: 'Lista de alumnos del curso',
  })
  async getAlumnosPorCurso(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAlumnosPorCurso(id);
  }

  /**
   * Obtener alumnos de un curso filtrados por año académico
   * Retorna la lista de alumnos inscritos en el curso para un año específico
   */
  @Get(':id/alumnos-por-anio')
  @Roles('Orientador', 'Admin', 'P.A')
  @ApiOperation({
    summary: 'Obtener alumnos de un curso por año académico',
    description:
      'Retorna todos los alumnos inscritos en un curso para un año académico específico. ' +
      'Útil para dropdowns en reportes y boletas.',
  })
  @ApiOkResponse({
    description: 'Lista de alumnos del curso filtrados por año académico',
  })
  async getAlumnosPorCursoYAnio(
    @Param('id', ParseIntPipe) id: number,
    @Query('anio') anio: string,
  ) {
    if (!anio) {
      anio = new Date().getFullYear().toString();
    }
    return this.service.getAlumnosPorCursoYAnio(id, anio);
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

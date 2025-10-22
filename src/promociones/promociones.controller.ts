import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import {
  PromoverAlumnoDto,
  PromocionMasivaDto,
  FinalizarAlumnoDto,
} from './dto/promociones.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Promociones')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Roles('Admin', 'P.A')
  @Post('promover-alumno')
  @ApiOperation({ summary: 'Promover un alumno a un nuevo curso' })
  @ApiResponse({
    status: 200,
    description: 'El alumno ha sido promovido exitosamente',
  })
  promoverAlumno(@Body() dto: PromoverAlumnoDto) {
    return this.promocionesService.promoverAlumno(dto);
  }

  @Roles('Admin', 'P.A')
  @Post('finalizar-alumno')
  @ApiOperation({ summary: 'Marcar a un alumno como finalizado (graduado)' })
  @ApiResponse({
    status: 200,
    description: 'El alumno ha finalizado exitosamente sus estudios',
  })
  finalizarAlumno(@Body() dto: FinalizarAlumnoDto) {
    return this.promocionesService.finalizarAlumno(dto);
  }

  @Roles('Admin', 'P.A')
  @Post('promociones-masivas')
  @ApiOperation({ summary: 'Procesar promociones masivas de alumnos' })
  @ApiResponse({
    status: 200,
    description: 'Promociones masivas procesadas exitosamente',
  })
  procesarPromocionMasiva(@Body() dto: PromocionMasivaDto) {
    return this.promocionesService.procesarPromocionMasiva(dto);
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('historial/:alumnoId')
  @ApiOperation({ summary: 'Obtener historial académico de un alumno' })
  @ApiResponse({
    status: 200,
    description: 'Historial académico obtenido exitosamente',
  })
  @ApiParam({ name: 'alumnoId', description: 'ID del alumno', type: 'number' })
  obtenerHistorialAcademico(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.promocionesService.obtenerHistorialAcademico(alumnoId);
  }

  @Roles('Admin', 'P.A')
  @Get('alumnos-por-curso/:cursoId')
  @ApiOperation({
    summary: 'Obtener alumnos de un curso para pantalla de promoción',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alumnos obtenida exitosamente',
  })
  @ApiParam({ name: 'cursoId', description: 'ID del curso', type: 'number' })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico',
    required: true,
  })
  obtenerAlumnosPorCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promocionesService.obtenerAlumnosPorCursoParaPromocion(
      cursoId,
      anioAcademico,
    );
  }

  @Roles('Admin', 'P.A')
  @Get('cursos-para-promocion/:gradoAcademicoId')
  @ApiOperation({ summary: 'Obtener cursos disponibles para promoción' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos obtenida exitosamente',
  })
  @ApiParam({
    name: 'gradoAcademicoId',
    description: 'ID del grado académico actual',
    type: 'number',
  })
  @ApiQuery({
    name: 'anioAcademico',
    description: 'Año académico para filtrar cursos',
    required: true,
  })
  obtenerCursosParaPromocion(
    @Param('gradoAcademicoId', ParseIntPipe) gradoAcademicoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.promocionesService.obtenerCursosParaPromocion(
      gradoAcademicoId,
      anioAcademico,
    );
  }
}

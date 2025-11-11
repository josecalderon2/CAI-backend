import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminConsultaNotasService } from './admin-consulta-notas.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin-consulta-notas')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminConsultaNotasController {
  constructor(
    private readonly adminConsultaNotasService: AdminConsultaNotasService,
  ) {}

  /**
   * Obtiene todas las evaluaciones de un curso con sus calificaciones
   * Solo para Admin y P.A
   */
  @Get('curso/evaluaciones')
  @Roles('Admin', 'P.A')
  async obtenerEvaluacionesCurso(
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
    @Query('asignaturaId') asignaturaId?: string,
  ) {
    const asignaturaIdNum = asignaturaId ? parseInt(asignaturaId) : undefined;

    return this.adminConsultaNotasService.obtenerEvaluacionesCurso(
      cursoId,
      anioAcademico,
      asignaturaIdNum,
    );
  }

  /**
   * Obtiene las calificaciones de una evaluación específica
   * Solo para Admin y P.A
   */
  @Get('evaluacion/calificaciones')
  @Roles('Admin', 'P.A')
  async obtenerCalificacionesPorEvaluacion(
    @Query('evaluacionId', ParseIntPipe) evaluacionId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.adminConsultaNotasService.obtenerCalificacionesPorEvaluacion(
      evaluacionId,
      anioAcademico,
    );
  }

  /**
   * Obtiene el resumen de promedios de un curso
   * Solo para Admin y P.A
   */
  @Get('curso/promedios')
  @Roles('Admin', 'P.A')
  async obtenerResumenPromediosCurso(
    @Query('cursoId', ParseIntPipe) cursoId: number,
    @Query('anioAcademico') anioAcademico: string,
  ) {
    return this.adminConsultaNotasService.obtenerResumenPromediosCurso(
      cursoId,
      anioAcademico,
    );
  }
}

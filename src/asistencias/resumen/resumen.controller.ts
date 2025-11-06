import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResumenService } from './resumen.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ResumenMensualDto } from './dto/resumen-mensual.dto';
import { ResumenTrimestralDto } from './dto/resumen-trimestral.dto';
import { ResumenTrimestralResponseDto } from './dto/resumen-trimestral-response.dto';
import { ResumenAnualDto } from './dto/resumen-anual.dto';
import { ResumenAnualResponseDto } from './dto/resumen-anual-response.dto';
import { ResumenTrimestralConsolidadoDto } from './dto/resumen-trimestral-consolidado.dto';
import { ResumenTrimestralConsolidadoResponseDto } from './dto/resumen-trimestral-consolidado-response.dto';

@ApiTags('Resumen (Vistas Consolidadas)')
@Controller('resumen')
// @UseGuards(TuGuardiaDeAutenticacion) // Proteger
export class ResumenController {
  constructor(private readonly resumenService: ResumenService) {}

  /**
   * Endpoint para la vista de 'Consolidado Mensual'
   * Reemplaza a Consolidados.csv
   */
  @Get('asistencia-mensual')
  getResumenMensualAsistencia(@Query() query: ResumenMensualDto) {
    return this.resumenService.getResumenMensualAsistencia(query);
  }

  /**
   * Endpoint para la vista de 'Resumen Trimestral'
   * Reemplaza a Trimestral.csv
   *
   * CÁLCULO DE CONDUCTA:
   * - Puntuación base: 10 puntos
   * - Descuentos:
   *   - Ausencias Sin Permiso (SP): -0.2 puntos c/u
   *   - Infracciones Menos Graves: -1 punto c/u
   *   - Infracciones Graves: -2 puntos c/u
   *   - Infracciones Muy Graves: -3 puntos c/u
   *
   * Fórmula: 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
   */
  @Get('trimestral')
  @ApiOperation({
    summary: 'Obtiene el resumen trimestral de asistencia y conducta',
    description:
      'Devuelve un resumen consolidado por alumno que incluye: ' +
      'ausencias justificadas/injustificadas, infracciones por categoría, ' +
      'y la puntuación de conducta calculada según la fórmula oficial.',
  })
  @ApiOkResponse({
    description: 'Resumen trimestral con cálculo de conducta',
    type: [ResumenTrimestralResponseDto],
  })
  getResumenTrimestral(
    @Query() query: ResumenTrimestralDto,
  ): Promise<ResumenTrimestralResponseDto[]> {
    return this.resumenService.getResumenTrimestral(query);
  }

  /**
   * Endpoint para la vista de 'Resumen Anual'
   * Consolida los datos de los 4 trimestres del año académico
   *
   * CÁLCULO DE CONDUCTA ANUAL:
   * - Puntuación base: 10 puntos
   * - Descuentos:
   *   - Ausencias Sin Permiso (SP): -0.2 puntos c/u
   *   - Infracciones Menos Graves: -1 punto c/u
   *   - Infracciones Graves: -2 puntos c/u
   *   - Infracciones Muy Graves: -3 puntos c/u
   *
   * Fórmula: 10 - (SP × 0.2) - (Menos Graves × 1) - (Graves × 2) - (Muy Graves × 3)
   * Se aplica sobre los totales anuales agregados de los 4 trimestres.
   */
  @Get('anual')
  @ApiOperation({
    summary: 'Obtiene el resumen anual de asistencia y conducta',
    description:
      'Devuelve un resumen consolidado anual por alumno que incluye: ' +
      'totales anuales de ausencias justificadas/injustificadas, atrasos, ' +
      'infracciones por categoría, puntuación de conducta anual, ' +
      'y desglose trimestral con puntuaciones individuales por trimestre.',
  })
  @ApiOkResponse({
    description: 'Resumen anual con desglose trimestral y cálculo de conducta',
    type: [ResumenAnualResponseDto],
  })
  getResumenAnual(
    @Query() query: ResumenAnualDto,
  ): Promise<ResumenAnualResponseDto[]> {
    return this.resumenService.getResumenAnual(query);
  }

  /**
   * Endpoint para el 'Reporte Trimestral Consolidado'
   * Genera un reporte completo con todos los trimestres del año para cada alumno.
   *
   * Este endpoint es ideal para:
   * - Generar reportes anuales con el detalle trimestre por trimestre
   * - Ver la evolución de cada estudiante a lo largo del año
   * - Exportar datos completos para análisis o impresión
   *
   * A diferencia del endpoint 'anual' que solo muestra totales agregados,
   * este muestra el detalle completo de cada trimestre individual.
   */
  @Get('trimestral-consolidado')
  @ApiOperation({
    summary: 'Obtiene el reporte trimestral consolidado del año académico',
    description:
      'Devuelve un reporte completo por alumno con los datos detallados ' +
      'de cada uno de los 4 trimestres del año, incluyendo: ' +
      'asistencias, infracciones, puntuaciones por trimestre, ' +
      'totales anuales y promedio de puntuaciones trimestrales.',
  })
  @ApiOkResponse({
    description:
      'Reporte trimestral consolidado con todos los trimestres del año',
    type: [ResumenTrimestralConsolidadoResponseDto],
  })
  getResumenTrimestralConsolidado(
    @Query() query: ResumenTrimestralConsolidadoDto,
  ): Promise<ResumenTrimestralConsolidadoResponseDto[]> {
    return this.resumenService.getResumenTrimestralConsolidado(query);
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResumenService } from './resumen.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ResumenMensualDto } from './dto/resumen-mensual.dto';
import { ResumenTrimestralDto } from './dto/resumen-trimestral.dto';
import { ResumenTrimestralResponseDto } from './dto/resumen-trimestral-response.dto';

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
}

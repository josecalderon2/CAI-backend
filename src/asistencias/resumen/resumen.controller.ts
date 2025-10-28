import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResumenService } from './resumen.service';
import { ApiTags } from '@nestjs/swagger';
import { ResumenMensualDto } from './dto/resumen-mensual.dto';
import { ResumenTrimestralDto } from './dto/resumen-trimestral.dto';

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
   */
  @Get('trimestral')
  getResumenTrimestral(@Query() query: ResumenTrimestralDto) {
    return this.resumenService.getResumenTrimestral(query);
  }
}
